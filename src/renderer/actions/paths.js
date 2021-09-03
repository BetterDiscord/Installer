const fs = require("fs");
const path = require("path");
import {remote} from "electron";
const semverGreaterThan = require("semver/functions/gt");
const semverValid = require("semver/functions/valid");

export const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export const locations = {stable: "", ptb: "", canary: ""};

const getDiscordPath = function(releaseChannel) {
    let resourcePath = "";
    
    if (process.platform === "win32") {
        const releaseChannelFolder = releaseChannel.replace(" ", "");

        const basedirs = [
            path.join(process.env.PROGRAMDATA, process.env.USERNAME, releaseChannelFolder),
            path.join(process.env.LOCALAPPDATA, releaseChannelFolder)
        ].filter(dir => fs.existsSync(dir));
    
        let detectedVersion = "0.0.0";
        for (const basedir of basedirs) {
            for (const versiondir of fs.readdirSync(basedir)) {
                if (versiondir.startsWith("app-")) {
                    const version = versiondir.replace("app-","");
                    if (semverValid(version) && semverGreaterThan(version, detectedVersion)) {
                        detectedVersion = version;
                        resourcePath = path.join(basedir, versiondir, "resources");
                    }
                }
            }
        }
    }
    else if (process.platform === "darwin") {
        resourcePath = path.join("/Applications", `${releaseChannel}.app`, "Contents", "Resources");
    }
    else {
        const releaseChannelFolder = releaseChannel.replace(" ", "").toLowerCase();
        const basedir = path.join(remote.app.getPath("appData"), releaseChannelFolder);
    
        let detectedVersion = "0.0.0";
        for (const version of fs.readdirSync(basedir)) {
            if (semverValid(version) && semverGreaterThan(version, detectedVersion)) {
                detectedVersion = version;
                resourcePath = path.join(basedir, version, "modules", "discord_desktop_core");
            }
        }
    }

    if (fs.existsSync(resourcePath)) return resourcePath;
    return "";
};

for (const channel in platforms) {
    locations[channel] = getDiscordPath(platforms[channel]);
}

export const getBrowsePath = function(channel) {
    if (process.platform === "win32") return path.join(process.env.LOCALAPPDATA, platforms[channel].replace(" ", ""));
    else if (process.platform === "darwin") return path.join("/Applications", `${platforms[channel]}.app`);
    return path.join(remote.app.getPath("userData"), "..", platforms[channel].toLowerCase().replace(" ", ""));
};

export const validatePath = function(channel, proposedPath) {
    if (process.platform === "win32") return validateWindows(channel, proposedPath);
    else if (process.platform === "darwin") return validateMac(channel, proposedPath);
    return validateLinux(channel, proposedPath);
};

const validateWindows = function(channel, proposedPath) {
    const channelName = platforms[channel].replace(" ", "");

    const isParentDir = fs.existsSync(path.join(proposedPath, channelName));
    if (isParentDir) proposedPath = path.join(proposedPath, channelName);

    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === channelName) {
        const basedir = proposedPath;
        let detectedVersion;
        for (const versiondir of fs.readdirSync(proposedPath)) {
            if (versiondir.startsWith("app-")) {
                const version = versiondir.replace("app-","");
                if (semverValid(version) && semverGreaterThan(version, detectedVersion)) {
                    detectedVersion = version;
                    resourcePath = path.join(basedir, versiondir, "resources");
                }
            }
        }
    }

    if (selected.startsWith("app-") && semverValid(selected.replace("app-", ""))) {
        resourcePath = path.join(proposedPath, "resources");
    }
    if (selected === "resources") resourcePath = proposedPath;

    const executablePath = path.join(resourcePath, "..", `${channelName}.exe`);
    if (fs.existsSync(executablePath)) return resourcePath;
    return "";
};

const validateMac = function(channel, proposedPath) {
    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === `${platforms[channel]}.app`) resourcePath = path.join(proposedPath, "Contents", "Resources");
    if (selected === "Contents") resourcePath = path.join(proposedPath, "Resources");
    if (selected === "Resources") resourcePath = proposedPath;

    const executablePath = path.join(resourcePath, "..", "MacOS", platforms[channel]);
    if (fs.existsSync(executablePath)) return resourcePath;
    return "";
};

const validateLinux = function(channel, proposedPath) {
    if (proposedPath.includes("/snap/")) {
        remote.dialog.showErrorBox("BetterDiscord Incompatible", "BetterDiscord is currently incompatible with Snap installs of Discord. Support for snap installs is coming soon!");
        return "";
    }
    const channelName = platforms[channel].toLowerCase().replace(" ", "");

    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === channelName) {
        const basedir = proposedPath;
        let detectedVersion = "0.0.0";
        for (const version of fs.readdirSync(basedir)) {
            if (semverValid(version) && semverGreaterThan(version, detectedVersion)) {
                detectedVersion = version;
                resourcePath = path.join(basedir, version, "modules", "discord_desktop_core");
            }
        }
    }
    if (semverValid(selected)) resourcePath = path.join(proposedPath, "modules", "discord_desktop_core");
    if (selected === "modules") resourcePath = path.join(proposedPath, "discord_desktop_core");
    if (selected === "discord_desktop_core") resourcePath = proposedPath;

    const asarPath = path.join(resourcePath, "core.asar");
    if (fs.existsSync(asarPath)) return resourcePath;
    return "";
};
