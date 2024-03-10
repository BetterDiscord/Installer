package utils

import (
	"runtime"
	"strings"
)

func GetChannelName(channel string) string {
	switch strings.ToLower(channel) {
	case "stable":
		return "Discord"
	case "canary":
		return "DiscordCanary"
	case "ptb":
		return "DiscordPTB"
	default:
		return ""
	}
}

func GetExecutableName(channel string) string {
	var name string
	switch strings.ToLower(channel) {
	case "stable":
		name = "Discord"
	case "canary":
		name = "Discord Canary"
	case "ptb":
		name = "Discord PTB"
	default:
		name = ""
	}

	if name == "" {
		return name
	}

	switch op := runtime.GOOS; op {
	case "windows":
		name = name + ".exe"
	case "darwin", "linux":
		name = strings.ReplaceAll(name, " ", "")
	}

	return name
}
