<h1 align="center">BetterDiscord Installer</h1>

<p align="center">
  <a href="#overview">Overview</a> |
  <a href="#development">Development</a> |
  <a href="#contributors">Contributors</a>
</p>

<p align="center">
  <img alt="Preview" width="524" alt="Hero image" src="https://i.imgur.com/OV4yQJG.png"/>
  <br/>
  A simple standalone program which automates the installation, removal and maintenance of <a href="https://github.com/BetterDiscord/BetterDiscord">BetterDiscord</a>.
  <br/>
  <br/>
  <a href="https://discord.gg/0Tmfo5ZbORCRqbAd" target="_blank">
    <img src="https://img.shields.io/discord/86004744966914048?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2LjUzNTMgNS40NTA1M0MzMy44MjMzIC0xLjQ2ODA5IDUwLjg4MTUgMTYuODg2MyA0MS41OTI1IDMzLjYwNjZDMzcuMzczMiA0MS4yMDEyIDI2Ljg5MDQgNDcuMzE3IDE0LjY4NDIgNDEuNTMyNkw2LjE5OTkgNDMuOTU2N0M0Ljg4MzQ2IDQ0LjMzMjggMy42NjY5MyA0My4xMjEyIDQuMDM2MzQgNDEuODAzN0M0LjU0MjcyIDM5Ljk5NzYgNS43NDI1NyAzNS43Mzk4IDYuNDQ0MSAzMy40MzIzQzEuMTgyNzkgMjQuMDQ0IDQuNzMwNSAxMC4xNzQ4IDE2LjUzNTMgNS40NTA1M1pNMTUuOTk1NCAyMC4yNDk2QzE1Ljk5NTQgMjAuOTM5OSAxNi41NTUgMjEuNDk5NiAxNy4yNDU0IDIxLjQ5OTZIMzAuNzQ5OEMzMS40NDAxIDIxLjQ5OTYgMzEuOTk5OCAyMC45Mzk5IDMxLjk5OTggMjAuMjQ5NkMzMS45OTk4IDE5LjU1OTIgMzEuNDQwMSAxOC45OTk2IDMwLjc0OTggMTguOTk5NkgxNy4yNDU0QzE2LjU1NSAxOC45OTk2IDE1Ljk5NTQgMTkuNTU5MiAxNS45OTU0IDIwLjI0OTZaTTE3LjI0OTggMjYuNDc0NkMxNi41NTk0IDI2LjQ3NDYgMTUuOTk5OCAyNy4wMzQyIDE1Ljk5OTggMjcuNzI0NkMxNS45OTk4IDI4LjQxNDkgMTYuNTU5NCAyOC45NzQ2IDE3LjI0OTggMjguOTc0NkgyNi43NDk4QzI3LjQ0MDEgMjguOTc0NiAyNy45OTk4IDI4LjQxNDkgMjcuOTk5OCAyNy43MjQ2QzI3Ljk5OTggMjcuMDM0MiAyNy40NDAxIDI2LjQ3NDYgMjYuNzQ5OCAyNi40NzQ2SDE3LjI0OThaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=" alt="Chat"/>
  </a>
   <a href="https://github.com/BetterDiscord/installer/releases/" target="_blank">
    <img src="https://img.shields.io/github/downloads/BetterDiscord/installer/total?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjI1IDM4LjVIMzUuNzVDMzYuNzE2NSAzOC41IDM3LjUgMzkuMjgzNSAzNy41IDQwLjI1QzM3LjUgNDEuMTY4MiAzNi43OTI5IDQxLjkyMTIgMzUuODkzNSA0MS45OTQyTDM1Ljc1IDQySDEyLjI1QzExLjI4MzUgNDIgMTAuNSA0MS4yMTY1IDEwLjUgNDAuMjVDMTAuNSAzOS4zMzE4IDExLjIwNzEgMzguNTc4OCAxMi4xMDY1IDM4LjUwNThMMTIuMjUgMzguNUgzNS43NUgxMi4yNVpNMjMuNjA2NSA2LjI1NThMMjMuNzUgNi4yNUMyNC42NjgyIDYuMjUgMjUuNDIxMiA2Ljk1NzExIDI1LjQ5NDIgNy44NTY0N0wyNS41IDhWMjkuMzMzTDMwLjI5MzEgMjQuNTQwN0MzMC45NzY1IDIzLjg1NzMgMzIuMDg0NiAyMy44NTczIDMyLjc2OCAyNC41NDA3QzMzLjQ1MTQgMjUuMjI0MiAzMy40NTE0IDI2LjMzMjIgMzIuNzY4IDI3LjAxNTZMMjQuOTg5OCAzNC43OTM4QzI0LjMwNjQgMzUuNDc3MiAyMy4xOTg0IDM1LjQ3NzIgMjIuNTE1IDM0Ljc5MzhMMTQuNzM2OCAyNy4wMTU2QzE0LjA1MzQgMjYuMzMyMiAxNC4wNTM0IDI1LjIyNDIgMTQuNzM2OCAyNC41NDA3QzE1LjQyMDIgMjMuODU3MyAxNi41MjgyIDIzLjg1NzMgMTcuMjExNyAyNC41NDA3TDIyIDI5LjMyOVY4QzIyIDcuMDgxODMgMjIuNzA3MSA2LjMyODgxIDIzLjYwNjUgNi4yNTU4TDIzLjc1IDYuMjVMMjMuNjA2NSA2LjI1NThaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo==" alt="Downloads"/>
  </a>
  <a href="https://github.com/BetterDiscord/Installer/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/BetterDiscord/installer?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjI1IDM4LjVIMzUuNzVDMzYuNzE2NSAzOC41IDM3LjUgMzkuMjgzNSAzNy41IDQwLjI1QzM3LjUgNDEuMTY4MiAzNi43OTI5IDQxLjkyMTIgMzUuODkzNSA0MS45OTQyTDM1Ljc1IDQySDEyLjI1QzExLjI4MzUgNDIgMTAuNSA0MS4yMTY1IDEwLjUgNDAuMjVDMTAuNSAzOS4zMzE4IDExLjIwNzEgMzguNTc4OCAxMi4xMDY1IDM4LjUwNThMMTIuMjUgMzguNUgzNS43NUgxMi4yNVpNMjMuNjA2NSA2LjI1NThMMjMuNzUgNi4yNUMyNC42NjgyIDYuMjUgMjUuNDIxMiA2Ljk1NzExIDI1LjQ5NDIgNy44NTY0N0wyNS41IDhWMjkuMzMzTDMwLjI5MzEgMjQuNTQwN0MzMC45NzY1IDIzLjg1NzMgMzIuMDg0NiAyMy44NTczIDMyLjc2OCAyNC41NDA3QzMzLjQ1MTQgMjUuMjI0MiAzMy40NTE0IDI2LjMzMjIgMzIuNzY4IDI3LjAxNTZMMjQuOTg5OCAzNC43OTM4QzI0LjMwNjQgMzUuNDc3MiAyMy4xOTg0IDM1LjQ3NzIgMjIuNTE1IDM0Ljc5MzhMMTQuNzM2OCAyNy4wMTU2QzE0LjA1MzQgMjYuMzMyMiAxNC4wNTM0IDI1LjIyNDIgMTQuNzM2OCAyNC41NDA3QzE1LjQyMDIgMjMuODU3MyAxNi41MjgyIDIzLjg1NzMgMTcuMjExNyAyNC41NDA3TDIyIDI5LjMyOVY4QzIyIDcuMDgxODMgMjIuNzA3MSA2LjMyODgxIDIzLjYwNjUgNi4yNTU4TDIzLjc1IDYuMjVMMjMuNjA2NSA2LjI1NThaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo==" alt="License"/>
  </a>
