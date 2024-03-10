import {promises as fs} from "fs";
import path from "path";

import {progress} from "../stores/installation";

import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import exists from "./utils/exists";
import reset from "./utils/reset";
import kill from "./utils/kill";
import {showRestartNotice} from "./utils/notices";
import doSanityCheck from "./utils/sanity";


const DELETE_SHIM_PROGRESS = 85;
const RESTART_DISCORD_PROGRESS = 100;


async function deleteShims(paths) {
    const progressPerLoop = (DELETE_SHIM_PROGRESS - progress.value) / paths.length;
    for (const discordPath of paths) {
        const indexFile = path.join(discordPath, "index.js");
        log(`Removing injection scripts from: ${discordPath}.`);
        try {
            if (await exists(indexFile)) await fs.writeFile(indexFile, `module.exports = require("./core.asar");`);
            log("✅ Uninstalled successfully.");
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not uninstall BetterDiscord from ${discordPath}.`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}


export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();


    // Installation channels (such as "stable", "canary") and their latest version's paths.
    const channels = Object.keys(config);
    const paths = Object.values(config);


    // Remove BetterDiscord from each Discord version's loader-script.
    lognewline("Deleting BetterDiscord's loader scripts...");
    const deleteErr = await deleteShims(paths);
    if (deleteErr) return fail();
    log("✅ Loader scripts deleted.");
    progress.set(DELETE_SHIM_PROGRESS);


    // Automatically restart Discord clients if they are running.
    lognewline("Restarting Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice(); // No need to bail out if we failed, just tell user to restart manually.
    else log("✅ Discord restarted.");
    progress.set(RESTART_DISCORD_PROGRESS);


    succeed();
};