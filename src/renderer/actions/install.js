import logs from "../stores/logs";
import {progress} from "../stores/installation";
import {remote, shell} from "electron";
import fs from "fs";
import path from "path";
import bent from "bent";
import kill from "tree-kill";
import findProcess from "find-process";

const downloadFile = bent("buffer");
// console.log(downloadFile);
// console.log();

function log(entry) {
    logs.update(a => {
        a.push(entry);
        return a;
    });
}

let progressCache = 0;
function setProgress(val) {
    progress.set(val);
}

function addProgress(val) {
    progressCache += val;
    setProgress(progressCache);
}

const bdFolder = path.join(remote.app.getPath("appData"), "BetterDiscord");
const bdDataFolder = path.join(bdFolder, "data");
const bdPluginsFolder = path.join(bdFolder, "plugins");
const bdThemesFolder = path.join(bdFolder, "themes");
function makeDirectories() {
    const folders = [bdFolder, bdDataFolder, bdThemesFolder, bdPluginsFolder];
    for (const folder of folders) {
        addProgress(20 / folders.length);
        if (fs.existsSync(folder)) {
            log(`    ✅ Directory exists: ${folder}`);
            continue;
        }
        try {
            fs.mkdirSync(folder);
            log(`    ✅ Directory created: ${folder}`);
        }
        catch {
            log(`    ❌ Failed to create directory: ${folder}`);
        }
    }
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
    log("Starting to install...");
    if (!discordPaths || !discordPaths.length) return log("Something went wrong");

    makeDirectories();
    setProgress(20);

    // progress.set(10);
    log("");
    log(`Downloading asar file from: ${downloadUrl}`);
    await downloadAsar();
    log("    ✅ Package downloaded");
    progress.set(50);


    progress.set(60);

    log("");
    log("Injecting shims");
    for (const discordPath of discordPaths) {
        log("Injecting into: " + discordPath);
        const appPath = path.join(discordPath, "app");
        const pkgFile = path.join(appPath, "package.json");
        const indexFile = path.join(appPath, "index.js");
        if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);
        fs.writeFileSync(pkgFile, JSON.stringify({name: "betterdiscord", main: "index.js"}));
        fs.writeFileSync(indexFile, `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`);
        log("    ✅ Injection successful");
        log("");
    }



    progress.set(100);
    log("");
    log("✅ Installation completed!");
};