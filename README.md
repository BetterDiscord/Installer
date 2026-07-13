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
   <a href="https://github.com/BetterDiscord/installer/releases/" target="_blank">
    <img src="https://img.shields.io/github/downloads/BetterDiscord/installer/total?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjI1IDM4LjVIMzUuNzVDMzYuNzE2NSAzOC41IDM3LjUgMzkuMjgzNSAzNy41IDQwLjI1QzM3LjUgNDEuMTY4MiAzNi43OTI5IDQxLjkyMTIgMzUuODkzNSA0MS45OTQyTDM1Ljc1IDQySDEyLjI1QzExLjI4MzUgNDIgMTAuNSA0MS4yMTY1IDEwLjUgNDAuMjVDMTAuNSAzOS4zMzE4IDExLjIwNzEgMzguNTc4OCAxMi4xMDY1IDM4LjUwNThMMTIuMjUgMzguNUgzNS43NUgxMi4yNVpNMjMuNjA2NSA2LjI1NThMMjMuNzUgNi4yNUMyNC42NjgyIDYuMjUgMjUuNDIxMiA2Ljk1NzExIDI1LjQ5NDIgNy44NTY0N0wyNS41IDhWMjkuMzMzTDMwLjI5MzEgMjQuNTQwN0MzMC45NzY1IDIzLjg1NzMgMzIuMDg0NiAyMy44NTczIDMyLjc2OCAyNC41NDA3QzMzLjQ1MTQgMjUuMjI0MiAzMy40NTE0IDI2LjMzMjIgMzIuNzY4IDI3LjAxNTZMMjQuOTg5OCAzNC43OTM4QzI0LjMwNjQgMzUuNDc3MiAyMy4xOTg0IDM1LjQ3NzIgMjIuNTE1IDM0Ljc5MzhMMTQuNzM2OCAyNy4wMTU2QzE0LjA1MzQgMjYuMzMyMiAxNC4wNTM0IDI1LjIyNDIgMTQuNzM2OCAyNC41NDA3QzE1LjQyMDIgMjMuODU3MyAxNi41MjgyIDIzLjg1NzMgMTcuMjExNyAyNC41NDA3TDIyIDI5LjMyOVY4QzIyIDcuMDgxODMgMjIuNzA3MSA2LjMyODgxIDIzLjYwNjUgNi4yNTU4TDIzLjc1IDYuMjVMMjMuNjA2NSA2LjI1NThaIiBmaWxsPSIjM2E3MWMxIi8+Cjwvc3ZnPgo=" alt="Downloads"/>
  </a>
  <a href="https://github.com/BetterDiscord/Installer/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/BetterDiscord/installer?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjk2ODQgMi4zMjQ2NUMxMS41ODMgMS44NzYxNiAxMi40MTcgMS44NzYxNiAxMy4wMzE2IDIuMzI0NjVMMjAuNDUzNCA3Ljc0MDZDMjEuNDI5OSA4LjQ1MzE1IDIwLjkyNjggOS45OTgzNSAxOS43MTg5IDEwLjAwMDNINC4yODEwOEMzLjA3MzE4IDkuOTk4MzUgMi41NzAxMSA4LjQ1MzE1IDMuNTQ2NTcgNy43NDA2TDEwLjk2ODQgMi4zMjQ2NVpNMTMgNi4yNTAzNEMxMyA1LjY5ODA1IDEyLjU1MjMgNS4yNTAzNCAxMiA1LjI1MDM0QzExLjQ0NzcgNS4yNTAzNCAxMSA1LjY5ODA1IDExIDYuMjUwMzRDMTEgNi44MDI2MiAxMS40NDc3IDcuMjUwMzQgMTIgNy4yNTAzNEMxMi41NTIzIDcuMjUwMzQgMTMgNi44MDI2MiAxMyA2LjI1MDM0WiIgZmlsbD0iIzNhNzFjMSIvPgo8cGF0aCBkPSJNMTEuMjUgMTYuMDAwM0g5LjI1VjExLjAwMDNIMTEuMjVWMTYuMDAwM1oiIGZpbGw9IiMzYTcxYzEiLz4KPHBhdGggZD0iTTE0Ljc1IDE2LjAwMDNIMTIuNzVWMTEuMDAwM0gxNC43NVYxNi4wMDAzWiIgZmlsbD0iIzNhNzFjMSIvPgo8cGF0aCBkPSJNMTguNSAxNi4wMDAzSDE2LjI1VjExLjAwMDNIMTguNVYxNi4wMDAzWiIgZmlsbD0iIzNhNzFjMSIvPgo8cGF0aCBkPSJNMTguNzUgMTcuMDAwM0g1LjI1QzQuMDA3MzYgMTcuMDAwMyAzIDE4LjAwNzcgMyAxOS4yNTAzVjE5Ljc1MDNDMyAyMC4xNjQ1IDMuMzM1NzkgMjAuNTAwMyAzLjc1IDIwLjUwMDNIMjAuMjVDMjAuNjY0MiAyMC41MDAzIDIxIDIwLjE2NDUgMjEgMTkuNzUwM1YxOS4yNTAzQzIxIDE4LjAwNzcgMTkuOTkyNiAxNy4wMDAzIDE4Ljc1IDE3LjAwMDNaIiBmaWxsPSIjM2E3MWMxIi8+CjxwYXRoIGQ9Ik03Ljc1IDE2LjAwMDNINS41VjExLjAwMDNINy43NVYxNi4wMDAzWiIgZmlsbD0iIzNhNzFjMSIvPgo8L3N2Zz4K" alt="License"/>
  </a>
