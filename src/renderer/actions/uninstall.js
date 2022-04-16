import originalFs from "original-fs";
import rimraf from "rimraf";
import {execSync} from "child_process";
import {remote} from "electron";
import path from "path";

import {progress} from "../stores/installation";

import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import reset from "./utils/reset";
import kill from "./utils/kill";
import {showRestartNotice} from "./utils/notices";
import doSanityCheck from "./utils/sanity";

const powercordFolder = path.join(remote.app.getPath("appData"), "Powercord");

const UNINJECT_PROGRESS = 40;
const DELETE_FOLDER_PROGRESS = 70;
const RESTART_DISCORD_PROGRESS = 100;

export async function uninjectClient() {
    let command = "{sudo}npm run unplug";
    if (process.platform === "linux") {
        command = command.replace("{sudo}", "sudo ");
    }
 else {command = command.replace("{sudo}", "");}

    const success = await execSync(command, {cwd: powercordFolder, stdio: "inherit"});

    if (!success) return success;
}

export async function deleteFolder() {
    const error = await new Promise(r => rimraf(powercordFolder, originalFs, r));

    if (error) return error;
}

export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();

    const channels = Object.keys(config);

    lognewline("Uninjecting client...");
    const uninjectClientErrors = await uninjectClient();
    if (uninjectClientErrors) return fail();
    log("✅ Injection successful");
    progress.set(UNINJECT_PROGRESS);

    lognewline("Deleting powercord folder...");
    const deleteErr = await deleteFolder();
    if (deleteErr) return fail();
    log("✅ Folder deleted");
    progress.set(DELETE_FOLDER_PROGRESS);

    lognewline("Killing Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice(); // No need to bail out
    else log("✅ Discord restarted");
    progress.set(RESTART_DISCORD_PROGRESS);

    succeed();
};