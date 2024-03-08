package utils

import (
	"github.com/shirou/gopsutil/v3/process"
)

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
