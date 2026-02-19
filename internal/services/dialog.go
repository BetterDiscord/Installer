package services

import (
	"os"

	"installer/discord"
	"installer/types"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type DialogService struct {
	app *application.App
}

func NewDialogService(app *application.App) *DialogService {
	return &DialogService{app: app}
}

func (d *DialogService) BrowseForDiscord(schannel string) string {
	var browsePath string
	browsePath, err := os.UserConfigDir()
	if err != nil {
		browsePath = os.Getenv("HOME")
	}

	channel := types.ParseChannel(schannel)

	// selection, err := runtime.OpenDirectoryDialog(d.ctx, runtime.OpenDialogOptions{
	// 	Title:                      "Browsing to " + channel.Name(),
	// 	DefaultDirectory:           browsePath,
	// 	ShowHiddenFiles:            true,
	// 	TreatPackagesAsDirectories: true,
	// })

	selection, err := d.app.Dialog.OpenFile().
		SetTitle("Browsing to " + channel.Name()).
		SetDirectory(browsePath).
		CanChooseDirectories(true).
		CanChooseFiles(false).
		ShowHiddenFiles(true).
		PromptForSingleSelection()

	if err != nil || selection == "" {
		return ""
	}

	if result := discord.ResolvePath(selection); result != nil {
		return result.CorePath
	}

	return ""
}

type ConfirmationResult string

const (
	ConfirmationYes ConfirmationResult = "Yes"
	ConfirmationNo  ConfirmationResult = "No"
)

func (d *DialogService) ConfirmAction(title string, message string) ConfirmationResult {
	dialog := d.app.Dialog.Question().
		SetTitle(title).
		SetMessage(message)

	confirm := dialog.AddButton("Yes")
	cancel := dialog.AddButton("No")

	dialog.SetDefaultButton(confirm)
	dialog.SetCancelButton(cancel)

	ch := make(chan ConfirmationResult, 1)

	confirm.OnClick(func() {
		ch <- ConfirmationYes
	})

	cancel.OnClick(func() {
		ch <- ConfirmationNo
	})

	dialog.Show()

	return <-ch
}

// func (d *DialogService) ShowNotice(dialog string, title string, message string) string {

// 	dialogType := runtime.InfoDialog
// 	if dialog == "error" {
// 		dialogType = runtime.ErrorDialog
// 	}

// 	result, err := runtime.MessageDialog(d.ctx, runtime.MessageDialogOptions{
// 		Type:    dialogType,
// 		Title:   title,
// 		Message: message,
// 	})

// 	if err != nil {
// 		return ""
// 	}

// 	return result
// }
