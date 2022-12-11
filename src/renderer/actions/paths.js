const fs = require("fs");
const path = require("path");
import {remote} from "electron";

export const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export const locations = {stable: "", ptb: "", canary: ""};

const safeIsDir = (fullpath) => {
    try {
        return fs.lstatSync(fullpath).isDirectory();
    }
    catch {
        return false;
    }
};

const getDiscordPath = function(releaseChannel) {
    let desktopCorePath = "";
    if (process.platform === "win32") {
        let basedir = path.join(process.env.LOCALAPPDATA, releaseChannel.replace(/ /g, "")); // Normal install path in AppData\Local
        if (!fs.existsSync(basedir)) basedir = path.join(process.env.PROGRAMDATA, process.env.USERNAME, releaseChannel.replace(/ /g, "")); // Atypical location in ProgramData\%username%
        if (!fs.existsSync(basedir)) return "";
        const version = fs.readdirSync(basedir).filter(f => safeIsDir(path.join(basedir, f)) && f.split(".").length > 1).sort().reverse()[0];
        if (!version) return "";
        // To account for discord_desktop_core-1 or discord_dekstop_core-2
        const coreWrap = fs.readdirSync(path.join(basedir, version, "modules")).filter(e => e.indexOf("discord_desktop_core") === 0).sort().reverse()[0];
        desktopCorePath = path.join(basedir, version, "modules", coreWrap, "discord_desktop_core");
    }
    else {
        const basedir = path.join(remote.app.getPath("userData"), "..", releaseChannel.toLowerCase().replace(" ", ""));
        if (!fs.existsSync(basedir)) return "";
        const version = fs.readdirSync(basedir).filter(f => safeIsDir(path.join(basedir, f)) && f.split(".").length > 1).sort().reverse()[0];
        if (!version) return "";
        desktopCorePath = path.join(basedir, version, "modules", "discord_desktop_core");
    }

    if (fs.existsSync(desktopCorePath)) return desktopCorePath;
    return "";
};

for (const channel in platforms) {
    locations[channel] = getDiscordPath(platforms[channel]);
}

export const getBrowsePath = function(channel) {
    if (process.platform === "win32") return path.join(process.env.LOCALAPPDATA, platforms[channel].replace(" ", ""));
    return path.join(remote.app.getPath("userData"), "..", platforms[channel].toLowerCase().replace(" ", ""));
};

export const validatePath = function(channel, proposedPath) {
    if (process.platform === "win32") return validateWindows(channel, proposedPath);
    return validateLinuxMac(channel, proposedPath);
};

const validateWindows = function(channel, proposedPath) {
    const channelName = platforms[channel].replace(" ", "");

    const isParentDir = fs.existsSync(path.join(proposedPath, channelName));
    if (isParentDir) proposedPath = path.join(proposedPath, channelName);

    let corePath = "";
    const selected = path.basename(proposedPath);
    const isBaseDir = selected === channelName;
    if (isBaseDir) {
        const version = fs.readdirSync(proposedPath).filter(f => safeIsDir(path.join(proposedPath, f)) && f.split(".").length > 1).sort().reverse()[0];
        if (!version) return "";
        // To account for discord_desktop_core-1 or discord_dekstop_core-2
        const coreWrap = fs.readdirSync(path.join(proposedPath, version, "modules")).filter(e => e.indexOf("discord_desktop_core") === 0).sort().reverse()[0];
        corePath = path.join(proposedPath, version, "modules", coreWrap, "discord_desktop_core");
    }

    if (selected.split(".").length > 2) {
        // To account for discord_desktop_core-1 or discord_dekstop_core-2
        const coreWrap = fs.readdirSync(path.join(proposedPath), "modules").filter(e => e.indexOf("discord_desktop_core") === 0).sort().reverse()[0];
        corePath = path.join(proposedPath, "modules", coreWrap, "discord_desktop_core");
    }
    if (selected === "discord_desktop_core") corePath = proposedPath;

    const coreAsar = path.join(corePath, `core.asar`);
    if (fs.existsSync(coreAsar)) return corePath;
    return "";
};

const validateLinuxMac = function(channel, proposedPath) {
    if (proposedPath.includes("/snap/")) {
        remote.dialog.showErrorBox("BetterDiscord Incompatible", "BetterDiscord is currently incompatible with Snap installs of Discord. Support for snap installs is coming soon!");
        return "";
    }
    const channelName = platforms[channel].toLowerCase().replace(" ", "");

    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === channelName) {
        const version = fs.readdirSync(proposedPath).filter(f => safeIsDir(path.join(proposedPath, f)) && f.split(".").length > 1).sort().reverse()[0];
        if (!version) return "";
        resourcePath = path.join(proposedPath, version, "modules", "discord_desktop_core");
    }
    if (selected.split(".").length > 2) resourcePath = path.join(proposedPath, "modules", "discord_desktop_core");
    if (selected === "modules") resourcePath = path.join(proposedPath, "discord_desktop_core");
    if (selected === "discord_desktop_core") resourcePath = proposedPath;

    const asarPath = path.join(resourcePath, "core.asar");
    if (fs.existsSync(asarPath)) return resourcePath;
    return "";
};
