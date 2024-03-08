package backend

import (
	"context"
	"installer/backend/utils"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type Dialogs struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewDialogManager() *Dialogs {
	return &Dialogs{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (d *Dialogs) SetContext(ctx context.Context) {
	d.ctx = ctx
}

// Greet returns a greeting for the given name
func (d *Dialogs) BrowseForDiscord(channel string) string {
	selection, err := runtime.OpenDirectoryDialog(d.ctx, runtime.OpenDialogOptions{
		Title:                      "Browsing to " + utils.GetChannelName(channel),
		DefaultDirectory:           utils.BrowsePath(channel),
		ShowHiddenFiles:            true,
		TreatPackagesAsDirectories: true,
	})

	if err != nil || selection == "" {
		return ""
	}

	return utils.ValidatePath(selection)
}

func (d *Dialogs) ConfirmAction(title string, message string) string {
	result, err := runtime.MessageDialog(d.ctx, runtime.MessageDialogOptions{
		Type:          runtime.QuestionDialog,
		Title:         title,
		Message:       message,
		DefaultButton: "No",
	})

	if err != nil {
		return ""
	}

	return result
}

func (d *Dialogs) ShowNotice(dialog string, title string, message string) string {

	dialogType := runtime.InfoDialog
	if dialog == "error" {
		dialogType = runtime.ErrorDialog
	}

	result, err := runtime.MessageDialog(d.ctx, runtime.MessageDialogOptions{
		Type:    dialogType,
		Title:   title,
		Message: message,
	})

	if err != nil {
		return ""
	}

	return result
}