</p>

---

# Overview

This repository contains the source code for the BetterDiscord installer. This installer is written with [electron-webpack](https://webpack.electron.build/) and [Svelte 3](https://svelte.dev/).

## Downloads

These will link you to the latest builds found in the [releases](https://github.com/BetterDiscord/installer/releases/) tab of this repository.

> todo:

| [Windows (7+)](https://github.com/BetterDiscord/installer)  | [macOS (10.10+)](https://github.com/BetterDiscord/installer) | [Linux](https://github.com/BetterDiscord/installer) |
| ------------- | ------------- | ------------- |



## Codebase

```
.
├──assets                  // Contains static assets (such as images) used by the installer.
└──src                     // The installer's source code.
    ├──main                // Electron "main" process. Creates and configures the BrowserWindow.
    └──renderer            // Electron "renderer" process. Contains most components and scripts.
        ├──actions         // Scripts performed by the installer such as installing, repairing and uninstalling.
        ├──common          // Common UI components such as buttons, checkboxes, radios, etc...
        ├──pages           // Component files for each page in the installer's setup process.
        ├──stores          // Svelte store used for storing global data.
        └──transitions     // Contains custom Svelte transitions and animations.
```

---

# Development

> This is a tutorial designed for people looking to contribute to, or work directly with the installer's source code. If you are just looking to download and install BetterDiscord, visit the [releases](https://github.com/BetterDiscord/installer) page of this repository.

## Prerequisites
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/) with `npm`.
- Command line of your choice.

## Building

### 1: Clone the repository.
```console
git clone https://github.com/BetterDiscord/installer | cd installer
```
This will create a local copy of this repostory and navigate you to the root folder of the repository.

### 2: Install Dependencies
Run this command at the root folder to install dependencies:
```console
npm i
```

### 3: Run Build Script
To run the installer in development mode, simply run the following command:
```console
npm run dev
```

## Additional Scripts

### Linting
This project uses [ESLint](https://eslint.org/). Run this command to lint your changes:
```console
npm run lint
```

### Compiling & Distribution

---

# Contributors

| <a href="https://github.com/rauenzi" target="_blank"> <img src="https://avatars.githubusercontent.com/u/6865942?s=460&u=4645ddecc8f441ff2af33d18dffd1d2f6b46ecd5&v=4" alt="Github avatar" width="96px" height="96px"> </a> | <a href="https://github.com/Tropix126" target="_blank"> <img src="https://avatars1.githubusercontent.com/u/42101043?s=460&u=f44f07cf7122e1ba61a9e9e8ca83d133c741d011&v=4" alt="Github avatar" width="96px" height="96px"> </a> |
|:-:|:-:|
| rauenzi | Tropix126 |
