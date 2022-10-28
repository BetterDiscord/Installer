
import {progress, status} from "../stores/installation";
import {remote} from "electron";
import {promises as fs} from "fs";
import originalFs from "original-fs";
import rimraf from "rimraf";
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
const RENAME_ASAR_PROGRESS = 80;
const DELETE_PLUGINS_JSON_PROGRESS = 100;

async function deleteAppDirs(paths) {
    const progressPerLoop = (DELETE_APP_DIRS_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        log("Removing " + discordPath);
        const appPath = path.join(discordPath, "app");
        if (await exists(appPath)) {
            const error = await new Promise(resolve => rimraf(appPath, originalFs, resolve));
            if (error) {
                log(`❌ Could not delete folder ${appPath}`);
                log(`❌ ${error.message}`);
                return error;
            }
        }
        log("✅ Deletion successful");
        progress.set(progress.value + progressPerLoop);
    }
}

async function renameAsar(paths) {
    const progressPerLoop = (RENAME_ASAR_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        const appAsar = path.join(discordPath, "app.asar");
        const discordAsar = path.join(discordPath, "discord.asar");
        log("Renaming " + discordAsar);
        try {
            if (originalFs.existsSync(discordAsar)) await fs.rename(discordAsar, appAsar);
            log("✅ Rename successful");
            progress.set(progress.value + progressPerLoop);
        }
        catch (error) {
            log(`❌ Could not rename asar ${discordAsar}`);
            log(`❌ ${error.message}`);
            return error;
        }

    }
}


const bdFolder = path.join(remote.app.getPath("appData"), "BetterDiscord");
const bdDataFolder = path.join(bdFolder, "data");

async function disableAllPlugins(channels) {
    const progressPerLoop = (DELETE_PLUGINS_JSON_PROGRESS - progress.value) / channels.length;
    for (const channel of channels) {
        const channelFolder = path.join(bdDataFolder, channel);
        const pluginsJson = path.join(channelFolder, "plugins.json");
        try {
            if (originalFs.existsSync(pluginsJson)) {
                await fs.unlink(pluginsJson);
                log(`✅ Deleted plugins.json`);
            }
            else {
                log(`✅ plugins.json does not exist`);
            }
            progress.set(progress.value + progressPerLoop);
            
        }
        catch (err) {
            log(`❌ Failed to delete plugins.json: ${pluginsJson}`);
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


    lognewline("Stopping Discord...");
    const killErr = await kill(channels, (KILL_DISCORD_PROGRESS - progress.value) / channels.length); // await killProcesses(channels);
    if (killErr) {
        showKillNotice();
        return fail();
    }
    log("✅ Discord stopped");
    progress.set(KILL_DISCORD_PROGRESS);


    await new Promise(r => setTimeout(r, 200));
    lognewline("Deleting shims...");
    const deleteShimErr = await deleteAppDirs(paths);
    if (deleteShimErr) return fail();
    log("✅ Shims deleted");
    progress.set(DELETE_APP_DIRS_PROGRESS);


    await new Promise(r => setTimeout(r, 200));
    lognewline("Renaming asars...");
    const renameAsarErr = await renameAsar(paths);
    if (renameAsarErr) return fail();
    log("✅ Asars renamed");
    progress.set(DELETE_APP_DIRS_PROGRESS);
    

    await new Promise(r => setTimeout(r, 200));
    lognewline("Deleting discord modules...");
    const deleteJsonErr = await disableAllPlugins(channels);
    if (deleteJsonErr) return fail();
    log("✅ Modules deleted");
    progress.set(DELETE_PLUGINS_JSON_PROGRESS);


    showInstallNotice(config);
};