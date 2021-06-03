import {progress, status} from "../stores/installation";
import {remote} from "electron";
import {promises as fs} from "fs";
import del from "del";
import path from "path";
import install from "./install.js";
import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import exists from "./utils/exists";
import kill from "./utils/kill";
import reset from "./utils/reset";
import {showKillNotice} from "./utils/notices";
import doSanityCheck from "./utils/sanity";

const KILL_DISCORD_PROGRESS = 20;
const DELETE_APP_DIRS_PROGRESS = 50;
const DELETE_MODULE_DIRS_PROGRESS = 100;

async function deleteAppDirs(paths) {
    const progressPerLoop = (DELETE_APP_DIRS_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        log("Removing " + discordPath);
        const appPath = path.join(discordPath, "app");
        try {
            if (await exists(appPath)) await del(appPath, {force: true});
            log("✅ Deletion successful");
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(` Could not delete folder ${appPath}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}

const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
async function deleteModuleDirs(config) {
    const size = Object.keys(config).length;
    const progressPerLoop = (DELETE_MODULE_DIRS_PROGRESS - progress.value) / size;
    for (const channel in config) {
        const roaming = path.join(remote.app.getPath("userData"), "..", platforms[channel].replace(" ", "").toLowerCase());
        try {
            const versionDir = (await fs.readdir(roaming)).find(d => d.split(".").length > 2);
            if (await exists(path.join(versionDir, "modules"))) await del(versionDir, {force: true});
            log("✅ Deletion successful");
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not delete modules in ${roaming}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}

async function showInstallNotice(config) {
    const confirmation = await remote.dialog.showMessageBox(remote.BrowserWindow.getFocusedWindow(), {
        type: "question",
        title: "Reinstall BetterDiscord?",
        message: "After repairing, you need to reinstall BetterDiscord. Would you like to do that now?",
        noLink: true,
        cancelId: 1,
        buttons: ["Yes", "No"]
    });

    if (confirmation.response !== 0) return succeed();

    await reset();
    await install(config);
    remote.dialog.showMessageBox(remote.BrowserWindow.getFocusedWindow(), {
        type: "info",
        title: "Reinstall Complete",
        message: "Please relaunch discord manually to finish the repair."
    });
}


export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();


    const channels = Object.keys(config);
    const paths = Object.values(config);


    lognewline("Killing Discord...");
    const killErr = await kill(channels, (KILL_DISCORD_PROGRESS - progress.value) / channels.length, false); // await killProcesses(channels);
    if (killErr) {
        showKillNotice();
        return fail();
    }
    log("✅ Discord Killed");
    progress.set(KILL_DISCORD_PROGRESS);


    await new Promise(r => setTimeout(r, 200));
    lognewline("Deleting shims...");
    const deleteShimErr = await deleteAppDirs(paths);
    if (deleteShimErr) return fail();
    log("✅ Shims deleted");
    progress.set(DELETE_APP_DIRS_PROGRESS);
    

    await new Promise(r => setTimeout(r, 200));
    lognewline("Deleting discord modules...");
    const deleteModulesErr = await deleteModuleDirs(config);
    if (deleteModulesErr) return fail();
    log("✅ Shims deleted");
    progress.set(DELETE_MODULE_DIRS_PROGRESS);


    showInstallNotice(config);
};