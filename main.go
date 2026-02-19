package main

import (
	"embed"
	"fmt"
	"strings"

	// "installer/internal/services"
	"installer/internal/services"
	"installer/types"
	"installer/utils"

	"github.com/pkg/browser"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/build
var assets embed.FS

// Set by ldflags during build
var version = ""

func main() {
	// Create an instance of the updaterService structure
	// updaterService := updater.NewUpdater(nil)
	// controller := api.NewController()

	// Create application with options
	app := application.New(application.Options{
		Name: "BetterDiscord Installer",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})
	// err := application.Run(&application.Options{
	// 	Title:     "BetterDiscord Installer",
	// 	Frameless: true,
	// 	Width:     550,
	// 	Height:    350,
	// 	AssetServer: &application.AssetServerOptions{
	// 		Assets: assets,
	// 	},
	// 	BackgroundColour: &application.RGBA{R: 27, G: 38, B: 54, A: 1},
	// 	OnStartup: func(ctx context.Context) {
	// 		updaterService.SetContext(ctx)
	// 		controller.SetContext(ctx)
	// 		updaterService.CheckForUpdate()

	// 		// Setup default logger to send data to GUI
	// 		log.SetOutput(controller)
	// 		log.SetFlags(0) // Don't add date/time
	// 	},
	// 	Bind: []interface{}{
	// 		updaterService,
	// 		controller,
	// 	},
	// 	EnumBind: []interface{}{
	// 		types.Channels,
	// 	},
	// })

	CheckForUpdate(app)

	dialogService := services.NewDialogService(app)
	installerService := services.NewInstallerService(app, dialogService)
	app.RegisterService(application.NewService(dialogService))
	app.RegisterService(application.NewService(installerService))

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "BetterDiscord Installer",
		Width: 550,
		Height: 350,
		Frameless: true,
		BackgroundColour: application.NewRGBA(27, 38, 54, 1),
	})

	// if err != nil {
	// 	println("Error:", err.Error())
	// }
}


func CheckForUpdate(app *application.App) {
	// If the version doesn't start with "v" then it's a
	// development build, so we don't check for updates
	if !strings.HasPrefix(version, "v") {
		return
	}

	// Get latest installer version from GitHub API
	apiData, err := utils.DownloadJSON[types.GitHubRelease]("https://api.github.com/repos/BetterDiscord/Installer/releases/latest")
	if err != nil {
		return
	}

	// If the current version is greater than or equal
	// to the latest version, no update is needed
	if utils.CompareVersions(version, apiData.TagName) >= 0 {
		return
	}

	dialog := app.Dialog.Info().
				SetTitle("Update Available").
				SetMessage(fmt.Sprintf("A new version (%s) of the installer is available. Would you like to download it now?", apiData.TagName))

	downloadButton := dialog.AddButton("Yes")
	downloadButton.OnClick(func() {
		browser.OpenURL(apiData.HTMLURL)
	})

	cancelButton := dialog.AddButton("Cancel")

	dialog.SetDefaultButton(downloadButton)
    dialog.SetCancelButton(cancelButton)
    dialog.Show()
}
