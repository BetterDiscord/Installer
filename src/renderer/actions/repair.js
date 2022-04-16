
import {progress} from "../stores/installation";
import {execSync} from "child_process";
import {remote} from "electron";
import path from "path";

import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import kill from "./utils/kill";
import reset from "./utils/reset";
import doSanityCheck from "./utils/sanity";
import {downloadDependencies, injectClient} from "./install";

const PULL_FROM_GIT = 40;
const DOWNLOAD_DEPENDENCIES_PROGRESS = 60;
const INJECT_PROGRESS = 80;
const RESTART_DISCORD_PROGRESS = 100;

const powercordFolder = path.join(remote.app.getPath("appData"), "Powercord");

export async function gitPull() {
    const success = await execSync("git pull", {cwd: powercordFolder, stdio: "inherit"});

    if (!success) return success;
}

export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();

    const channels = Object.keys(config);

    await new Promise(r => setTimeout(r, 200));
    
    lognewline("Pulling from git...");
    const gitPullErr = await gitPull();
    if (gitPullErr) return fail();
    log("✅ Pull successful");
    progress.set(PULL_FROM_GIT);

    lognewline("Downloading dependencies...");
    const downloadDependenciesError = await downloadDependencies();
    if (downloadDependenciesError) return fail();
    log("✅ Dependencies downloaded");
    progress.set(DOWNLOAD_DEPENDENCIES_PROGRESS);

    lognewline("Injecting client...");
    const injectClientErrors = await injectClient();
    if (injectClientErrors) return fail();
    log("✅ Injection successful");
    progress.set(INJECT_PROGRESS);

    lognewline("Killing Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice(); // No need to bail out
    else log("✅ Discord restarted");
    progress.set(RESTART_DISCORD_PROGRESS);

    succeed();
};