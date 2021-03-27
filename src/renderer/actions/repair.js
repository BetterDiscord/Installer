import logs from "../stores/logs";
import {progress, status, action} from "../stores/installation";
import {remote, shell} from "electron";
import fs from "fs";
const fsp = fs.promises;
import del from "del";
import path from "path";
import kill from "tree-kill";
import findProcess from "find-process";
import {replace} from "svelte-spa-router";

const discordURL = "https://discord.gg/0Tmfo5ZbORCRqbAd";

const RC_OK = 0;
const RC_ERROR = 1;

const KILL_DISCORD_PROGRESS = 20;
const DELETE_APP_DIRS_PROGRESS = 50;
const DELETE_MODULE_DIRS_PROGRESS = 100;
const START_DISCORD_PROGRESS = 100;
const MAX_PROGRESS = 100;

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
    log(`The repair seems to have failed. If this problem is recurring, join our discord community for support. ${discordURL}`);
    status.set("error");
}

async function exists(file) {
    try {
        await fsp.stat(file);
        return true;
    }
    catch {
        return false;
    }
}

async function deleteAppDirs(paths) {
    const progressPerLoop = (DELETE_APP_DIRS_PROGRESS - progressCache) / paths.length;
    for (const discordPath of paths) {
        log("Removing " + discordPath);
        const appPath = path.join(discordPath, "app");
        try {
            if (await exists(appPath)) await del(appPath, {force: true});
            log("✅ Deletion successful");
            setProgress(progressCache + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not delete folder ${appPath}`);
            log(`❌ ${err.message}`);
            return RC_ERROR;
        }
    }
}

async function deleteModuleDirs(config) {
    const size = Object.keys(config).length;
    const progressPerLoop = (DELETE_MODULE_DIRS_PROGRESS - progressCache) / size;
    for (const channel in config) {
        const roaming = path.join(remote.app.getPath("userData"), "..", platforms[channel].replace(" ", "").toLowerCase());
        try {
            const versionDir = fs.readdirSync(roaming).find(d => d.split(".").length > 2);
            if (await exists(path.join(versionDir, "modules"))) await del(versionDir, {force: true});
            log("✅ Deletion successful");
            setProgress(progressCache + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not delete modules in ${roaming}`);
            log(`❌ ${err.message}`);
            return RC_ERROR;
        }
    }
}

const executables = {stable: "", ptb: "", canary: ""};
const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
async function killProcesses(channels) {
    const progressPerLoop = (KILL_DISCORD_PROGRESS - progressCache) / channels.length;
    for (const channel of channels) {
        let processName = platforms[channel];
        if (process.platform === "win32") processName = platforms[channel].replace(" ", "");
        else if (process.platform === "darwin") processName = `${platforms[channel]}.app`;
        else processName = platforms[channel].toLowerCase().replace(" ", "-");

        try {
            const results = await findProcess("name", processName, true);
            if (!results || !results.length) {
                log(`✅ ${processName} not running`);
                setProgress(progressCache + progressPerLoop);
                return RC_OK;
            }

            const parentPids = results.map(p => p.ppid);
            const discordPid = results.find(p => parentPids.includes(p.pid));
            const bin = discordPid.bin;
            kill(discordPid.pid);
            executables[channel] = bin; // shell.openExternal(bin);
            setProgress(progressCache + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not kill ${platforms[channel]}`);
            log(`❌ ${err.message}`);
            return RC_ERROR;
        }
    }
}

// function startProcesses() {
//     const progressPerLoop = (START_DISCORD_PROGRESS - progressCache) / executables.length;
//     for (const channel in executables) {
//         const exe = executables[channel];
//         try {
//             shell.openExternal(exe);
//             setProgress(progressCache + progressPerLoop);
//         }
//         catch (err) {
//             log(`❌ Could not start ${platforms[channel]} (${exe})`);
//             log(`❌ ${err.message}`);
//             return RC_ERROR;
//         }
//     }
// }

function showKillNotice() {
    remote.dialog.showMessageBox({
        type: "info",
        title: "Shutdown Discord",
        message: "BetterDiscord could not shutdown Discord. Please make sure Discord is shut down, then run the installer again."
    });
}

// function showRestartNotice() {
//     remote.dialog.showMessageBox({
//         type: "info",
//         title: "Restart Discord",
//         message: "BetterDiscord could not restart Discord. Please restart it manually."
//     });
// }

async function showInstallNotice() {
    const confirmation = await remote.dialog.showMessageBox(remote.BrowserWindow.getFocusedWindow(), {
        type: "info",
        title: "Reinstall BetterDiscord",
        message: "After repairing, you need to reinstall BetterDiscord. Do you want to reinstall now?",
        noLink: true,
        cancelId: 1,
        buttons: ["Yes", "No"]
    });

    if (confirmation.response === 0) {
        action.set("install");
        replace("/actions");
    }
}


export default async function(config) {
    const channels = Object.keys(config);
    const paths = Object.values(config);

    await new Promise(r => setTimeout(r, 500));

    let rc = RC_OK;
    setProgress(0);

    log("Starting Repair...");

    log("");
    if (!paths || !paths.length) {
        log("❌ Something went wrong internally.");
        return fail();
    }

    log("");
    log("Killing Discord...");
    rc = await killProcesses(channels);
    if (rc) {
        showKillNotice();
        return fail();
    }
    log("✅ Discord Killed");
    setProgress(KILL_DISCORD_PROGRESS);


    log("");
    log("Deleting shims...");
    rc = await deleteAppDirs(paths);
    if (rc) return fail();
    log("✅ Shims deleted");
    setProgress(DELETE_APP_DIRS_PROGRESS);
    

    log("");
    log("Deleting discord modules...");
    rc = await deleteModuleDirs(config);
    if (rc) return fail();
    log("✅ Shims deleted");
    setProgress(DELETE_MODULE_DIRS_PROGRESS);


    // log("");
    // log("Killing Discord...");
    // rc = startProcesses();
    // // if (rc) return fail(); // No need to bail out
    // if (rc) showRestartNotice();
    // else log("✅ Discord restarted");
    // log("✅ Shims injected");
    // setProgress(START_DISCORD_PROGRESS);


    log("Repair completed!");
    setProgress(MAX_PROGRESS);
    status.set("success");

    showInstallNotice();
};