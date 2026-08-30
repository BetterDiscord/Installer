package discord

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"syscall"
	"testing"
	"time"

	"github.com/shirou/gopsutil/v3/process"

	"installer/types"
)

// fakeProcess is a scriptable stand-in for a real OS process so the
// enumerate-and-match logic can be exercised without anything actually running.
type fakeProcess struct {
	pid       int32
	name      string
	nameErr   error
	statuses  []string
	statusErr error
	exe       string
	exeErr    error
	killErr   error

	statusCalls int
	killCalls   int
}

func (p *fakeProcess) Pid() int32 { return p.pid }

func (p *fakeProcess) Name() (string, error) { return p.name, p.nameErr }

func (p *fakeProcess) Status() ([]string, error) {
	p.statusCalls++
	return p.statuses, p.statusErr
}

func (p *fakeProcess) Exe() (string, error) { return p.exe, p.exeErr }

func (p *fakeProcess) Kill() error {
	p.killCalls++
	return p.killErr
}

// testChannel is the channel every test matches against; using Exe() rather than
// a literal keeps these tests correct on every OS.
const testChannel = types.Stable

func testInstall() *DiscordInstall {
	return &DiscordInstall{Channel: testChannel}
}

// matchingName is what a process must report to be considered Discord.
func matchingName() string { return testChannel.Exe() }

// rounds builds a process lister that returns each round in turn, repeating the
// final one. This lets a test model a process table that changes between the
// initial enumeration and the subsequent wait-for-exit polls.
func rounds(tables ...[]*fakeProcess) func() ([]processHandle, error) {
	call := 0
	return func() ([]processHandle, error) {
		table := tables[len(tables)-1]
		if call < len(tables) {
			table = tables[call]
		}
		call++

		handles := make([]processHandle, 0, len(table))
		for _, p := range table {
			handles = append(handles, p)
		}
		return handles, nil
	}
}

// failingLister models process enumeration failing outright.
func failingLister(err error) func() ([]processHandle, error) {
	return func() ([]processHandle, error) { return nil, err }
}

// useProcesses swaps in a fake process table for the duration of the test.
func useProcesses(t *testing.T, lister func() ([]processHandle, error)) {
	t.Helper()
	original := listProcesses
	listProcesses = lister
	t.Cleanup(func() { listProcesses = original })
}

func pidsOf(t *testing.T, handles []processHandle) []int32 {
	t.Helper()
	pids := make([]int32, 0, len(handles))
	for _, handle := range handles {
		pids = append(pids, handle.Pid())
	}
	return pids
}

func samePids(a, b []int32) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func TestLiveProcesses(t *testing.T) {
	enumerationErr := errors.New("permission denied")

	tests := []struct {
		name      string
		lister    func() ([]processHandle, error)
		wantPids  []int32
		wantErrIs error
	}{
		{
			name:     "running process matches",
			lister:   rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Running}}}),
			wantPids: []int32{10},
		},
		{
			name:     "zombie is not running",
			lister:   rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Zombie}}}),
			wantPids: []int32{},
		},
		{
			name: "only the live process of a mixed table matches",
			lister: rounds([]*fakeProcess{
				{pid: 10, name: matchingName(), statuses: []string{process.Zombie}},
				{pid: 11, name: matchingName(), statuses: []string{process.Sleep}},
			}),
			wantPids: []int32{11},
		},
		{
			name:     "unreadable status counts as live",
			lister:   rounds([]*fakeProcess{{pid: 10, name: matchingName(), statusErr: errors.New("ps failed")}}),
			wantPids: []int32{10},
		},
		{
			name:     "unreadable name is skipped",
			lister:   rounds([]*fakeProcess{{pid: 10, nameErr: errors.New("access is denied")}}),
			wantPids: []int32{},
		},
		{
			name:     "unrelated process is skipped",
			lister:   rounds([]*fakeProcess{{pid: 10, name: "Firefox", statuses: []string{process.Running}}}),
			wantPids: []int32{},
		},
		{
			name:      "enumeration failure is surfaced",
			lister:    failingLister(enumerationErr),
			wantErrIs: enumerationErr,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			useProcesses(t, tt.lister)

			matches, err := testInstall().liveProcesses()
			if tt.wantErrIs != nil {
				if !errors.Is(err, tt.wantErrIs) {
					t.Fatalf("liveProcesses() error = %v, expected to wrap %v", err, tt.wantErrIs)
				}
				return
			}
			if err != nil {
				t.Fatalf("liveProcesses() unexpected error = %v", err)
			}

			if pids := pidsOf(t, matches); !samePids(pids, tt.wantPids) {
				t.Errorf("liveProcesses() pids = %v, expected %v", pids, tt.wantPids)
			}
		})
	}
}

