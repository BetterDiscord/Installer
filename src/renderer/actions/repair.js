import {progress} from "../stores/installation";
import {remote} from "electron";
const fs = require("fs");
import originalFs from "original-fs";
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
const DELETE_SHIM_PROGRESS = 60;
const DELETE_PLUGINS_JSON_PROGRESS = 100;


async function deleteShims(paths) {
    const progressPerLoop = (DELETE_SHIM_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        const indexFile = path.join(discordPath, "index.js");
        try {
            if (await exists(indexFile)) {
                log(`Removing shim: ${indexFile}.`);
                await fs.writeFile(indexFile, `module.exports = require("./core.asar");`);
                log("✅ Deletion successful.");
            }
        }
        catch (err) {
            log(`❌ Could not remove shim ${indexFile}.`);
            log(`❌ ${err.message}`);
        }
        progress.set(progress.value + progressPerLoop);
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

        if (confirmation.response !== 0) return succeed(); // User says no.

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
    const paths = Object.values(config);


    // Ensure that Discord isn't running.
    lognewline("Exiting Discord...");
    const killErr = await kill(channels, (KILL_DISCORD_PROGRESS - progress.value) / channels.length, false);
    if (killErr) {
        showKillNotice();
        return fail();
    }
    log("✅ Discord stopped.");
    progress.set(KILL_DISCORD_PROGRESS);


    // Remove shims.
    await new Promise(r => setTimeout(r, 200));
    lognewline("Deleting shims...");
    const deleteShimErr = await deleteShims(paths);
    if (deleteShimErr) return fail();
    log("✅ Shims deleted.");
    progress.set(DELETE_SHIM_PROGRESS);


    await new Promise(r => setTimeout(r, 200));
    lognewline("Disabling all plugins...");
    const deleteJsonErr = await disableAllPlugins(channels);
    if (deleteJsonErr) return fail();
    log("✅ Plugins disabled");
    progress.set(DELETE_PLUGINS_JSON_PROGRESS);


    // Tell the user that they need to reinstall BetterDiscord now.
    showInstallNotice(config, paths);
};