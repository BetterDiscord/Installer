package utils

import (
	"fmt"

	"github.com/shirou/gopsutil/v3/process"
)

func KillProcess(name string) error {
	processes, err := process.Processes()

	// If we can't even list processes, bail out
	if err != nil {
		return fmt.Errorf("could not list processes")
	}

	// Search for desired processe(s)
	for _, p := range processes {
		n, err := p.Name()

		// Ignore processes requiring Admin/Sudo
		if err != nil {
			continue
		}

		// We found our target, kill it
		if n == name {
			var killErr = p.Kill()

			// We found it but can't kill it, bail out
			if killErr != nil {
				return killErr
			}
		}
	}

	// If we got here, everything was killed without error
	return nil
}

func GetProcessExe(name string) string {
	var exe = ""
	processes, err := process.Processes()
	if err != nil {
		return exe
	}
	for _, p := range processes {
		n, err := p.Name()
		if err != nil {
			continue
		}
		if n == name {
			if len(exe) == 0 {
				exe, _ = p.Exe()
			}
		}
	}
	return exe
}
