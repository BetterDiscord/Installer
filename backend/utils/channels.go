package utils

import "strings"

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
