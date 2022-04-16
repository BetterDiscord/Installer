import {progress} from "../stores/installation";
import {remote} from "electron";
import {promises as fs} from "fs";
import path from "path";
import cloneRepo from "git-clone/promise";
import {execSync} from "child_process";
import originalFs from "original-fs";
import rimraf from "rimraf";

import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import exists from "./utils/exists";
import reset from "./utils/reset";
import kill from "./utils/kill";
import {showRestartNotice} from "./utils/notices";
import doSanityCheck from "./utils/sanity";

const MAKE_DIR_PROGRESS = 30;
const DOWNLOAD_PACKAGE_PROGRESS = 60;
const DOWNLOAD_INJECTORS_PROGRESS = 70;
const DOWNLOAD_DEPENDENCIES_PROGRESS = 80;
const INJECT_PROGRESS = 90;
const RESTART_DISCORD_PROGRESS = 100;

const powercordFolder = path.join(remote.app.getPath("appData"), "Powercord");

async function checkFor(type) {
    try {
        await execSync(`${type} --version`)
    } catch(err) {
        return err;
    }
}

async function makeDirectories(...folders) {
    const progressPerLoop = (MAKE_DIR_PROGRESS - progress.value) / folders.length;
    for (const folder of folders) {
        if (await exists(folder)) {
            log(`✅ Directory exists: ${folder}`);
            progress.set(progress.value + progressPerLoop);
            continue;
        }
        try {
            await fs.mkdir(folder);
            progress.set(progress.value + progressPerLoop);
            log(`✅ Directory created: ${folder}`);
        }
        catch (err) {
            log(`❌ Failed to create directory: ${folder}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}

async function cloneRepository() {
    try {
        await cloneRepo("git@github.com:powercord-org/powercord.git", powercordFolder);
    } catch(err) {
        return err;
    }
}

export async function downloadDependencies() {
    try {
        await execSync("npm install", {cwd: powercordFolder, stdio: "inherit"});
    } catch(err) {
        return err;
    }
}

async function cloneInjectorsRepository() {
    try {
        await cloneRepo("git@github.com:xHyroM/powercord-injector.git", `${powercordFolder}/powercord-injector`);
        await new Promise(r => rimraf(`${powercordFolder}/powercord-injector/powercord`, originalFs, r));
        await new Promise(r => rimraf(`${powercordFolder}/powercord-injector/.gitmodules`, originalFs, r));
    } catch(err) {
        return err;
    }
}

export async function injectClient(channels) {
    for (const channel of channels) {
        log(`Injecting into: ${channel}`);

        let command = `{sudo}node powercord-injector/new-injectors/index.js inject ${channel} --no-exit-codes`;
        if (process.platform === "linux") {
            command = command.replace("{sudo}", "sudo ");
        } else {
            command = command.replace("{sudo}", "");
        }
    
        try {
            await execSync(command, {cwd: powercordFolder, stdio: "inherit"});
        } catch(err) {
            return err;
        }
    }
}

export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();

    const channels = Object.keys(config);

    lognewline("Checking for git...");
    const checkForGitError = await checkFor("git");
    if (checkForGitError) return fail("Git not found");
    log("✅ Git found");

    lognewline("Checking for node...");
    const checkForNodeError = await checkFor("node");
    if (checkForNodeError) return fail("Node.js not found");
    log("✅ Node.js found");

    lognewline("Creating required directories...");
    const makeDirErr = await makeDirectories(powercordFolder);
    if (makeDirErr) return fail();
    log("✅ Directories created");
    progress.set(MAKE_DIR_PROGRESS);

    lognewline("Cloning powercord repository...");
    const cloneRepositoryError = await cloneRepository();
    if (cloneRepositoryError) return fail(cloneRepositoryError.toString().includes("failed with status 128") ? "Folder Powercord already exists. Use uninstaller first." : null);
    log("✅ Repository powercord cloned");
    progress.set(DOWNLOAD_PACKAGE_PROGRESS);

    lognewline("Cloning injectors repository...");
    const cloneInjectorsRepositoryError = await cloneInjectorsRepository();
    if (cloneInjectorsRepositoryError) return fail(cloneInjectorsRepositoryError.toString().includes("failed with status 128") ? "Folder powercord-injector already exists. Use uninstaller first." : null);
    log("✅ Repository injectors cloned");
    progress.set(DOWNLOAD_INJECTORS_PROGRESS)

    lognewline("Downloading dependencies...");
    const downloadDependenciesError = await downloadDependencies();
    if (downloadDependenciesError) return fail();
    log("✅ Dependencies downloaded");
    progress.set(DOWNLOAD_DEPENDENCIES_PROGRESS);

    lognewline("Injecting client...");
    const injectClientErrors = await injectClient(channels);
    if (injectClientErrors) return fail();
    log("✅ Injection successful");
    progress.set(INJECT_PROGRESS);

    lognewline("Restarting Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice();
    else log("✅ Discord restarted");
    progress.set(RESTART_DISCORD_PROGRESS);

    succeed();
};