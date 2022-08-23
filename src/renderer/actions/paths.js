const fs = require("fs");
const path = require("path");
import {remote} from "electron";

export const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export const locations = {stable: "", ptb: "", canary: ""};


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
    return fs.readdirSync(discordConfigPath).filter(f => fs.lstatSync(path.join(discordConfigPath, f)).isDirectory() && f.split(".").length > 1).sort().reverse()[0];
}


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


/* Gets all existing Discord config paths on Mac. */
const getMacDiscordPaths = function(channelName) {
    const searchPaths = [
        // Mac apps are installed in "/Applications".
        // Example: `/Applications/Discord Canary.app/Contents/Resources`
        path.join("/Applications", `${channelName}.app`, "Contents", "Resources"),
    ];

    return getFoundPaths(searchPaths);
};


/* Gets all existing Discord config paths on Linux. */
const getLinuxDiscordPaths = function(channelName) {
    const userHome = remote.app.getPath("home");  // $HOME
    const xdgConfigPath = remote.app.getPath("appData");  // $XDG_CONFIG_HOME
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
const getDiscordPath = function(channelName) {
    let resourcePath = "";
    if (process.platform === "win32") {  // Windows.
        const foundPaths = getWindowsDiscordPaths(channelName);
        if (foundPaths.length === 0) return "";
        const basedir = foundPaths[0];  // TODO: In the future, support installing into all found paths?
        const version = findLatestDiscordVersion(basedir);
        if (!version) return "";
        resourcePath = path.join(basedir, version, "resources");
    }
    else if (process.platform === "darwin") {  // Mac.
        const foundPaths = getMacDiscordPaths(channelName);
        if (foundPaths.length === 0) return "";
        resourcePath = foundPaths[0];  // Discord on Mac stores the config inside the Application bundle.
    }
    else {  // Linux.
        const foundPaths = getLinuxDiscordPaths(channelName);
        if (foundPaths.length === 0) return "";
        const basedir = foundPaths[0];  // Prioritizes the Flatpak/Snap paths over Native.  TODO: In the future, support installing into all found paths simultaneously; both native and sandboxes?
        const version = findLatestDiscordVersion(basedir);
        if (!version) return "";
        resourcePath = path.join(basedir, version, "modules", "discord_desktop_core");
    }

    if (fs.existsSync(resourcePath)) return resourcePath;
    return "";
};

for (const channel in platforms) {
    locations[channel] = getDiscordPath(platforms[channel]);
}


/* Helps the user quickly browse to specific version subfolders of their Discord installation. */
export const getBrowsePath = function(channel) {
    const channelName = platforms[channel];
    if (process.platform === "win32") {  // Windows.
        const foundPaths = getWindowsDiscordPaths(channelName);
        if (foundPaths.length >= 1) return foundPaths[0];
    }
    else if (process.platform === "darwin") {  // Mac.
        const basedir = path.join("/Applications", `${channelName}.app`);
        if (fs.existsSync(basedir)) return basedir;
    }
    else {  // Linux.
        const foundPaths = getLinuxDiscordPaths(channelName);
        if (foundPaths.length >= 1) return foundPaths[0];
    }
    return "";  // Nothing found for this channel.
};


/* Validates that the user's custom "Browse" path is a Discord config directory. */
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
    const isBaseDir = selected === channelName;
    if (isBaseDir) {
        const version = findLatestDiscordVersion(proposedPath);
        if (!version) return "";
        resourcePath = path.join(proposedPath, version, "resources");
    }

    if (selected.startsWith("app-") && selected.split(".").length > 2) resourcePath = path.join(proposedPath, "resources");
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
    // Regardless of whether it's a Flatpak, Snap or Native, we want to search
    // for their "inner xdg-config/discord[channel]" folder which are all name
    // the same regardless of installation method, so we treat the channel name
    // detection identically for all proposed paths.
    const channelName = platforms[channel].toLowerCase().replace(" ", "");

    // Attempt to detect which folder the user has selected.
    let resourcePath = "";
    const selected = path.basename(proposedPath);
    if (selected === channelName) {  // "discord", "discordcanary", etc.
        const version = findLatestDiscordVersion(proposedPath);
        if (!version) return "";
        resourcePath = path.join(proposedPath, version, "modules", "discord_desktop_core");
    }
    else if (selected.split(".").length > 1) resourcePath = path.join(proposedPath, "modules", "discord_desktop_core");
    else if (selected === "modules") resourcePath = path.join(proposedPath, "discord_desktop_core");
    else if (selected === "discord_desktop_core") resourcePath = proposedPath;
    if (resourcePath === "") return "";

    // Verify that we can find Discord's own core.asar, to ensure it's a valid path.
    const asarPath = path.join(resourcePath, "core.asar");
    if (fs.existsSync(asarPath)) return resourcePath;
    return "";
};
