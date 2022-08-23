import {progress, status} from "../stores/installation";
import {remote} from "electron";
const fs = require("fs");
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
import {findLatestDiscordVersion} from "./paths";

const KILL_DISCORD_PROGRESS = 20;
const DELETE_APP_DIRS_PROGRESS = 50;
const DELETE_MODULE_DIRS_PROGRESS = 100;


async function deleteAppDirs(discordPaths) {
    if (process.platform === "linux") {
        // Not implemented for Linux.
        return;
    }

    const progressPerLoop = (DELETE_APP_DIRS_PROGRESS - progress.value) / discordPaths.length;
    for (const discordPath of discordPaths) {
        const appPath = path.join(discordPath, "app");  // Only relevant for Windows and Mac. Not Linux.
        if (await exists(appPath)) {
            log(`Removing app directory from: ${discordPath}.`);
            const error = await new Promise(resolve => rimraf(appPath, originalFs, resolve));
            if (error) {
                log(`❌ Could not delete folder ${appPath}.`);
                log(`❌ ${error.message}`);
                return error;
            }
            log("✅ Deletion successful.");
        }
        progress.set(progress.value + progressPerLoop);
    }
}


const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
async function deleteModuleDirs(channels, discordPaths) {
    const isLinux = process.platform === "linux";

    // On Linux, we must process every Discord xdg-config sub-directory.
    // On other platforms, we must process each "release channel" instead.
    const toProcess = isLinux ? discordPaths : channels;

    const size = toProcess.length;
    const progressPerLoop = (DELETE_MODULE_DIRS_PROGRESS - progress.value) / size;
    for (const nowProcessing of toProcess) {
        // Calculate the platform-specific Discord config path.
        const discordConfigPath = (isLinux)
            ? path.join(nowProcessing, "../../..")  // Jump out to the Discord installation's main xdg-config sub-directory.
            : path.join(remote.app.getPath("userData"), "..", platforms[nowProcessing].replace(" ", "").toLowerCase());

        try {
            // Detect the latest Discord version directory in this path.
            const version = findLatestDiscordVersion(discordConfigPath);
            if (!version) continue;  // Skip path since nothing was found.

            // Cross-platform: Remove the "modules" directory for that version.
            // NOTE: This will cause Discord to redownload the latest version again on next launch.
            const modulesPath = path.join(discordConfigPath, version, "modules");
            if (await exists(modulesPath)) {
                log(`Removing ${modulesPath}.`);
                const error = await new Promise(resolve => rimraf(path.join(modulesPath), originalFs, resolve));
                if (error) {
                    log(`❌ Could not delete modules in ${discordConfigPath}.`);
                    log(`❌ ${error.message}`);
                    return error;
                }
                log("✅ Deletion successful.");
            }
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not delete modules in ${discordConfigPath}.`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}


async function showInstallNotice(config, discordPaths) {
    // Let the user know that they must launch Discord to download the "modules"
    // folders that we deleted, otherwise we won't be able to inject since the
    // files won't exist. If the user proceeds without reading, they'll get an error.
    while (true) {
        const confirmation = await remote.dialog.showMessageBox(remote.BrowserWindow.getFocusedWindow(), {
            type: "question",
            title: "Reinstall BetterDiscord?",
            message: "After repairing, you need to reinstall BetterDiscord.\n\nBut first, you must manually launch all of your repaired Discord versions, so that they will download their modules again.\n\nWhen you are ready, return to this dialog and proceed with the BetterDiscord installation.\n\nAre you ready to install BetterDiscord now?",
            noLink: true,
            cancelId: 1,
            buttons: ["Yes", "No"]
        });

        if (confirmation.response !== 0) return succeed();  // User says no.

        // User wants to reinstall BetterDiscord. Verify that all config-target paths
        // exist again (to make sure that they have launched each repaired Discord version).
        let installReady = true;
        for (const discordPath of discordPaths) {
            if (!(await exists(discordPath))) {
                installReady = false;
                await remote.dialog.showMessageBox({
                    type: "error",
                    title: "Please Launch Discord First",
                    message: "BetterDiscord can't be reinstalled yet.\n\nPlease make sure to manually launch all of your repaired Discord versions, so that they will download their modules again."
                });
                break;
            }
        }

        if (installReady) break;
    }

    // User wants to reinstall BetterDiscord, and all config-target paths exist.
    // NOTE: Since the user had to launch each repaired Discord version (above),
    // to download their "modules" again, they will most likely still be running
    // while the installer below is triggered. The installer will then restart
    // all of their running Discord instances automatically post-installation.
    // So never tell the user to manually restart their Discord clients below!
    await reset();
    await install(config);
    remote.dialog.showMessageBox(remote.BrowserWindow.getFocusedWindow(), {
        type: "info",
        title: "Repair Complete",
        message: "Your chosen Discord versions have been repaired and are now ready for use."
    });
}


export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();

    // Installation channels (such as "stable", "canary") and their latest version's paths.
    const channels = Object.keys(config);
    const discordPaths = Object.values(config);


    // Ensure that Discord isn't running.
    lognewline("Exiting Discord...");
    const killErr = await kill(channels, (KILL_DISCORD_PROGRESS - progress.value) / channels.length, false);
    if (killErr) {
        showKillNotice();
        return fail();
    }
    log("✅ Discord stopped.");
    progress.set(KILL_DISCORD_PROGRESS);


    // Remove "app" directories. Only relevant for Windows and Mac. Not Linux.
    await new Promise(r => setTimeout(r, 200));
    lognewline("Deleting app directories...");
    const deleteShimErr = await deleteAppDirs(discordPaths);
    if (deleteShimErr) return fail();
    log("✅ App directories deleted.");
    progress.set(DELETE_APP_DIRS_PROGRESS);


    // Remove discord "modules" directories, which will force Discord's latest version to re-download itself.
    await new Promise(r => setTimeout(r, 200));
    lognewline("Deleting discord modules...");
    const deleteModulesErr = await deleteModuleDirs(channels, discordPaths);
    if (deleteModulesErr) return fail();
    log("✅ Modules deleted.");
    progress.set(DELETE_MODULE_DIRS_PROGRESS);


    // Tell the user that they need to reinstall BetterDiscord now.
    showInstallNotice(config, discordPaths);
};