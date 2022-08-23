import logs from "../stores/logs";
import {progress, status} from "../stores/installation";
import {remote, shell} from "electron";
import {promises as fs, copyFileSync} from "fs";
import path from "path";
import phin from "phin";
const tmp = require("tmp");

import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import exists from "./utils/exists";
import reset from "./utils/reset";
import kill from "./utils/kill";
import {showRestartNotice} from "./utils/notices";
import doSanityCheck from "./utils/sanity";

const MAKE_DIR_PROGRESS = 30;
const CHECK_OLD_INSTALL = 40;
const TRANSFER_OLD_ADDONS = 50;
const DOWNLOAD_PACKAGE_PROGRESS = 60;
const INJECT_SHIM_PROGRESS = 90;
const RESTART_DISCORD_PROGRESS = 100;


async function checkOldBDFolder(folder) {
    if (await exists(folder)) {
        log(`⚠️ Found old BD installation: ${folder}.`);
        return true;
    }
    return false;
}


async function transferOldAddons(oldFolder, newFolder) {
    if (await exists(oldFolder)) {
        const addons = await fs.readdir(oldFolder);
        for (let a = 0; a < addons.length; a++) {
            const oldName = path.join(oldFolder, addons[a]);
            const newName = path.join(newFolder, addons[a]);
            const stats = await fs.stat(oldName);
            if (!stats.isFile()) continue;
            try {
                await fs.rename(oldName, newName);
            }
            catch (err) {
                log(`❌ Failed to transfer: ${addons[a]}.`);
            }
        }
    }
}


