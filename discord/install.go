package discord

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"installer/betterdiscord"
	"installer/types"
)

type DiscordInstall struct {
	// ResourcesPath is the Discord install's `resources` directory (the one
	// holding app.asar).
	ResourcesPath string               `json:"resourcesPath"`
	Channel       types.DiscordChannel `json:"channel"`
	Version       string               `json:"version"`
	IsFlatpak     bool                 `json:"isFlatpak"`
	IsSnap        bool                 `json:"isSnap"`
}

// InstallBD installs BetterDiscord into this Discord installation
func (discord *DiscordInstall) InstallBD(options types.InstallOptions) error {
	// Reject Snap before doing anything (notably before stop()) so an unsupported
	// install never needlessly kills a running Discord only to fail at inject().
	if err := discord.errIfSnap(); err != nil {
		return err
	}

	bd, err := discord.GetBetterDiscordInstall()
	if err != nil {
		return err
	}

	// Make BetterDiscord folders
	log.Println("🛠 Preparing BetterDiscord...")
	if err := bd.Prepare(); err != nil {
		return err
	}
	log.Println("✅ BetterDiscord prepared for install")
	log.Println("")

	// Discord locks app.asar and betterdiscord.asar while running, so it must be stopped before we can
	// modify it. Capture the executable so it can be relaunched afterward.
	exe, wasRunning, err := discord.stop()
	if err != nil {
		return err
	}
	log.Println("")

	// Download and write betterdiscord.asar
	log.Println("📥 Downloading BetterDiscord...")
	if err := bd.Download(options.UseDevBuild); err != nil {
		return err
	}
	log.Println("✅ BetterDiscord downloaded")
	log.Println("")

	// Shadow app.asar with our loader
	log.Println("🔌 Injecting into Discord...")
	if err := discord.inject(bd); err != nil {
		return err
	}
	log.Println("✅ Injection successful")
	log.Println("")

	// Only relaunch what we stopped: if Discord wasn't running we leave it closed.
	if options.RestartDiscord && wasRunning {
		log.Printf("🔄 Restarting %s...\n", discord.Channel.Name())
		if err := discord.start(exe); err != nil {
			return err
		}
		log.Println("")
	}

	return nil
}

// UninstallBD removes BetterDiscord from this Discord installation
func (discord *DiscordInstall) UninstallBD(options types.UninstallOptions) error {
	// Reject Snap before stop() so an unsupported install isn't needlessly killed.
	if err := discord.errIfSnap(); err != nil {
		return err
	}

	// Discord locks app.asar while running; stop it before reverting the injection.
	exe, wasRunning, err := discord.stop()
	if err != nil {
		return err
	}
	log.Println("")

	log.Println("🧹 Removing injection...")
	if err := discord.uninject(); err != nil {
		return err
	}
	log.Println("")

	if options.FullUninstall {
		install, err := discord.GetBetterDiscordInstall()
		if err != nil {
			return err
		}
		if err := install.RemoveAll(); err != nil {
			return err
		}
		log.Println("")
	}

	if options.RestartDiscord && wasRunning {
		log.Printf("🔄 Restarting %s...\n", discord.Channel.Name())
		if err := discord.start(exe); err != nil {
			return err
		}
		log.Println("")
	}

	return nil
}

// RepairBD repairs BetterDiscord for this Discord installation. It reverts the
// injection and cleans the requested data files, leaving BetterDiscord
// uninstalled; the caller then offers to reinstall.
func (discord *DiscordInstall) RepairBD(options types.RepairOptions) error {
	// Reject Snap before stop() so an unsupported install isn't needlessly killed.
	if err := discord.errIfSnap(); err != nil {
		return err
	}

	// Discord locks app.asar while running; stop it before reverting the injection.
	exe, wasRunning, err := discord.stop()
	if err != nil {
		return err
	}
	log.Println("")

	log.Println("🧹 Removing injection...")
	if err := discord.uninject(); err != nil {
		return err
	}
	log.Println("")

	bd, err := discord.GetBetterDiscordInstall()
	if err != nil {
		return err
	}

	if err := bd.Repair(discord.Channel, options); err != nil {
		return err
	}
	log.Println("")

	// Repair leaves Discord uninjected. If it was running, relaunch it (vanilla)
	// so the user isn't left with a closed client; if they then accept the
	// reinstall prompt, that flow stops and re-injects it.
	if wasRunning {
		log.Printf("🔄 Restarting %s...\n", discord.Channel.Name())
		if err := discord.start(exe); err != nil {
			return err
		}
		log.Println("")
	}

	return nil
}

func (discord *DiscordInstall) GetBetterDiscordInstall() (*betterdiscord.BDInstall, error) {
	// Gets the global BetterDiscord install
	bd := betterdiscord.GetInstallation()

	// Flatpaks get their own local BD folder. The resources path is in the
	// read-only deployment tree, so we can't derive the sandbox config from it;
	// instead we compute the stable ~/.var/app/{id}/config location from the
	// channel. Inside the sandbox this dir is the app's $XDG_CONFIG_HOME, which
	// is exactly where the injected index.js looks for BetterDiscord at runtime.
	if discord.IsFlatpak {
		home, err := os.UserHomeDir()
		if err != nil {
			return nil, err
		}
		id := "com.discordapp." + strings.ReplaceAll(discord.Channel.Name(), " ", "")
		configPath := filepath.Join(home, ".var", "app", id, "config")
		bd = betterdiscord.GetInstallation(configPath)
	}

	return bd, nil
}
