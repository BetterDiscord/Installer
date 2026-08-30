package discord

import (
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/shirou/gopsutil/v3/process"
)

// killWaitTimeout bounds how long kill() waits for Discord's processes to fully
// exit after being signaled. Discord runs several processes; killing only
// signals termination, so we wait for them to actually die (releasing their lock
// on app.asar) before the caller touches it.
const killWaitTimeout = 10 * time.Second

// processHandle is the slice of gopsutil's *process.Process this file actually
// uses. Going through an interface lets the enumerate-and-match logic be tested
// against a fake process table instead of whatever happens to be running.
type processHandle interface {
	Pid() int32
	Name() (string, error)
	Status() ([]string, error)
	Exe() (string, error)
	Kill() error
}

// gopsutilProcess adapts *process.Process to processHandle; gopsutil exposes the
// pid as a struct field rather than a method.
type gopsutilProcess struct {
	*process.Process
}

func (p gopsutilProcess) Pid() int32 {
	return p.Process.Pid
}

// listProcesses enumerates the running processes. It is a variable so tests can
// swap in a fake process table.
var listProcesses = func() ([]processHandle, error) {
	processes, err := process.Processes()
	if err != nil {
		return nil, err
	}

	handles := make([]processHandle, 0, len(processes))
	for _, p := range processes {
		handles = append(handles, gopsutilProcess{p})
	}
	return handles, nil
}

// exitTimeoutError reports that Discord's processes were signaled successfully
// but were still present when the wait timed out. That is a different situation
// from failing to signal them at all, so stop() can give more useful advice.
type exitTimeoutError struct {
	name    string
	timeout time.Duration
	pids    []int32
}

func (err *exitTimeoutError) Error() string {
	if len(err.pids) == 0 {
		return fmt.Sprintf("%s did not exit within %s", err.name, err.timeout)
	}

	pids := make([]string, 0, len(err.pids))
	for _, pid := range err.pids {
		pids = append(pids, strconv.Itoa(int(pid)))
	}
	return fmt.Sprintf("%s did not exit within %s (still running: pid %s)", err.name, err.timeout, strings.Join(pids, ", "))
}

// stop terminates Discord if it is running. The new injection method modifies
// app.asar, which the running Discord process holds a lock on, so Discord must
// be stopped before inject/uninject can touch it. It returns the executable path
// of the killed process (captured before the kill, for a later start) and whether
// Discord was running. Flatpak/Snap relaunch via their own run commands and don't
// use the exe.
func (discord *DiscordInstall) stop() (exe string, wasRunning bool, err error) {
	// If we can't even determine whether Discord is running, don't gamble on
	// touching app.asar — it may be locked. Fail with an actionable message
	// rather than letting inject/uninject surface a confusing file error.
	running, err := discord.isRunning()
	if err != nil {
		log.Printf("❌ Unable to determine whether %s is running. Please close it and try again.\n", discord.Channel.Name())
		log.Printf("   %s\n", err.Error())
		return "", false, err
	}
	if !running {
		log.Printf("✅ %s is not running.\n", discord.Channel.Name())
		return "", false, nil
	}

	// Capture the executable before killing — afterward the process is gone.
	exe = discord.getFullExe()

	if err := discord.kill(killWaitTimeout); err != nil {
		// "Please close it and try again" is bad advice when Discord was already
		// asked to close and simply hasn't; say what actually happened instead.
		var timeoutErr *exitTimeoutError
		if errors.As(err, &timeoutErr) {
			log.Printf("❌ %s was closed but has not exited yet. Please end it manually and try again.\n", discord.Channel.Name())
		} else {
			log.Printf("❌ Unable to stop %s. Please close it and try again.\n", discord.Channel.Name())
		}
		log.Printf("   %s\n", err.Error())
		return exe, true, err
	}

	log.Printf("✅ Stopped %s\n", discord.Channel.Name())
	return exe, true, nil
}

// start launches Discord. exe is the executable path captured by stop() and is
// used for native installs; Flatpak/Snap launch via their run commands.
func (discord *DiscordInstall) start(exe string) error {
	// Determine command based on installation type
	var cmd *exec.Cmd
	if discord.IsFlatpak {
		cmd = exec.Command("flatpak", "run", "com.discordapp."+discord.Channel.Exe())
	} else if discord.IsSnap {
		cmd = exec.Command("snap", "run", discord.Channel.Exe())
	} else {
		// Use binary found while killing the process for non-Flatpak/Snap installs
		if exe == "" {
			log.Printf("❌ Unable to restart %s, please do so manually.\n", discord.Channel.Name())
			return fmt.Errorf("could not determine executable path for %s", discord.Channel.Name())
		}
		cmd = exec.Command(exe)
	}

	// Set working directory to user home
	cmd.Dir, _ = os.UserHomeDir()

	if err := cmd.Start(); err != nil {
		log.Printf("❌ Unable to restart %s, please do so manually.\n", discord.Channel.Name())
		log.Printf("   %s\n", err.Error())
		return err
	}
	log.Printf("✅ Restarted %s\n", discord.Channel.Name())
	return nil
}

