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
const DOWNLOAD_PACKAGE_PROGRESS = 60;
const INJECT_SHIM_PROGRESS = 90;
const RESTART_DISCORD_PROGRESS = 100;

const RELEASE_API = "https://api.github.com/repos/BetterDiscord/BetterDiscord/releases";

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

const getJSON = phin.defaults({method: "GET", parse: "json", followRedirects: true, headers: {"User-Agent": "BetterDiscord/Installer"}});
const downloadFile = phin.defaults({method: "GET", followRedirects: true, headers: {"User-Agent": "BetterDiscord/Installer", "Accept": "application/octet-stream"}});
async function downloadAsar() {
    try {
        const response = await downloadFile("https://betterdiscord.app/Download/betterdiscord.asar")
        const bdVersion = response.headers["x-bd-version"];
        if (200 <= response.statusCode && response.statusCode < 300) {
            log(`✅ Downloaded BetterDiscord version ${bdVersion} from the official website`);
            return response.body;
        }
        throw new Error(`Status code did not indicate success: ${response.statusCode}`);
    }
    catch (error) {
        log(`❌ Failed to download package from the official website`);
        log(`❌ ${error.message}`);
        log(`Falling back to GitHub...`);
    }
    let assetUrl;
    let bdVersion;
    try {
        const response = await getJSON(RELEASE_API);
        const releases = response.body;
        const asset = releases && releases.length && releases[0].assets && releases[0].assets.find(a => a.name.toLowerCase() === "betterdiscord.asar");
        assetUrl = asset && asset.url;
        bdVersion = asset && releases[0].tag_name;
        if (!assetUrl) {
            let errMessage = "Could not get the asset url";
            if (!asset) errMessage = "Could not get asset object";
            if (!releases) errMessage = "Could not get response body";
            if (!response) errMessage = "Could not get any response";
            throw new Error(errMessage);
        }
    }
    catch (error) {
        log(`❌ Failed to get asset url from ${RELEASE_API}`);
        log(`❌ ${error.message}`);
        throw error;
    }
    try {
        const response = await downloadFile(assetUrl);
        if (200 <= response.statusCode && response.statusCode < 300) {
            log(`✅ Downloaded BetterDiscord version ${bdVersion} from GitHub`);
            return response.body;
        }
        throw new Error(`Status code did not indicate success: ${response.statusCode}`);
    }
    catch (error) {
        log(`❌ Failed to download package from ${assetUrl}`);
        log(`❌ ${error.message}`);
        throw error;
    }
}

async function installAsar(fileContent, bdFolder) {
    const bdDataFolder = path.join(bdFolder, "data");
    const asarPath = path.join(bdDataFolder, "betterdiscord.asar");
    try {
        const originalFs = require("original-fs").promises; // because electron doesn't like writing asar files
        await originalFs.writeFile(asarPath, fileContent);
    }
    catch (error) {
        log(`❌ Failed to write package to disk: ${asarPath}`);
        log(`❌ ${error.message}`);
        throw error;
    }
}

async function downloadAndInstallAsar(bdFolders) {
    try {
        const fileContent = await downloadAsar();
        for (const bdFolder of bdFolders) {
            await installAsar(fileContent, bdFolder);
        }
    } 
    catch (error) {
        return error;
    }
}

async function injectShims(paths, bdFolders) {
    // * Mac and Windows: All Discord installations share a single, absolute
    //   folder path where BetterDiscord is installed (in "bdFolders[0]").
    // * Linux: Every Discord installation has its own BetterDiscord folder,
    //   and uses relative paths to load them, so we don't need "bdFolders".
    //   Flatpaks/Snaps have individual per-Discord-channel BetterDiscord folders,
    //   since every sandboxed installation has their own xdg-config structure,
    //   whereas all native installations share the `~/.config/BetterDiscord` folder.
    const progressPerLoop = (INJECT_SHIM_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        log(`Injecting into: ${discordPath}.`);
        try {
            if (process.platform === "win32" || process.platform === "darwin") { // Windows and Mac.
                const asarPath = path.join(bdFolders[0], "data", "betterdiscord.asar");
                await fs.writeFile(path.join(discordPath, "index.js"), `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");\nmodule.exports = require("./core.asar");`);
            }
            else { // Linux.
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
    const paths = Object.values(config);

    // Latest BD paths. This is where we'll install BetterDiscord's ASAR package.
    const bdFolders = [];
    if (process.platform === "win32" || process.platform === "darwin") {
        // Windows and Mac: BetterDiscord stored in a single, shared location.
        bdFolders.push(path.join(remote.app.getPath("appData"), "BetterDiscord"));
    }
    else { // Linux.
        // NOTE: On Linux, we install BetterDiscord into every Discord instance's
        // individual xdg-config directory, to be able to support Flatpaks and Snaps,
        // and to avoid conflicts if multiple sandboxed Discord versions run at the
        // same time. Only the sandboxes have truly unique "per-installation" BD paths.
        for (const discordPath of paths) {
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
    for (const bdFolder of bdFolders) {
        const makeDirErr = await makeDirectories(
            bdFolder,
            path.join(bdFolder, "data"),
            path.join(bdFolder, "plugins"),
            path.join(bdFolder, "themes")
        );
        if (makeDirErr) return fail();
    }
    log("✅ Directories created.");
    progress.set(MAKE_DIR_PROGRESS);
    

    lognewline("Downloading asar file");
    const downloadErr = await downloadAndInstallAsar(bdFolders);
    if (downloadErr) return fail();
    log("✅ Package downloaded.");
    progress.set(DOWNLOAD_PACKAGE_PROGRESS);


    // Add BetterDiscord to each Discord version's loader-script.
    lognewline("Injecting into Discord...");
    const injectErr = await injectShims(paths);
    if (injectErr) return fail();
    log("✅ Loader scripts injected.");
    progress.set(INJECT_SHIM_PROGRESS);


    // Automatically restart Discord clients if they are running.
    lognewline("Restarting Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice(); // No need to bail out if we failed, just tell user to restart manually.
    else log("✅ Discord restarted.");
    progress.set(RESTART_DISCORD_PROGRESS);


    succeed();
};
