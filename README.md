<h1 align="center">BetterDiscord Installer</h1>

<p align="center">
  <a href="#overview">Overview</a> |
  <a href="#development">Development</a> |
  <a href="#contributors">Contributors</a>
</p>

<p align="center">
  <img alt="Preview" width="524" src="https://i.imgur.com/OV4yQJG.png">
<p align="center">

<p align="center">A simple standalone program which automates the installation, removal and maintenance of <a href="https://github.com/BetterDiscord/BetterDiscord">BetterDiscord</a>.</p>

---

# Overview

### About

This repository contains the source code for the BetterDiscord installer. This installer is written with [electron-webpack](https://webpack.electron.build/) and [Svelte 3](https://svelte.dev/). Downloads can be found [here](https://github.com/BetterDiscord/Installer/releases/latest).

### Codebase

```
.
├───assets                // Contains static assets (such as images) used by the installer.
└───src                   // The installer's source code.
    ├───main              // Electron "main" process. Creates and configures the BrowserWindow.
    └───renderer          // Electron "renderer" process. Contains most components and scripts.
        ├───actions       // Scripts performed by the installer such as installing, repairing and uninstalling.
        ├───common        // Common UI components such as buttons, checkboxes, radios, etc...
        ├───pages         // Component files for each page in the installer's setup process.
        └───stores        // Svelte store used for storing global data.
```

---

# Development

> This is a tutorial designed for people looking to contribute to, or work directly with the installer's source code. If you are just looking to download and install BetterDiscord, visit the [releases](https://github.com/BetterDiscord/installer) page of this repository.

### Prerequisites
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/) with `npm`.
- Command line of your choice.

## Building

### 1: Clone the repository.
```
git clone https://github.com/BetterDiscord/installer | cd installer
```
This will create a local copy of this repostory and navigate you to the root folder of the repository.

### 2: Install Dependencies
Run this command at the root folder to install dependencies:
```
npm i
```

### 3: Run Build Script
To run the installer in development mode, simply run the following command:
```
npm run dev
```

## Additional Scripts

### Linting
This project uses [ESLint](https://eslint.org/). Run this command to lint your changes:
```
npm run lint
```

### Compiling & Distribution

---

# Contributors

| <a href="https://github.com/rauenzi" target="_blank"> <img src="https://avatars.githubusercontent.com/u/6865942?s=460&u=4645ddecc8f441ff2af33d18dffd1d2f6b46ecd5&v=4" alt="Github avatar" width="96px" height="96px"> </a> | <a href="https://github.com/Tropix126" target="_blank"> <img src="https://avatars1.githubusercontent.com/u/42101043?s=460&u=f44f07cf7122e1ba61a9e9e8ca83d133c741d011&v=4" alt="Github avatar" width="96px" height="96px"> </a> |
|:-:|:-:|
| rauenzi | Tropix126 |
