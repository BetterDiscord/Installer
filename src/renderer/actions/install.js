import logs from "../stores/logs";
import {progress, status} from "../stores/installation";
import {remote, shell} from "electron";
import fs from "fs";
import path from "path";
import bent from "bent";
import kill from "tree-kill";
import findProcess from "find-process";

const downloadFile = bent("buffer");

function log(entry) {
    logs.update(a => {
        a.push(entry);
        return a;
    });
}

let progressCache = 0;

function addProgress(val) {
    progressCache += val;
    progress.set(progressCache);
}

function failInstallation() {
    const discordURL = "https://discord.gg/0Tmfo5ZbORCRqbAd";
    log("");
    log(`The installation seems to have failed. If this problem is recurring, join our discord community for support. ${discordURL}`);
    status.set("error");
}

const bdFolder = path.join(remote.app.getPath("appData"), "BetterDiscord");
const bdDataFolder = path.join(bdFolder, "data");
const bdPluginsFolder = path.join(bdFolder, "plugins");
const bdThemesFolder = path.join(bdFolder, "themes");
async function makeDirectories() {
    const folders = [bdFolder, bdDataFolder, bdThemesFolder, bdPluginsFolder];
    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            log(`✅ Directory exists: ${folder}`);
            continue;
        }
        try {
            fs.mkdirSync(folder);
            log(`✅ Directory created: ${folder}`);
        }
        catch {
            log(`❌ Failed to create directory: ${folder}`);
            failInstallation();
            return;
        }
    }

    addProgress(25);
}

const downloadUrl = `https://bd.zerebos.com/betterdiscord.asar`;
const asarPath = path.join(bdDataFolder, "betterdiscord.asar");
async function downloadAsar() {
    const buffer = await downloadFile(downloadUrl);
    const originalFs = require("original-fs"); // because electron doesn't like when I write asar files
    originalFs.writeFileSync(asarPath, buffer);
}

async function restartDiscord() {
    const results = await findProcess("name", "Discord", true);
    if (!results || !results.length) return;
    const parentPids = results.map(p => p.ppid);
    const discordPid = results.find(p => parentPids.includes(p.pid));
    const bin = discordPid.bin;
    kill(discordPid.pid);
    shell.openExternal(bin);
}


export default async function(discordPaths) {
    log("Starting installation...");
    log("");
    log("Locating Discord paths...");
    if (!discordPaths || !discordPaths.length) {
        log("❌ Failed to locate required directories.");
        failInstallation();
        return;
    }

    try {
        await makeDirectories();
    }
    catch (err) {
        log(`❌ Failed to create directories - ${err.message}`);
        failInstallation();
        return;
    }
    

    log("");
    log(`Downloading asar file from: ${downloadUrl}`);

    try {
        await downloadAsar();
        log("✅ Package downloaded");
        addProgress(25);
    }
    catch (err) {
        log(`❌ Failed to download package - ${err.message}`);
        failInstallation();
        return;
    }

    log("");
    log("Injecting shims...");
    for (const discordPath of discordPaths) {
        log("Injecting into: " + discordPath);
        const appPath = path.join(discordPath, "app");
        const pkgFile = path.join(appPath, "package.json");
        const indexFile = path.join(appPath, "index.js");
        try {
            if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
            fs.writeFileSync(pkgFile, JSON.stringify({name: "betterdiscord", main: "index.js"}));
            fs.writeFileSync(indexFile, `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`);
            log("✅ Injection successful");
        }
        catch (err) {
            log(`❌ Injection Error - ${err.message}`);
            failInstallation();
            return;
        }
    }


    log("Installation completed!");
    progress.set(100);
    status.set("success");
};