// liveProcesses returns every live process whose name matches this channel's
// executable. Zombies are deliberately excluded: a zombie has already
// terminated and closed its file descriptors, so it holds no lock on app.asar,
// and no signal can make it leave the process table — only its parent reaping
// it will. Treating one as running made stop() signal it and then wait for an
// exit that could never happen, failing with "Unable to stop Discord" while the
// user saw no Discord at all.
func (discord *DiscordInstall) liveProcesses() ([]processHandle, error) {
	name := discord.Channel.Exe()
	processes, err := listProcesses()

	// If we can't even list processes, bail out. Wrap the underlying error so
	// callers (e.g. waitForExit) can surface the real cause instead of a bare
	// "could not list processes".
	if err != nil {
		return nil, fmt.Errorf("could not list processes: %w", err)
	}

	// Search for desired process(es)
	var matches []processHandle
	for _, p := range processes {
		n, err := p.Name()

		// Ignore processes requiring Admin/Sudo
		if err != nil {
			continue
		}

		if n != name {
			continue
		}

		// Only ever check the status of a process whose name already matched: on
		// darwin gopsutil implements Status() by shelling out to `ps`, which is
		// far too expensive to run against every process on the system.
		if isZombie(p) {
			continue
		}

		matches = append(matches, p)
	}

	return matches, nil
}

// isZombie reports whether a process has terminated but not yet been reaped by
// its parent. A status we can't read is treated as "not a zombie" so that a
// transient failure (a `ps` hiccup on darwin, a permission error) can never
// make a genuinely running Discord invisible to stop().
func isZombie(p processHandle) bool {
	statuses, err := p.Status()
	if err != nil {
		return false
	}

	for _, status := range statuses {
		if status == process.Zombie {
			return true
		}
	}
	return false
}

// isProcessGone reports whether a signal failed because its target had already
// exited. That's the outcome kill() wants, not a failure — the process table is
// a snapshot, so a process can die between enumeration and the signal.
func isProcessGone(err error) bool {
	return errors.Is(err, os.ErrProcessDone) || errors.Is(err, syscall.ESRCH)
}

func (discord *DiscordInstall) isRunning() (bool, error) {
	matches, err := discord.liveProcesses()
	if err != nil {
		return false, err
	}
	return len(matches) > 0, nil
}

func (discord *DiscordInstall) kill(timeout time.Duration) error {
	matches, err := discord.liveProcesses()

	// If we can't even list processes, bail out. Preserve the underlying error so
	// a genuine enumeration failure is distinguishable from Discord still running
	// (the caller's wait-for-exit surfaces the latter separately).
	if err != nil {
		return err
	}

	// Kill every match we found
	signaled := false
	for _, p := range matches {
		killErr := p.Kill()

		// We found it but can't kill it, bail out
		if killErr != nil && !isProcessGone(killErr) {
			return fmt.Errorf("could not stop %s (pid %d): %w", discord.Channel.Name(), p.Pid(), killErr)
		}
		signaled = true
	}

	if !signaled {
		return nil
	}

	// Kill() only signals termination; wait for the processes to actually exit so
	// their lock on app.asar is released before the caller modifies it.
	return discord.waitForExit(timeout)
}

// waitForExit blocks until no live process matching the channel's executable
// remains, or the timeout elapses. A transient enumeration error is treated as
// "not yet confirmed exited" and retried rather than failing outright. If the
// most recent check couldn't enumerate processes at all, the timeout surfaces
// that underlying error instead of a misleading "did not exit" — otherwise a
// persistent enumeration failure would send users chasing a lock that may not
// exist.
func (discord *DiscordInstall) waitForExit(timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	var lastErr error
	var remaining []int32
	for {
		matches, err := discord.liveProcesses()
		switch {
		case err != nil:
			// Couldn't confirm state this round; remember why in case we time out
			// with the failure still unresolved.
			lastErr = err
		case len(matches) == 0:
			return nil
		default:
			// Clean read that still shows Discord running: the process, not
			// enumeration, is the holdup — clear any stale earlier error and note
			// which pids are stuck so the timeout can name them.
			lastErr = nil
			remaining = remaining[:0]
			for _, p := range matches {
				remaining = append(remaining, p.Pid())
			}
		}
		if time.Now().After(deadline) {
			if lastErr != nil {
				return fmt.Errorf("could not confirm %s exited within %s: %w", discord.Channel.Name(), timeout, lastErr)
			}
			return &exitTimeoutError{name: discord.Channel.Name(), timeout: timeout, pids: remaining}
		}
		time.Sleep(150 * time.Millisecond)
	}
}

func (discord *DiscordInstall) getFullExe() string {
	matches, err := discord.liveProcesses()
	if err != nil {
		return ""
	}

	for _, p := range matches {
		if exe, err := p.Exe(); err == nil && len(exe) > 0 {
			return exe
		}
	}
	return ""
}
