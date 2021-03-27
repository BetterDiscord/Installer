import logs from "../stores/logs";
import {progress, status} from "../stores/installation";
import {remote, shell} from "electron";
import fs from "fs";
import del from "del";
const fsp = fs.promises;
import path from "path";
import kill from "tree-kill";
import findProcess from "find-process";

const discordURL = "https://discord.gg/0Tmfo5ZbORCRqbAd";

const RC_OK = 0;
const RC_ERROR = 1;

const DELETE_SHIM_PROGRESS = 85;
const RESTART_DISCORD_PROGRESS = 15;
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
    log(`The uninstall seems to have failed. If this problem is recurring, join our discord community for support. ${discordURL}`);
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

async function deleteShims(paths) {
    const progressPerLoop = (DELETE_SHIM_PROGRESS - progressCache) / paths.length;
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
                log(`❌ Could not find process ${processName}`);
                return RC_ERROR;
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

    log("Starting uninstall...");

    log("");
    if (!paths || !paths.length) {
        log("❌ Something went wrong internally.");
        return fail();
    }


    log("");
    log("Deleting shims...");
    rc = await deleteShims(paths);
    if (rc) return fail();
    log("✅ Shims deleted");
    setProgress(DELETE_SHIM_PROGRESS);


    log("");
    log("Killing Discord...");
    rc = await restartProcesses(channels);
    // if (rc) return fail(); // No need to bail out
    if (rc) showRestartNotice();
    else log("✅ Discord restarted");
    setProgress(RESTART_DISCORD_PROGRESS);


    log("Uninstall completed!");
    setProgress(MAX_PROGRESS);
    status.set("success");
};