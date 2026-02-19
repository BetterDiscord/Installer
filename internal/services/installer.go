package services

import (
	"fmt"

	"installer/discord"
	"installer/types"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type InstallerService struct {
	app *application.App
	dialogs *DialogService
}

func NewInstallerService(app *application.App, dialogs *DialogService) *InstallerService {
	return &InstallerService{app: app, dialogs: dialogs}
}


func (a *InstallerService) Write(p []byte) (n int, err error) {
	fmt.Println(string(p[:]))
	a.app.Event.Emit("log", string(p[:]))
	return len(p), nil
}

func (d *InstallerService) GetDiscordPath(channel string) string {
	return discord.GetSuggestedPath(types.ParseChannel(channel))
}

func (action *InstallerService) Install(corePaths []string) {
	for i := range corePaths {
		install := discord.ResolvePath(corePaths[i])
		if install == nil {
			continue
		}

		if err := install.InstallBD(); err != nil {
			action.app.Event.Emit("failure")
			return
		}
	}

	action.app.Event.Emit("success")
}

func (action *InstallerService) Uninstall(corePaths []string) {
	for i := range corePaths {
		install := discord.ResolvePath(corePaths[i])
		if install == nil {
			continue
		}

		if err := install.UninstallBD(); err != nil {
			action.app.Event.Emit("failure")
			return
		}
	}

	action.app.Event.Emit("success")
}

func (action *InstallerService) Repair(corePaths []string) {
	for i := range corePaths {
		install := discord.ResolvePath(corePaths[i])
		if install == nil {
			continue
		}

		if err := install.RepairBD(); err != nil {
			action.app.Event.Emit("failure")
			return
		}
	}

	action.app.Event.Emit("success")

	result := action.dialogs.ConfirmAction("Reinstall BetterDiscord", "After repairing, you need to reinstall BetterDiscord. Would you like to do that now?")

	if result == ConfirmationYes {
		action.app.Event.Emit("reset")
		action.Install(corePaths)
	}
}