async function makeDirectories(...folders) {
    const progressPerLoop = (MAKE_DIR_PROGRESS - progress.value) / folders.length;
    for (const folder of folders) {
        if (await exists(folder)) {
            log(`✅ Directory exists: ${folder}.`);
            progress.set(progress.value + progressPerLoop);
            continue;
        }
        try {
            await fs.mkdir(folder);
            progress.set(progress.value + progressPerLoop);
            log(`✅ Directory created: ${folder}.`);
        }
        catch (err) {
            log(`❌ Failed to create directory: ${folder}.`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}


const getJSON = phin.defaults({method: "GET", parse: "json", followRedirects: true, headers: {"User-Agent": "BetterDiscord Installer"}});
const downloadFile = phin.defaults({method: "GET", followRedirects: true, headers: {"User-Agent": "BetterDiscord Installer", "Accept": "application/octet-stream"}});
async function downloadAsar(asarPath) {
    let downloadUrl = "https://api.github.com/repos/BetterDiscord/BetterDiscord/releases";
    try {
        const response = await getJSON(downloadUrl);
        const releases = response.body;
        const asset = releases && releases.length ? releases[0].assets.find(a => a.name === "betterdiscord.asar") : null;
        downloadUrl = asset && asset.url;
        if (!downloadUrl) throw new Error("Unable to find download URL.");

        const resp = await downloadFile(downloadUrl);
        const originalFs = require("original-fs").promises; // because electron doesn't like when I write asar files
        await originalFs.writeFile(asarPath, resp.body);
    }
    catch (err) {
        log(`❌ Failed to download package ${downloadUrl}.`);
        log(`❌ ${err.message}`);
        return err;
    }
}


async function injectShims(discordPaths, bdFolders) {
    // * Mac and Windows: All Discord installations share a single, absolute
    //   folder path where BetterDiscord is installed (in "bdFolders[0]").
    // * Linux: Every Discord installation has its own BetterDiscord folder,
    //   and uses relative paths to load them, so we don't need "bdFolders".
    //   Flatpaks/Snaps have individual per-Discord-channel BetterDiscord folders,
    //   since every sandboxed installation has their own xdg-config structure,
    //   whereas all native installations share the `~/.config/BetterDiscord` folder.
    const progressPerLoop = (INJECT_SHIM_PROGRESS - progress.value) / discordPaths.length;
    for (const discordPath of discordPaths) {
        log(`Injecting into: ${discordPath}.`);
        try {
            if (process.platform === "win32" || process.platform === "darwin") {  // Windows and Mac.
                const asarPath = path.join(bdFolders[0], "data", "betterdiscord.asar");
                const appPath = path.join(discordPath, "app");
                const pkgFile = path.join(appPath, "package.json");
                const indexFile = path.join(appPath, "index.js");

                if (!(await exists(appPath))) await fs.mkdir(appPath);
                await fs.writeFile(
                    pkgFile,
                    JSON.stringify({name: "betterdiscord", main: "index.js"})
                );
                await fs.writeFile(
                    indexFile,
                    `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`
                );
            }
            else {  // Linux.
                await fs.writeFile(
                    path.join(discordPath, "index.js"),
                    "require('../../../../BetterDiscord/data/betterdiscord.asar');\nmodule.exports = require('./core.asar');"
                );
            }
            log("✅ Injection successful.");
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not inject loader for ${discordPath}.`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}


export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();

    // Installation channels (such as "stable", "canary") and their latest version's paths.
    const channels = Object.keys(config);
    const discordPaths = Object.values(config);


    // Legacy BD paths. We will offer to migrate old data from these locations.
    const legacyBDFolders = [];
    if (process.platform === "darwin") {  // Mac.
        legacyBDFolders.push(path.join(remote.app.getPath("home"), "Library", "Preferences", "betterdiscord"));
    }
    else if (process.platform === "linux") {
        // Example: Migrating data from `~/.config/BetterDiscord` to a new location.
        // NOTE: This is just an example if we decide to move to per-Discord BD installations later.
        //legacyBDFolders.push(path.join(remote.app.getPath("appData"), "BetterDiscord"));
    }

    // Latest BD paths. This is where we'll install BetterDiscord's ASAR package.
    const bdFolders = [];
    if (process.platform === "win32" || process.platform === "darwin") {
        // Windows and Mac: BetterDiscord stored in a single, shared location.
        bdFolders.push(path.join(remote.app.getPath("appData"), "BetterDiscord"));
    }
    else {  // Linux.
        // NOTE: On Linux, we install BetterDiscord into every Discord instance's
        // individual xdg-config directory, to be able to support Flatpaks and Snaps,
        // and to avoid conflicts if multiple sandboxed Discord versions run at the
        // same time. Only the sandboxes have truly unique "per-installation" BD paths.
        for (const discordPath of discordPaths) {
            // Jump out of the latest Discord version's subdirectory, to the Discord
            // installation's main xdg-config directory, and install BetterDiscord there.
            // Before: "/home/foo/.var/app/com.discordapp.Discord/config/discord/0.0.19/modules/discord_desktop_core".
            // After: "/home/foo/.var/app/com.discordapp.Discord/config/BetterDiscord".
            // NOTE: Installation paths on Linux always contain those 4 suffix parts.
            // NOTE: The requirement that BetterDiscord is installed in xdg-config
            // is hardcoded into betterdiscord.asar, so we can't change these paths.
            bdFolders.push(path.join(discordPath, "../../../..", "BetterDiscord"));
        }
    }

    if (bdFolders.length < 1) {
        lognewline("No Discord paths provided.");
        return fail();
    }


    // Create BetterDiscord's directory hierarchies.
    lognewline("Creating required directories...");
    for (const bdBaseFolder of bdFolders) {
        const makeDirErr = await makeDirectories(
            bdBaseFolder,
            path.join(bdBaseFolder, "data"),
            path.join(bdBaseFolder, "plugins"),
            path.join(bdBaseFolder, "themes")
        );
        if (makeDirErr) return fail();
    }
    log("✅ Directories created.");
    progress.set(MAKE_DIR_PROGRESS);


    // Migrate old BetterDiscord data to the new locations.
    if (legacyBDFolders.length >= 1) {
        const platformName = (process.platform === "win32" ? "Windows" : (process.platform === "darwin" ? "macOS" : "Linux"));
        lognewline(`Checking for old ${platformName} installations...`);
        progress.set(CHECK_OLD_INSTALL);
        for (const oldBDFolder of legacyBDFolders) {
            const found = await checkOldBDFolder(oldBDFolder);
            if (found) {
                // NOTE: We migrate the data to the first new folder, which due
                // to the UI structure always means Discord Stable (if selected).
                // Most users only have one installation of Discord, so it doesn't
                // make any sense to put a bunch of effort here into copying the
                // data into every new installation path on multi-Discord systems.
                const targetBDFolder = bdFolders[0];
                if (oldBDFolder === targetBDFolder) continue;  // Skip if this would be "migration" into itself.

                const confirmation = await remote.dialog.showMessageBox(remote.BrowserWindow.getFocusedWindow(), {
                    type: "question",
                    title: "Old Install Found",
                    message: `Found an old BetterDiscord installation:\n${oldBDFolder}\n\nDo you want to transfer your plugins and themes?`,
                    noLink: true,
                    cancelId: 1,
                    buttons: ["Yes", "No"]
                });

                if (confirmation.response === 0) {
                    await transferOldAddons(path.join(oldBDFolder, "plugins"), path.join(targetBDFolder, "plugins"));
                    await transferOldAddons(path.join(oldBDFolder, "themes"), path.join(targetBDFolder, "themes"));
                    progress.set(TRANSFER_OLD_ADDONS);
                }
            }
        }
    }


    // Download BetterDiscord's ASAR into every installation path.
    lognewline("Downloading latest BetterDiscord ASAR package...");
    const asarTempPath = tmp.tmpNameSync();
    const downloadErr = await downloadAsar(asarTempPath);
    if (downloadErr) return fail();
    let asarInstalled = true;
    const asarInstalledPaths = new Set();
    for (const bdBaseFolder of bdFolders) {
        // Install the downloaded ASAR into every unique destination path.
        const asarTargetPath = path.join(bdBaseFolder, "data", "betterdiscord.asar");
        if (asarInstalledPaths.has(asarTargetPath)) continue;
        asarInstalledPaths.add(asarTargetPath);
        try {
            copyFileSync(asarTempPath, asarTargetPath);  // Overwrites.
        }
        catch (err) {
            log(`❌ Failed to write destination file: ${asarTargetPath}.`);
            asarInstalled = false;
            break;
        }
    }
    try { await fs.unlink(asarTempPath); } catch (err) { }  // Clean up tmp file.
    if (!asarInstalled) return fail();
    log("✅ Package downloaded.");
    progress.set(DOWNLOAD_PACKAGE_PROGRESS);


    // Add BetterDiscord to each Discord version's loader-script.
    lognewline("Injecting into Discord...");
    const injectErr = await injectShims(discordPaths, bdFolders);
    if (injectErr) return fail();
    log("✅ Loader scripts injected.");
    progress.set(INJECT_SHIM_PROGRESS);


    // Automatically restart Discord clients if they are running.
    lognewline("Restarting Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice();  // No need to bail out if we failed, just tell user to restart manually.
    else log("✅ Discord restarted.");
    progress.set(RESTART_DISCORD_PROGRESS);


    succeed();
};