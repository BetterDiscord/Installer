import logs from "../stores/logs";
import {progress, status} from "../stores/installation";
import {remote, shell} from "electron";
import fs from "fs";
import path from "path";
import phin from "phin";
import kill from "tree-kill";
import findProcess from "find-process";

const discordURL = "https://discord.gg/0Tmfo5ZbORCRqbAd";

const RC_OK = 0;
const RC_ERROR = 1;

const MAKE_DIR_PROGRESS = 30;
const DOWNLOAD_PACKAGE_PROGRESS = 60; // 60
const INJECT_SHIM_PROGRESS = 90; // 90
const RESTART_DISCORD_PROGRESS = 100; // 100
const MAX_PROGRESS = 100; // MAKE_DIR_PROGRESS + DOWNLOAD_PACKAGE_PROGRESS + INJECT_SHIM_PROGRESS + RESTART_DISCORD_PROGRESS;

let progressCache = 0;
function setProgress(value) {
    progressCache = value;
    progress.set(value);
}

function log(entry) {
    logs.update(a => {
        a.push(entry);
        return a;
    });
}

function fail() {
    log("");
    log(`The installation seems to have failed. If this problem is recurring, join our discord community for support. ${discordURL}`);
    status.set("error");
}

const bdFolder = path.join(remote.app.getPath("appData"), "BetterDiscord");
const bdDataFolder = path.join(bdFolder, "data");
const bdPluginsFolder = path.join(bdFolder, "plugins");
const bdThemesFolder = path.join(bdFolder, "themes");

async function makeDirectories(...folders) {
    const progressPerLoop = (MAKE_DIR_PROGRESS - progressCache) / folders.length;
    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            log(`✅ Directory exists: ${folder}`);
            setProgress(progressCache + progressPerLoop);
            continue;
        }
        try {
            fs.mkdirSync(folder);
            setProgress(progressCache + progressPerLoop);
            log(`✅ Directory created: ${folder}`);
        }
        catch (err) {
            log(`❌ Failed to create directory: ${folder}`);
            log(`❌ ${err.message}`);
            return RC_ERROR;
        }
    }
    return RC_OK;
}

const getJSON = phin.defaults({method: "GET", parse: "json", headers: {"User-Agent": "BetterDiscord Installer"}});
const downloadFile = phin.defaults({method: "GET", followRedirects: true, headers: {"User-Agent": "BetterDiscord Installer", "Accept": "application/octet-stream"}});
const asarPath = path.join(bdDataFolder, "betterdiscord.asar");
async function downloadAsar() {
    let downloadUrl = "https://api.github.com/repos/rauenzi/BetterDiscordApp/releases";
    try {
        const response = await getJSON(downloadUrl);
        const releases = response.body;
        const asset = releases[0].assets.find(a => a.name === "betterdiscord.asar");
        downloadUrl = asset.url;

        const resp = await downloadFile(downloadUrl);
        const originalFs = require("original-fs"); // because electron doesn't like when I write asar files
        originalFs.writeFileSync(asarPath, resp.body);
    }
    catch (err) {
        log(`❌ Failed to download package ${downloadUrl}`);
        log(`❌ ${err.message}`);
        return RC_ERROR;
    }
}

function injectShims(paths) {
    const progressPerLoop = (INJECT_SHIM_PROGRESS - progressCache) / paths.length;
    for (const discordPath of paths) {
        log("Injecting into: " + discordPath);
        const appPath = path.join(discordPath, "app");
        const pkgFile = path.join(appPath, "package.json");
        const indexFile = path.join(appPath, "index.js");
        try {
            if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
            fs.writeFileSync(pkgFile, JSON.stringify({name: "betterdiscord", main: "index.js"}));
            fs.writeFileSync(indexFile, `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`);
            log("✅ Injection successful");
            setProgress(progressCache + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not inject shims to ${discordPath}`);
            log(`❌ ${err.message}`);
            return RC_ERROR;
        }
    }
}

const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
async function restartProcesses(channels) {
    const progressPerLoop = (RESTART_DISCORD_PROGRESS - progressCache) / channels.length;
    for (const channel of channels) {
        let processName = platforms[channel];
        if (process.platform === "win32") processName = platforms[channel].replace(" ", "");
        else if (process.platform === "darwin") processName = `${platforms[channel]}.app`;
        else processName = platforms[channel].toLowerCase().replace(" ", "-");

        try {
            const results = await findProcess("name", processName, true);
            if (!results || !results.length) {
                log(`❌ ${processName} not running`);
                continue;
            }

            const parentPids = results.map(p => p.ppid);
            const discordPid = results.find(p => parentPids.includes(p.pid));
            const bin = discordPid.bin;
            kill(discordPid.pid);
            shell.openExternal(bin);
            setProgress(progressCache + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not restart ${platforms[channel]}`);
            log(`❌ ${err.message}`);
            return RC_ERROR;
        }
    }
}

function showRestartNotice() {
    remote.dialog.showMessageBox({
        type: "info",
        title: "Restart Discord",
        message: "BetterDiscord could not restart Discord. Please restart it manually."
    });
}


export default async function(config) {
    const channels = Object.keys(config);
    const paths = Object.values(config);

    await new Promise(r => setTimeout(r, 500));

    let rc = RC_OK;
    setProgress(0);

    log("Starting installation...");

    log("");
    log("Locating Discord paths...");
    if (!paths || !paths.length) {
        log("❌ Something went wrong internally.");
        return fail();
    }

    log("");
    log("Creating required directories...");
    rc = await makeDirectories(bdFolder, bdDataFolder, bdThemesFolder, bdPluginsFolder);
    if (rc) return fail();
    log("✅ Directories created");
    setProgress(MAKE_DIR_PROGRESS);
    

    log("");
    log("Downloading asar file");
    rc = await downloadAsar();
    if (rc) return fail();
    log("✅ Package downloaded");
    setProgress(DOWNLOAD_PACKAGE_PROGRESS);


    log("");
    log("Injecting shims...");
    rc = injectShims(paths);
    if (rc) return fail();
    log("✅ Shims injected");
    setProgress(INJECT_SHIM_PROGRESS);


    log("");
    log("Restarting Discord...");
    rc = await restartProcesses(channels);
    // if (rc) return fail(); // No need to bail out
    if (rc) showRestartNotice();
    else log("✅ Discord restarted");
    setProgress(RESTART_DISCORD_PROGRESS);


    log("Installation completed!");
    setProgress(MAX_PROGRESS);
    status.set("success");
};