// Status() shells out to `ps` on darwin, so it must only ever be consulted for
// processes whose name already matched — never across the whole process table.
func TestLiveProcessesOnlyChecksStatusOfNameMatches(t *testing.T) {
	unrelated := &fakeProcess{pid: 10, name: "Firefox"}
	matching := &fakeProcess{pid: 11, name: matchingName(), statuses: []string{process.Running}}
	useProcesses(t, rounds([]*fakeProcess{unrelated, matching}))

	if _, err := testInstall().liveProcesses(); err != nil {
		t.Fatalf("liveProcesses() unexpected error = %v", err)
	}

	if unrelated.statusCalls != 0 {
		t.Errorf("Status() called %d times for an unrelated process, expected 0", unrelated.statusCalls)
	}
	if matching.statusCalls != 1 {
		t.Errorf("Status() called %d times for a matching process, expected 1", matching.statusCalls)
	}
}

func TestIsRunning(t *testing.T) {
	tests := []struct {
		name     string
		lister   func() ([]processHandle, error)
		expected bool
		wantErr  bool
	}{
		{
			name:     "live Discord is running",
			lister:   rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Running}}}),
			expected: true,
		},
		{
			name:     "zombie Discord is not running",
			lister:   rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Zombie}}}),
			expected: false,
		},
		{
			name:     "empty process table is not running",
			lister:   rounds([]*fakeProcess{}),
			expected: false,
		},
		{
			name:    "enumeration failure errors",
			lister:  failingLister(errors.New("boom")),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			useProcesses(t, tt.lister)

			running, err := testInstall().isRunning()
			if (err != nil) != tt.wantErr {
				t.Fatalf("isRunning() error = %v, wantErr %v", err, tt.wantErr)
			}
			if running != tt.expected {
				t.Errorf("isRunning() = %v, expected %v", running, tt.expected)
			}
		})
	}
}

func TestKill(t *testing.T) {
	// A process that dies between the enumeration snapshot and the signal reports
	// ESRCH (or os.ErrProcessDone, which wraps it); that is success, not failure.
	vanishedDone := &fakeProcess{pid: 10, name: matchingName(), killErr: os.ErrProcessDone}
	vanishedESRCH := &fakeProcess{pid: 11, name: matchingName(), killErr: syscall.ESRCH}
	wrappedESRCH := &fakeProcess{pid: 12, name: matchingName(), killErr: fmt.Errorf("signal failed: %w", syscall.ESRCH)}
	unkillable := &fakeProcess{pid: 13, name: matchingName(), killErr: errors.New("operation not permitted")}
	zombie := &fakeProcess{pid: 14, name: matchingName(), statuses: []string{process.Zombie}}
	stuck := &fakeProcess{pid: 15, name: matchingName(), statuses: []string{process.Running}}

	tests := []struct {
		name        string
		lister      func() ([]processHandle, error)
		target      *fakeProcess
		wantKills   int
		wantErr     bool
		wantTimeout bool
	}{
		{
			name:      "nothing to kill succeeds",
			lister:    rounds([]*fakeProcess{}),
			wantKills: 0,
		},
		{
			name:      "zombie is never signaled",
			lister:    rounds([]*fakeProcess{zombie}),
			target:    zombie,
			wantKills: 0,
		},
		{
			name:      "process gone before the signal succeeds",
			lister:    rounds([]*fakeProcess{vanishedDone}, []*fakeProcess{}),
			target:    vanishedDone,
			wantKills: 1,
		},
		{
			name:      "ESRCH from the signal succeeds",
			lister:    rounds([]*fakeProcess{vanishedESRCH}, []*fakeProcess{}),
			target:    vanishedESRCH,
			wantKills: 1,
		},
		{
			name:      "wrapped ESRCH from the signal succeeds",
			lister:    rounds([]*fakeProcess{wrappedESRCH}, []*fakeProcess{}),
			target:    wrappedESRCH,
			wantKills: 1,
		},
		{
			name:      "a real signal failure is reported",
			lister:    rounds([]*fakeProcess{unkillable}),
			target:    unkillable,
			wantKills: 1,
			wantErr:   true,
		},
		{
			name:        "a process that never exits times out",
			lister:      rounds([]*fakeProcess{stuck}),
			target:      stuck,
			wantKills:   1,
			wantErr:     true,
			wantTimeout: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			useProcesses(t, tt.lister)
			if tt.target != nil {
				tt.target.killCalls = 0
			}

			// A zero timeout still polls once before giving up, keeping the
			// timeout cases fast.
			err := testInstall().kill(0)
			if (err != nil) != tt.wantErr {
				t.Fatalf("kill() error = %v, wantErr %v", err, tt.wantErr)
			}

			var timeoutErr *exitTimeoutError
			if got := errors.As(err, &timeoutErr); got != tt.wantTimeout {
				t.Errorf("kill() returned an exit timeout = %v, expected %v (err = %v)", got, tt.wantTimeout, err)
			}

			if tt.target != nil && tt.target.killCalls != tt.wantKills {
				t.Errorf("Kill() called %d times, expected %d", tt.target.killCalls, tt.wantKills)
			}
		})
	}
}

