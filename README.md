<h1 align="center">BetterDiscord Installer</h1>

<p align="center">
  <a href="#overview">Overview</a> |
  <a href="#compatibility-matrix">Compatibility</a> |
  <a href="#downloads">Downloads</a> |
  <a href="#faq">FAQ</a> |
  <a href="#development">Development</a> |
  <a href="#contributing">Contributing</a>
</p>

---

<p align="center">
  <img alt="Preview" width="524" height="322" src="https://i.imgur.com/evmFCAf.png"/>
  <br/>
  A simple standalone program which automates the installation, removal and maintenance of <a href="https://github.com/BetterDiscord/BetterDiscord">BetterDiscord</a>.
  <br/>
  <br/>
  <a href="https://betterdiscord.app/invite" target="_blank">
    <img src="https://img.shields.io/badge/discord-join-green?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDQ4IDQ4IiBmaWxsPSJub25lIj4NCjxwYXRoIGQ9Ik0xNi41MzUzIDUuNDUwNTNDMzMuODIzMyAtMS40NjgwOSA1MC44ODE1IDE2Ljg4NjMgNDEuNTkyNSAzMy42MDY2QzM3LjM3MzIgNDEuMjAxMiAyNi44OTA0IDQ3LjMxNyAxNC42ODQyIDQxLjUzMjZMNi4xOTk5IDQzLjk1NjdDNC44ODM0NiA0NC4zMzI4IDMuNjY2OTMgNDMuMTIxMiA0LjAzNjM0IDQxLjgwMzdDNC41NDI3MiAzOS45OTc2IDUuNzQyNTcgMzUuNzM5OCA2LjQ0NDEgMzMuNDMyM0MxLjE4Mjc5IDI0LjA0NCA0LjczMDUgMTAuMTc0OCAxNi41MzUzIDUuNDUwNTNaTTE1Ljk5NTQgMjAuMjQ5NkMxNS45OTU0IDIwLjkzOTkgMTYuNTU1IDIxLjQ5OTYgMTcuMjQ1NCAyMS40OTk2SDMwLjc0OThDMzEuNDQwMSAyMS40OTk2IDMxLjk5OTggMjAuOTM5OSAzMS45OTk4IDIwLjI0OTZDMzEuOTk5OCAxOS41NTkyIDMxLjQ0MDEgMTguOTk5NiAzMC43NDk4IDE4Ljk5OTZIMTcuMjQ1NEMxNi41NTUgMTguOTk5NiAxNS45OTU0IDE5LjU1OTIgMTUuOTk1NCAyMC4yNDk2Wk0xNy4yNDk4IDI2LjQ3NDZDMTYuNTU5NCAyNi40NzQ2IDE1Ljk5OTggMjcuMDM0MiAxNS45OTk4IDI3LjcyNDZDMTUuOTk5OCAyOC40MTQ5IDE2LjU1OTQgMjguOTc0NiAxNy4yNDk4IDI4Ljk3NDZIMjYuNzQ5OEMyNy40NDAxIDI4Ljk3NDYgMjcuOTk5OCAyOC40MTQ5IDI3Ljk5OTggMjcuNzI0NkMyNy45OTk4IDI3LjAzNDIgMjcuNDQwMSAyNi40NzQ2IDI2Ljc0OTggMjYuNDc0NkgxNy4yNDk4WiIgZmlsbD0iIzNhNzFjMSIvPg0KPC9zdmc+" alt="Chat"/>
    </a>
   <a href="https://github.com/BetterDiscord/Installer/releases/" target="_blank">
    <img src="https://img.shields.io/github/downloads/BetterDiscord/Installer/total?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjI1IDM4LjVIMzUuNzVDMzYuNzE2NSAzOC41IDM3LjUgMzkuMjgzNSAzNy41IDQwLjI1QzM3LjUgNDEuMTY4MiAzNi43OTI5IDQxLjkyMTIgMzUuODkzNSA0MS45OTQyTDM1Ljc1IDQySDEyLjI1QzExLjI4MzUgNDIgMTAuNSA0MS4yMTY1IDEwLjUgNDAuMjVDMTAuNSAzOS4zMzE4IDExLjIwNzEgMzguNTc4OCAxMi4xMDY1IDM4LjUwNThMMTIuMjUgMzguNUgzNS43NUgxMi4yNVpNMjMuNjA2NSA2LjI1NThMMjMuNzUgNi4yNUMyNC42NjgyIDYuMjUgMjUuNDIxMiA2Ljk1NzExIDI1LjQ5NDIgNy44NTY0N0wyNS41IDhWMjkuMzMzTDMwLjI5MzEgMjQuNTQwN0MzMC45NzY1IDIzLjg1NzMgMzIuMDg0NiAyMy44NTczIDMyLjc2OCAyNC41NDA3QzMzLjQ1MTQgMjUuMjI0MiAzMy40NTE0IDI2LjMzMjIgMzIuNzY4IDI3LjAxNTZMMjQuOTg5OCAzNC43OTM4QzI0LjMwNjQgMzUuNDc3MiAyMy4xOTg0IDM1LjQ3NzIgMjIuNTE1IDM0Ljc5MzhMMTQuNzM2OCAyNy4wMTU2QzE0LjA1MzQgMjYuMzMyMiAxNC4wNTM0IDI1LjIyNDIgMTQuNzM2OCAyNC41NDA3QzE1LjQyMDIgMjMuODU3MyAxNi41MjgyIDIzLjg1NzMgMTcuMjExNyAyNC41NDA3TDIyIDI5LjMyOVY4QzIyIDcuMDgxODMgMjIuNzA3MSA2LjMyODgxIDIzLjYwNjUgNi4yNTU4TDIzLjc1IDYuMjVMMjMuNjA2NSA2LjI1NThaIiBmaWxsPSIjM2E3MWMxIi8+Cjwvc3ZnPgo=" alt="Downloads"/>
  </a>
  <a href="https://github.com/BetterDiscord/Installer/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/BetterDiscord/Installer?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjk2ODQgMi4zMjQ2NUMxMS41ODMgMS44NzYxNiAxMi40MTcgMS44NzYxNiAxMy4wMzE2IDIuMzI0NjVMMjAuNDUzNCA3Ljc0MDZDMjEuNDI5OSA4LjQ1MzE1IDIwLjkyNjggOS45OTgzNSAxOS43MTg5IDEwLjAwMDNINC4yODEwOEMzLjA3MzE4IDkuOTk4MzUgMi41NzAxMSA4LjQ1MzE1IDMuNTQ2NTcgNy43NDA2TDEwLjk2ODQgMi4zMjQ2NVpNMTMgNi4yNTAzNEMxMyA1LjY5ODA1IDEyLjU1MjMgNS4yNTAzNCAxMiA1LjI1MDM0QzExLjQ0NzcgNS4yNTAzNCAxMSA1LjY5ODA1IDExIDYuMjUwMzRDMTEgNi44MDI2MiAxMS40NDc3IDcuMjUwMzQgMTIgNy4yNTAzNEMxMi41NTIzIDcuMjUwMzQgMTMgNi44MDI2MiAxMyA2LjI1MDM0WiIgZmlsbD0iIzNhNzFjMSIvPgo8cGF0aCBkPSJNMTEuMjUgMTYuMDAwM0g5LjI1VjExLjAwMDNIMTEuMjVWMTYuMDAwM1oiIGZpbGw9IiMzYTcxYzEiLz4KPHBhdGggZD0iTTE0Ljc1IDE2LjAwMDNIMTIuNzVWMTEuMDAwM0gxNC43NVYxNi4wMDAzWiIgZmlsbD0iIzNhNzFjMSIvPgo8cGF0aCBkPSJNMTguNSAxNi4wMDAzSDE2LjI1VjExLjAwMDNIMTguNVYxNi4wMDAzWiIgZmlsbD0iIzNhNzFjMSIvPgo8cGF0aCBkPSJNMTguNzUgMTcuMDAwM0g1LjI1QzQuMDA3MzYgMTcuMDAwMyAzIDE4LjAwNzcgMyAxOS4yNTAzVjE5Ljc1MDNDMyAyMC4xNjQ1IDMuMzM1NzkgMjAuNTAwMyAzLjc1IDIwLjUwMDNIMjAuMjVDMjAuNjY0MiAyMC41MDAzIDIxIDIwLjE2NDUgMjEgMTkuNzUwM1YxOS4yNTAzQzIxIDE4LjAwNzcgMTkuOTkyNiAxNy4wMDAzIDE4Ljc1IDE3LjAwMDNaIiBmaWxsPSIjM2E3MWMxIi8+CjxwYXRoIGQ9Ik03Ljc1IDE2LjAwMDNINS41VjExLjAwMDNINy43NVYxNi4wMDAzWiIgZmlsbD0iIzNhNzFjMSIvPgo8L3N2Zz4K" alt="License"/>
  </a>
