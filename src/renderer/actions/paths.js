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

/* Checks which paths exist. */
const getFoundPaths = function(searchPaths) {
    const foundPaths = [];
    for (const discordPath of searchPaths) {
        if (fs.existsSync(discordPath)) {
            foundPaths.push(discordPath);
        }
    }

    return foundPaths;
};

/* Looks for the latest Discord version in a Discord-config path. */
export const findLatestDiscordVersion = function(discordConfigPath) {
    return fs.readdirSync(discordConfigPath).filter(f => safeIsDir(path.join(discordConfigPath, f)) && f.split(".").length > 1).sort().reverse()[0];
};

/* Gets all existing Discord config paths on Windows. */
const getWindowsDiscordPaths = function(channelName) {
    const searchPaths = [
        // Normal install path in "AppData\Local".
        path.join(process.env.LOCALAPPDATA, channelName.replace(/ /g, "")),

        // Atypical location in "ProgramData\%username%".
        path.join(process.env.PROGRAMDATA, process.env.USERNAME, channelName.replace(/ /g, "")),
    ];

    return getFoundPaths(searchPaths);
};

/* Gets all existing Discord config paths on Linux and Mac. */
const getLinuxMacDiscordPaths = function(channelName) {
    const userHome = remote.app.getPath("home"); // $HOME
    const xdgConfigPath = remote.app.getPath("appData"); // $XDG_CONFIG_HOME
    const discordConfigDirName = channelName.toLowerCase().replace(" ", "");

    const searchPaths = [
        // Flatpak. These user data paths are universal for all Flatpak installations on all machines.
        // Example: `.var/app/com.discordapp.DiscordCanary/config/discordcanary`.
        path.join(userHome, ".var", "app", "com.discordapp." + channelName.replace(" ", ""), "config", discordConfigDirName),

        // Snap. Just like with Flatpaks, these paths are universal for all Snap installations.
        // Example: `snap/discord/current/.config/discord`.
        // Example: `snap/discord-canary/current/.config/discordcanary`.
        // NOTE: Snap user data always exists, even when the Snap isn't mounted/running.
        path.join(userHome, "snap", channelName.toLowerCase().replace(" ", "-"), "current", ".config", discordConfigDirName),

        // Native. Data is stored under `~/.config`.
        // Example: `~/.config/discordcanary`.
        path.join(xdgConfigPath, discordConfigDirName),
    ];

    return getFoundPaths(searchPaths);
};

/* Cross-platform Discord configuration path resolver. */
const getDiscordPath = function(releaseChannel) {
    try {
        let desktopCorePath = "";
        if (process.platform === "win32") {
            const foundPaths = getWindowsDiscordPaths(releaseChannel);
            if (foundPaths.length === 0) return "";
            const basedir = foundPaths[0]; // TODO: In the future, support installing into all found paths?
            const version = findLatestDiscordVersion(basedir);
            if (!version) return "";

            // To account for discord_desktop_core-1 or discord_dekstop_core-2
            const modulePath = path.join(basedir, version, "modules");
            if (!fs.existsSync(modulePath)) return "";
            const coreWrap = fs.readdirSync(modulePath).filter(e => e.indexOf("discord_desktop_core") === 0).sort().reverse()[0];
            if (!coreWrap) return "";
            desktopCorePath = path.join(modulePath, coreWrap, "discord_desktop_core");
        }
        else {
            const foundPaths = getLinuxMacDiscordPaths(releaseChannel);
            if (foundPaths.length === 0) return "";
            const basedir = foundPaths[0];
            if (!fs.existsSync(basedir)) return "";
            const version = findLatestDiscordVersion(basedir);
            if (!version) return "";
            desktopCorePath = path.join(basedir, version, "modules", "discord_desktop_core");
        }

        if (fs.existsSync(desktopCorePath)) return desktopCorePath;
        return "";
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return "";
    }
};

for (const channel in platforms) {
    locations[channel] = getDiscordPath(platforms[channel]);
}

/* Helps the user quickly browse to specific version subfolders of their Discord installation. */
export const getBrowsePath = function(channel) {
    const channelName = platforms[channel];
    if (process.platform === "win32") { // Windows.
        const foundPaths = getWindowsDiscordPaths(channelName);
        if (foundPaths.length >= 1) return foundPaths[0];
    }
    else if (process.platform === "darwin") { // Mac.
        const basedir = path.join("/Applications", `${channelName}.app`);
        if (fs.existsSync(basedir)) return basedir;
    }
    else { // Linux.
        const foundPaths = getLinuxMacDiscordPaths(channelName);
        if (foundPaths.length >= 1) return foundPaths[0];
    }
    return ""; // Nothing found for this channel.
};

/* Validates that the user's custom "Browse" path is a Discord config directory. */
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
        const version = findLatestDiscordVersion(proposedPath);
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
    // Regardless of whether it's a Flatpak, Snap or Native, we want to search
    // for their "inner xdg-config/discord[channel]" folder which are all name
    // the same regardless of installation method, so we treat the channel name
    // detection identically for all proposed paths.
    const channelName = platforms[channel].toLowerCase().replace(" ", "");

    // Attempt to detect which folder the user has selected.
    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === channelName) { // "discord", "discordcanary", etc.
        const version = findLatestDiscordVersion(proposedPath);
        if (!version) return "";
        resourcePath = path.join(proposedPath, version, "modules", "discord_desktop_core");
    }
    else if (selected.split(".").length > 1) {resourcePath = path.join(proposedPath, "modules", "discord_desktop_core");}
    else if (selected === "modules") {resourcePath = path.join(proposedPath, "discord_desktop_core");}
    else if (selected === "discord_desktop_core") {resourcePath = proposedPath;}
    if (resourcePath === "") return "";

    // Verify that we can find Discord's own core.asar, to ensure it's a valid path.
    const asarPath = path.join(resourcePath, "core.asar");
    if (fs.existsSync(asarPath)) return resourcePath;
    return "";
};
