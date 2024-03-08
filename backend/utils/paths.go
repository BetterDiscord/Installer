package utils

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
)

var Roaming string
var BetterDiscord string
var Data string
var Plugins string
var Themes string

func init() {
	var configDir, err = os.UserConfigDir()
	if err != nil {
		return
	}
	Roaming = configDir
	BetterDiscord = filepath.Join(configDir, "BetterDiscord")
	Data = filepath.Join(BetterDiscord, "data")
	Plugins = filepath.Join(BetterDiscord, "plugins")
	Themes = filepath.Join(BetterDiscord, "themes")
}

func Exists(path string) bool {
	var _, err = os.Stat(path)
	return err == nil
}

func DiscordPath(channel string) string {
	var channelName = GetChannelName(channel)

	switch op := runtime.GOOS; op {
	case "windows":
		return ValidatePath(filepath.Join(os.Getenv("LOCALAPPDATA"), channelName))
	case "darwin", "linux":
		return ValidatePath(filepath.Join(Roaming, strings.ToLower(channelName)))
	default:
		return ""
	}
}

func BrowsePath(channel string) string {
	var channelName = GetChannelName(channel)

	switch op := runtime.GOOS; op {
	case "windows":
		return filepath.Join(os.Getenv("LOCALAPPDATA"), channelName)
	case "darwin", "linux":
		return filepath.Join(Roaming, strings.ToLower(channelName))
	default:
		return ""
	}
}

func ValidatePath(proposed string) string {
	switch op := runtime.GOOS; op {
	case "windows":
		return validateWindows(proposed)
	case "darwin", "linux":
		return validateMacLinux(proposed)
	default:
		return ""
	}
}

func Filter[T any](source []T, filterFunc func(T) bool) (ret []T) {
	var returnArray = []T{}
	for _, s := range source {
		if filterFunc(s) {
			returnArray = append(ret, s)
		}
	}
	return returnArray
}

func validateWindows(proposed string) string {
	var finalPath = ""
	var selected = filepath.Base(proposed)
	fmt.Println("Selected " + selected)
	if strings.HasPrefix(selected, "Discord") {

		// Get version dir like 1.0.9002
		var dFiles, err = os.ReadDir(proposed)
		if err != nil {
			return ""
		}

		var candidates = Filter(dFiles, func(file fs.DirEntry) bool { return file.IsDir() && len(strings.Split(file.Name(), ".")) == 3 })
		sort.Slice(candidates, func(i, j int) bool { return candidates[i].Name() < candidates[j].Name() })
		var versionDir = candidates[len(candidates)-1].Name()

		// Get core wrap like discord_desktop_core-1
		dFiles, err = os.ReadDir(filepath.Join(proposed, versionDir, "modules"))
		if err != nil {
			return ""
		}
		candidates = Filter(dFiles, func(file fs.DirEntry) bool {
			return file.IsDir() && strings.HasPrefix(file.Name(), "discord_desktop_core")
		})
		var coreWrap = candidates[len(candidates)-1].Name()

		finalPath = filepath.Join(proposed, versionDir, "modules", coreWrap, "discord_desktop_core")
	}

	// Use a separate if statement because forcing same-line } else if { is gross
	if strings.HasPrefix(selected, "app-") {
		var dFiles, err = os.ReadDir(filepath.Join(proposed, "modules"))
		if err != nil {
			return ""
		}

		var candidates = Filter(dFiles, func(file fs.DirEntry) bool {
			return file.IsDir() && strings.HasPrefix(file.Name(), "discord_desktop_core")
		})
		var coreWrap = candidates[len(candidates)-1].Name()
		finalPath = filepath.Join(proposed, "modules", coreWrap, "discord_desktop_core")
	}

	if selected == "discord_desktop_core" {
		finalPath = proposed
	}

	// If the path and the asar exist, all good
	if Exists(finalPath) && Exists(filepath.Join(finalPath, "core.asar")) {
		return finalPath
	}

	return ""
}

func validateMacLinux(proposed string) string {
	if strings.Contains(proposed, "/snap") {
		return ""
	}

	var finalPath = ""
	var selected = filepath.Base(proposed)
	if strings.HasPrefix(selected, "discord") {
		// Get version dir like 1.0.9002
		var dFiles, err = os.ReadDir(proposed)
		if err != nil {
			return ""
		}

		var candidates = Filter(dFiles, func(file fs.DirEntry) bool { return file.IsDir() && len(strings.Split(file.Name(), ".")) == 3 })
		sort.Slice(candidates, func(i, j int) bool { return candidates[i].Name() < candidates[j].Name() })
		var versionDir = candidates[len(candidates)-1].Name()
		finalPath = filepath.Join(proposed, versionDir, "modules", "discord_desktop_core")
	}

	if len(strings.Split(selected, ".")) == 3 {
		finalPath = filepath.Join(proposed, "modules", "discord_desktop_core")
	}

	if selected == "modules" {
		finalPath = filepath.Join(proposed, "discord_desktop_core")
	}

	if selected == "discord_desktop_core" {
		finalPath = proposed
	}

	if Exists(finalPath) && Exists(filepath.Join(finalPath, "core.asar")) {
		return finalPath
	}

	return ""
}
