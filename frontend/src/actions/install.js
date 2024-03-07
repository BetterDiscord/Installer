import {progress, status} from "../stores/installation";
// import {remote, shell} from "electron";
// import {promises as fs} from "fs";
// import path from "path";
// import phin from "phin";

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

// TODO: wails
// const bdFolder = path.join(remote.app.getPath("appData"), "BetterDiscord");
// const bdFolder = path.join(__dirname, "BetterDiscord");
// const bdDataFolder = path.join(bdFolder, "data");
// const bdPluginsFolder = path.join(bdFolder, "plugins");
// const bdThemesFolder = path.join(bdFolder, "themes");


async function makeDirectories(...folders) {
    const progressPerLoop = (MAKE_DIR_PROGRESS - progress.value) / folders.length;
    for (const folder of folders) {
        if (await exists(folder)) {
            log(`✅ Directory exists: ${folder}`);
            progress.set(progress.value + progressPerLoop);
            continue;
        }
        try {
            await fs.mkdir(folder);
            progress.set(progress.value + progressPerLoop);
            log(`✅ Directory created: ${folder}`);
        }
        catch (err) {
            log(`❌ Failed to create directory: ${folder}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}

// TODO: wails
// const getJSON = phin.defaults({method: "GET", parse: "json", followRedirects: true, headers: {"User-Agent": "BetterDiscord/Installer"}});
// const downloadFile = phin.defaults({method: "GET", followRedirects: true, headers: {"User-Agent": "BetterDiscord/Installer", "Accept": "application/octet-stream"}});
async function downloadAsar() {
    try {
        const response = await downloadFile("https://betterdiscord.app/Download/betterdiscord.asar")
        const bdVersion = response.headers["x-bd-version"];
        if (response.statusCode >= 200 && response.statusCode < 300) {
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
        if (response.statusCode >= 200 && response.statusCode < 300) {
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

// TODO: wails
// const asarPath = path.join(bdDataFolder, "betterdiscord.asar");
async function installAsar(fileContent) {
    try {
        // TODO: confirm wails
        // const originalFs = require("original-fs").promises; // because electron doesn't like writing asar files
        await fs.writeFile(asarPath, fileContent);
    }
    catch (error) {
        log(`❌ Failed to write package to disk: ${asarPath}`);
        log(`❌ ${error.message}`);
        throw error;
    }
}

async function downloadAndInstallAsar() {
    try {
        const fileContent = await downloadAsar();
        await installAsar(fileContent);
    } 
    catch (error) {
        return error;
    }
}

async function injectShims(paths) {
    const progressPerLoop = (INJECT_SHIM_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        log("Injecting into: " + discordPath);
        try {
            await fs.writeFile(path.join(discordPath, "index.js"), `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");\nmodule.exports = require("./core.asar");`);
            log("✅ Injection successful");
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not inject shims to ${discordPath}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}


export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();


    const channels = Object.keys(config);
    const paths = Object.values(config);


    lognewline("Creating required directories...");
    const makeDirErr = await makeDirectories(bdFolder, bdDataFolder, bdThemesFolder, bdPluginsFolder);
    if (makeDirErr) return fail();
    log("✅ Directories created");
    progress.set(MAKE_DIR_PROGRESS);
    

    lognewline("Downloading asar file");
    const downloadErr = await downloadAndInstallAsar();
    if (downloadErr) return fail();
    log("✅ Package downloaded");
    progress.set(DOWNLOAD_PACKAGE_PROGRESS);


    lognewline("Injecting shims...");
    const injectErr = await injectShims(paths);
    if (injectErr) return fail();
    log("✅ Shims injected");
    progress.set(INJECT_SHIM_PROGRESS);


    lognewline("Restarting Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice(); // No need to bail out and show failed
    else log("✅ Discord restarted");
    progress.set(RESTART_DISCORD_PROGRESS);


    succeed();
};
