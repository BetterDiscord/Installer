import logs from "../stores/logs";
import {progress, status} from "../stores/installation";
import {remote, shell} from "electron";
import {promises as fs} from "fs";
import path from "path";
import phin from "phin";
import asar from "asar";

import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import exists from "./utils/exists";
import reset from "./utils/reset";
import kill from "./utils/kill";
import {showRestartNotice} from "./utils/notices";
import doSanityCheck from "./utils/sanity";
import doPortableCheck from "./utils/portable";

const MAKE_DIR_PROGRESS = 30;
const DOWNLOAD_PACKAGE_PROGRESS = 60;
const INJECT_SHIM_PROGRESS = 90;
const RESTART_DISCORD_PROGRESS = 100;

let bdFolder = path.join(remote.app.getPath("appData"), "BetterDiscord");
let bdDataFolder = path.join(bdFolder, "data");
let bdPluginsFolder = path.join(bdFolder, "plugins");
let bdThemesFolder = path.join(bdFolder, "themes");

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

const getJSON = phin.defaults({method: "GET", parse: "json", followRedirects: true, headers: {"User-Agent": "BetterDiscord Installer"}});
const downloadFile = phin.defaults({method: "GET", followRedirects: true, headers: {"User-Agent": "BetterDiscord Installer", "Accept": "application/octet-stream"}});
let asarPath = path.join(bdDataFolder, "betterdiscord.asar");
async function downloadAsar() {
    let downloadUrl = "https://api.github.com/repos/BetterDiscord/BetterDiscord/releases";
    try {
        const response = await getJSON(downloadUrl);
        const releases = response.body;
        const asset = releases && releases.length ? releases[0].assets.find(a => a.name === "betterdiscord.asar") : "https://api.github.com/repos/BetterDiscord/BetterDiscord/releases/assets/39982244"; // temporary workaround
        downloadUrl = asset.url;

        const resp = await downloadFile(downloadUrl);
        const originalFs = require("original-fs").promises; // because electron doesn't like when I write asar files
        await originalFs.writeFile(asarPath, resp.body);
    }
    catch (err) {
        log(`❌ Failed to download package ${downloadUrl}`);
        log(`❌ ${err.message}`);
        return err;
    }
}

let isPortable = false;

async function migratePortable(paths) {
    for (const discordPath of paths) {
        const appFolder = path.join(discordPath, "app");
        const appBackup = path.join(discordPath, "app_org");
        const appAsar = path.join(discordPath, "app.asar");

        // Pack app folder to App.asar
        try {

            // Create App.asar
            const isAsarExist = await exists(appAsar);
            if (!isAsarExist) {
                await asar.createPackage(appFolder, appAsar);

                log("✅ App.asar created");
            }

            // Renamme App folder for backup
            const isBackupExist = await exists(appBackup);
            if (!isBackupExist) {
                await fs.rename(appFolder, appBackup);

                log("✅ App backup done");
            }
        }
        catch (err) {
            log(`❌ Could not migrate portble to ${discordPath}`);
            log(`❌ ${err.message}`);
            return err;
        }


        // Map global path for compatible
        bdFolder = path.join(discordPath, "..", "..", "..", "BetterDiscord");
        asarPath = path.join(discordPath, "betterdiscord.asar");

        // Unusable since first time run will create them
        bdDataFolder = path.join(bdFolder, "data");
        bdPluginsFolder = path.join(bdFolder, "plugins");
        bdThemesFolder = path.join(bdFolder, "themes");
    }
}

async function injectShims(paths) {
    const progressPerLoop = (INJECT_SHIM_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        log("Injecting into: " + discordPath);
        const appPath = path.join(discordPath, "app");
        const pkgFile = path.join(appPath, "package.json");
        const indexFile = path.join(appPath, "index.js");
        try {
            if (process.platform === "win32" || process.platform === "darwin") {
                if (!(await exists(appPath))) await fs.mkdir(appPath);
                await fs.writeFile(pkgFile, JSON.stringify({name: "betterdiscord", main: "index.js"}));
                await fs.writeFile(indexFile, `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");`);
            }
            else {
                await fs.writeFile(path.join(discordPath, "index.js"), `require("${asarPath.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}");\nmodule.exports = require("./core.asar");`);
            }
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


export default async function (config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();


    const channels = Object.keys(config);
    const paths = Object.values(config);


    isPortable = await doPortableCheck(config);
    if (isPortable) {
        const migrateErr = await migratePortable(paths);
        if (migrateErr) return fail();
        log("✅ Migrated Portable Version");
    }


    lognewline("Creating required directories...");
    const makeDirErr = await makeDirectories(bdFolder, bdDataFolder, bdThemesFolder, bdPluginsFolder);
    if (makeDirErr) return fail();
    log("✅ Directories created");
    progress.set(MAKE_DIR_PROGRESS);


    lognewline("Downloading asar file");
    const downloadErr = await downloadAsar();
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