// The stuck pid belongs in the error so a user reporting the failure says which
// process to end.
func TestKillTimeoutNamesStuckProcess(t *testing.T) {
	stuck := &fakeProcess{pid: 4242, name: matchingName(), statuses: []string{process.Running}}
	useProcesses(t, rounds([]*fakeProcess{stuck}))

	err := testInstall().kill(0)

	var timeoutErr *exitTimeoutError
	if !errors.As(err, &timeoutErr) {
		t.Fatalf("kill() error = %v, expected an *exitTimeoutError", err)
	}
	if !samePids(timeoutErr.pids, []int32{4242}) {
		t.Errorf("timeout pids = %v, expected [4242]", timeoutErr.pids)
	}
	if message := timeoutErr.Error(); !strings.Contains(message, "4242") {
		t.Errorf("timeout message = %q, expected it to name pid 4242", message)
	}
}

func TestWaitForExit(t *testing.T) {
	enumerationErr := errors.New("could not enumerate")

	tests := []struct {
		name      string
		lister    func() ([]processHandle, error)
		wantErrIs error
		wantErr   bool
	}{
		{
			name:   "already exited returns immediately",
			lister: rounds([]*fakeProcess{}),
		},
		{
			name:   "zombie counts as exited",
			lister: rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Zombie}}}),
		},
		{
			name:    "still running times out",
			lister:  rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Running}}}),
			wantErr: true,
		},
		{
			name:      "enumeration failure surfaces its cause",
			lister:    failingLister(enumerationErr),
			wantErrIs: enumerationErr,
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			useProcesses(t, tt.lister)

			err := testInstall().waitForExit(0)
			if (err != nil) != tt.wantErr {
				t.Fatalf("waitForExit() error = %v, wantErr %v", err, tt.wantErr)
			}
			if tt.wantErrIs != nil && !errors.Is(err, tt.wantErrIs) {
				t.Errorf("waitForExit() error = %v, expected to wrap %v", err, tt.wantErrIs)
			}
		})
	}
}

func TestGetFullExe(t *testing.T) {
	tests := []struct {
		name     string
		lister   func() ([]processHandle, error)
		expected string
	}{
		{
			name:     "returns the executable of a live match",
			lister:   rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Running}, exe: "/opt/discord/Discord"}}),
			expected: "/opt/discord/Discord",
		},
		{
			name:     "ignores a zombie's executable",
			lister:   rounds([]*fakeProcess{{pid: 10, name: matchingName(), statuses: []string{process.Zombie}, exe: "/opt/discord/Discord"}}),
			expected: "",
		},
		{
			name: "skips a match whose executable is unreadable",
			lister: rounds([]*fakeProcess{
				{pid: 10, name: matchingName(), statuses: []string{process.Running}, exeErr: errors.New("access is denied")},
				{pid: 11, name: matchingName(), statuses: []string{process.Running}, exe: "/opt/discord/Discord"},
			}),
			expected: "/opt/discord/Discord",
		},
		{
			name:     "enumeration failure yields no executable",
			lister:   failingLister(errors.New("boom")),
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			useProcesses(t, tt.lister)

			if exe := testInstall().getFullExe(); exe != tt.expected {
				t.Errorf("getFullExe() = %q, expected %q", exe, tt.expected)
			}
		})
	}
}

func TestExitTimeoutErrorMessage(t *testing.T) {
	tests := []struct {
		name     string
		err      *exitTimeoutError
		expected string
	}{
		{
			name:     "without pids",
			err:      &exitTimeoutError{name: "Discord", timeout: 10 * time.Second},
			expected: "Discord did not exit within 10s",
		},
		{
			name:     "with a single pid",
			err:      &exitTimeoutError{name: "Discord", timeout: 10 * time.Second, pids: []int32{42}},
			expected: "Discord did not exit within 10s (still running: pid 42)",
		},
		{
			name:     "with several pids",
			err:      &exitTimeoutError{name: "Discord Canary", timeout: 10 * time.Second, pids: []int32{42, 43}},
			expected: "Discord Canary did not exit within 10s (still running: pid 42, 43)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if message := tt.err.Error(); message != tt.expected {
				t.Errorf("Error() = %q, expected %q", message, tt.expected)
			}
		})
	}
}

func TestIsProcessGone(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{name: "nil is not a gone process", err: nil, expected: false},
		{name: "os.ErrProcessDone", err: os.ErrProcessDone, expected: true},
		{name: "syscall.ESRCH", err: syscall.ESRCH, expected: true},
		{name: "wrapped ESRCH", err: fmt.Errorf("signal: %w", syscall.ESRCH), expected: true},
		{name: "permission error", err: os.ErrPermission, expected: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if gone := isProcessGone(tt.err); gone != tt.expected {
				t.Errorf("isProcessGone(%v) = %v, expected %v", tt.err, gone, tt.expected)
			}
		})
	}
}
