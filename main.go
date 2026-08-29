package main

import (
	"context"
	"embed"
	"log"

	"installer/api"
	"installer/types"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/build
var assets embed.FS

// Set by ldflags during build
var version = "v0.0.0-dev"

func main() {
	// Create an instance of the app structure
	app := NewApp()
	controller := api.NewController()

	// Create application with options
	err := wails.Run(&options.App{
		Title:         "BetterDiscord Installer",
		Frameless:     true,
		Width:         550,
		Height:        350,
		DisableResize: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.SetContext(ctx)
			controller.SetContext(ctx)
			// Best-effort update check, kept early so it still runs even if a
			// later startup step fails. It uses native dialogs (not the GUI log)
			// and swallows its own errors, so running before the logger is wired
			// up below is intentional and harmless.
			app.CheckForUpdate()

			// Setup default logger to send data to GUI
			log.SetOutput(controller)
			log.SetFlags(0) // Don't add date/time
		},
		Bind: []any{
			app,
			controller,
		},
		EnumBind: []any{
			types.Channels,
		},
		Windows: &windows.Options{
			IsZoomControlEnabled: false,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