</p>

---

# Overview

This repository contains the source code for the BetterDiscord installer. The app is built with [Wails](https://wails.io/) (Go backend + Svelte frontend) and ships as a native desktop application.

## Compatibility Matrix

| Platform | Minimum Version | Support Status | Notes |
| --- | --- | --- | --- |
| Windows | Windows 10+ | ✅ | x64. Uses the system WebView2 runtime. |
| macOS | macOS 12+ (Monterey) | ✅ | Universal binary (Intel + Apple Silicon). |
| Linux | Any x64 distro with WebKitGTK 4.1 (e.g. Ubuntu 22.04+, Debian 12+, Fedora 37+) | ✅ | See Linux install support notes below. |

Linux install support:

- Native Discord install: ✅ Supported
- Flatpak Discord install: ✅ Supported for per-user installs; ⚠️ system-wide/global installs need elevated write access and aren't supported yet
- Snap Discord install: ❌ Unsupported; snap mounts Discord's files read-only, so the installer can't modify the app

## Downloads

These links point to the latest builds in the [releases](https://github.com/BetterDiscord/Installer/releases/) tab of this repository.

| Platform | Download |
| --- | --- |
| Windows | [BetterDiscord-Installer-Windows.exe](https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Installer-Windows.exe) |
| macOS | [BetterDiscord-Installer-Mac.zip](https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Installer-Mac.zip) |
| Linux (AppImage) | [BetterDiscord-Installer-Linux.AppImage.zip](https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Installer-Linux.AppImage.zip) |
| Linux (zip) | [BetterDiscord-Installer-Linux.zip](https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Installer-Linux.zip) |

Or install via a package manager:

```sh
# Windows
winget install BetterDiscord.Installer

# macOS
brew install --cask betterdiscord/tap/betterdiscord-installer
```

## FAQ

### Windows says "Windows protected your PC" when I run the installer

The installer is currently not code-signed, so SmartScreen warns on new downloads. Click **More info** → **Run anyway**. Installing via `winget` avoids the prompt since winget verifies the download hash.

### macOS says the app "cannot be opened because it is from an unidentified developer"

The app is not yet notarized with Apple. Right-click the app and choose **Open** (on newer macOS versions you may need to allow it under **System Settings → Privacy & Security → Open Anyway**). Alternatively, remove the quarantine flag:

```sh
xattr -d com.apple.quarantine "/Applications/BetterDiscord Installer.app"
```

### macOS keeps turning the installer's App Management permission back off

Installer builds before this fix shipped an unsealed `.app`, so macOS couldn't
re-validate the app's signature and discarded the App Management grant — the
toggle appeared to switch itself off and injection kept getting denied.
Releases are now ad-hoc signed, which makes the grant stick.

If you already approved an affected build, macOS may still be holding the old,
unusable entry. Clear it once, then grant the permission again:

```sh
tccutil reset SystemPolicyAppBundles app.betterdiscord.installer
```

Because the installer is ad-hoc signed rather than signed with a Developer ID,
its signature changes on every release, so macOS asks for App Management again
after each update. That's expected.

### Does the installer support Flatpak Discord on Linux?

Yes, for **per-user** Flatpak installs (the default `flatpak install --user …`). **System-wide/global** Flatpak installs live under `/var/lib/flatpak`, which is root-owned; the installer needs to write into the app to inject BetterDiscord, and it doesn't request elevation yet, so global Flatpak installs aren't supported for now.

### Why is Snap Discord unsupported on Linux?

Snap mounts Discord's application files as a read-only squashfs. The installer injects BetterDiscord by modifying files inside the Discord app, which isn't possible on a read-only mount, so Snap can't be supported.

### How does the installer add BetterDiscord to Discord?

It places a small loader inside Discord's own app files (a `resources/app` folder) and preserves Discord's original `app.asar` next to it. Because this loads before Discord's updater runs, BetterDiscord can keep itself injected across Discord updates, so you generally only need to run the installer once. Uninstalling restores Discord's original files.

### I'm running the installer under WSL, do I need to do anything special?

Yes: **fully close Discord before installing, repairing, or uninstalling.** WSL support targets a Windows Discord install, but the installer can't see or manage the Windows Discord process from the Linux side, so it can't stop Discord for you. If Discord is still running it holds a lock on `app.asar` and the operation will fail. In this case, close Discord and try again. (For headless or CLI-based workflows, the BetterDiscord CLI is a better fit.)

### How can I use the global BetterDiscord folder with Flatpak?

1. Grant the Flatpak app access to the BetterDiscord config directory:

```sh
flatpak --user override com.discordapp.Discord --filesystem=xdg-config/BetterDiscord:rw
```

2. Symlink the BetterDiscord folder into the Flatpak app config:

```sh
ln -s "${XDG_CONFIG_HOME:-$HOME/.config}/BetterDiscord" "$HOME/.var/app/com.discordapp.Discord/config/BetterDiscord"
```

Replace `com.discordapp.Discord` with your Discord Flatpak app ID if it differs on your system.

## Development

### Codebase Overview

<details>
<summary>Show Codebase Structure</summary>

```text
.
├── api                     // Wails bindings and backend runtime helpers.
├── betterdiscord           // BetterDiscord install/repair/uninstall logic.
├── build                   // Build assets and platform-specific packaging files.
├── discord                 // Discord installation discovery.
├── frontend                // Svelte UI bundled by Vite (Bun-powered).
├── scripts                 // Build/release helper scripts (frontend, AppImage, winres).
├── types                   // Shared Go types used by bindings.
├── utils                   // Backend utilities.
├── wsl                     // WSL detection and path helpers.
├── main.go                 // Wails application entry point.
├── wails.json              // Wails configuration + frontend hooks.
├── Taskfile.yml            // Common dev/build tasks (https://taskfile.dev).
├── .goreleaser.yaml        // Release build + publishing configuration.
```

</details>

### Prerequisites
- [Git](https://git-scm.com)
- [Go](https://go.dev/) (matches `go.mod`)
- [Bun](https://bun.sh/)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)
- [Task](https://taskfile.dev/) (optional, for the shortcuts below)
- [GoReleaser](https://goreleaser.com/install/) (optional, for local release snapshots)
- Command line of your choice

### Linux Prerequisites

Wails requires additional system packages on Linux (GTK/WebKit and build tooling). See the official Wails Linux dependencies guide: https://wails.io/docs/gettingstarted/installation#linux

Fedora note: you may need to set `PKG_CONFIG_PATH` to include system pkgconfig directories:

```sh
export PKG_CONFIG_PATH="/usr/lib64/pkgconfig:/usr/share/pkgconfig"
```

### Building

#### Quick Start

```bash
# Clone and navigate to the repository
git clone https://github.com/BetterDiscord/Installer && cd installer

# Run in development mode with backend bindings
task dev        # or: wails dev (add -tags webkit2_41 on Linux)

# Build a distributable binary
task build      # or: wails build (add -tags webkit2_41 on Linux)
```

#### Checks and Tests

```bash
task check      # frontend typecheck + lint, go vet, go test

# Or run pieces individually:
cd frontend && bun install && bun run check && bun run lint && bun run test
go test ./...
```

#### Release Snapshots

Releases are built and published by [GoReleaser](https://goreleaser.com/) when a `v*` tag is pushed (prerelease tags like `v2.0.0-alpha.1` skip the winget/homebrew publishing). To build a local snapshot of the release artifacts for your platform:

```bash
task snapshot   # output lands in dist/
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For information on contributing to this project, please see [CONTRIBUTING.md](/CONTRIBUTING.md).

<a href="https://github.com/BetterDiscord/Installer/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=BetterDiscord/Installer" />
</a>

---

Made with ❤️ by the BetterDiscord Team