</p>

---

# Overview

This repository contains the source code for the BetterDiscord installer. The app is built with [Wails](https://wails.io/) (Go backend + Svelte frontend) and ships as a native desktop application.

## Compatibility Matrix

| Platform | Minimum Version | Support Status | Notes |
| --- | --- | --- | --- |
| Windows | Windows 10+ | ✅ | x64, ARM64, and x86 builds are available. |
| macOS | macOS 11+ (Big Sur) | ✅ | A Universal 2 build supports x64 and ARM64. |
| Linux | Ubuntu 20.04+ and Debian 11+, openSUSE 16.2+, Fedora Linux 32+ | ✅ | See Linux install support notes below. |

Linux install support:

- Native Discord install: ✅ Supported
- Flatpak Discord install: ✅ Supported
- Snap Discord install: ❌ Unsupported due to upstream Snap packaging/runtime changes

## Downloads

These links point to the latest builds in the [releases](https://github.com/BetterDiscord/installer/releases/) tab of this repository.

| [Windows (11+)](https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Windows.exe)  | [macOS (14+)](https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Mac.zip) | [Linux](https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Linux) |
| ------------- | ------------- | ------------- |

## FAQ

### Does the installer support Flatpak Discord on Linux?

Yes. Flatpak Discord installs are supported.

### Why is Snap Discord unsupported on Linux?

Discord Snap packaging/runtime changes prevent the installer from supporting Snap installs.

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
├── build                   // Build assets and platform-specific packaging files.
├── frontend                // Svelte UI bundled by Vite (Bun-powered).
├── types                   // Shared Go types used by bindings.
├── utils                   // Backend utilities.
├── main.go                 // Wails application entry point.
├── wails.json              // Wails configuration + frontend hooks.
```

</details>

### Prerequisites
- [Git](https://git-scm.com)
- [Go](https://go.dev/) (matches `go.mod`)
- [Bun](https://bun.sh/)
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)
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
git clone https://github.com/BetterDiscord/installer && cd installer

# Run in development mode with backend bindings
wails dev

# Build a distributable binary
wails build
```

#### Frontend Checks

```bash
cd frontend
bun install
bun run --bun svelte-kit sync
bun run --bun svelte-check --tsconfig ./tsconfig.json
bun run --bun eslint .
```

#### Frontend Tests

```bash
cd frontend
bun install
bun run test
```

#### Backend Checks

```bash
go test ./...
gofmt -w .
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For information on contributing to this project, please see [CONTRIBUTING.md](/CONTRIBUTING.md).

<a href="https://github.com/betterdiscord/installer/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=betterdiscord/installer" />
</a>

---

Made with ❤️ by the BetterDiscord Team
