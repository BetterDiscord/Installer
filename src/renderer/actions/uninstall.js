import {promises as fs} from "fs";
import originalFs from "original-fs";
import rimraf from "rimraf";
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
        log("Removing " + discordPath);
        const appPath = path.join(discordPath, "app");
        const indexFile = path.join(discordPath, "index.js");
        try {
            if (process.platform === "win32" || process.platform === "darwin") {
                if (await exists(appPath)) {
                    const error = await new Promise(r => rimraf(appPath, originalFs, r));
                    if (error) throw error; // Throw instead because there are multiple throw points
                }
            }
            else {
                if (await exists(indexFile)) await fs.writeFile(indexFile, `module.exports = require("./core.asar");`);
            }
            log("✅ Deletion successful");
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not delete folder ${appPath}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}


export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();


    const channels = Object.keys(config);
    const paths = Object.values(config);


    lognewline("Deleting shims...");
    const deleteErr = await deleteShims(paths);
    if (deleteErr) return fail();
    log("✅ Shims deleted");
    progress.set(DELETE_SHIM_PROGRESS);


    lognewline("Killing Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice(); // No need to bail out
    else log("✅ Discord restarted");
    progress.set(RESTART_DISCORD_PROGRESS);

    succeed();
};