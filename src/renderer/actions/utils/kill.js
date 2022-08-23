const { spawn } = require("child_process");
import path from "path";
import findProcess from "find-process";
import kill from "tree-kill";
import {remote, shell} from "electron";
import {progress} from "../../stores/installation";
import {log} from "./log";


const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export default async function killProcesses(channels, progressPerLoop, shouldRestart = true) {
    for (const channel of channels) {
        let processName = platforms[channel];
        if (process.platform === "darwin") processName = platforms[channel]; // Discord Canary and Discord PTB on Mac
        else processName = platforms[channel].replace(" ", ""); // DiscordCanary and DiscordPTB on Windows/Linux

        log(`Attempting to close ${processName}.`);
        try {
            const results = await findProcess("name", processName, true);
            if (!results || !results.length) {
                log(`✅ ${processName} is not running.`);
                progress.set(progress.value + progressPerLoop);
                continue;
            }

            const parentPids = results.map(p => p.ppid);
            const discordPid = results.find(p => parentPids.includes(p.pid));
            const bin = process.platform === "darwin" ? path.resolve(discordPid.bin, "..", "..", "..") : discordPid.bin;
            await new Promise(r => kill(discordPid.pid, r));
            if (shouldRestart) {
                const relaunchAfter = 1500;  // 1.5 seconds. Don't reduce this!
                if (process.platform === "linux") {
                    // On Linux, it's impossible to detect any signs of Flatpak or Snap
                    // runtimes from their process parents, but we can still detect them
                    // via their very unique binary prefixes. All Flatpaks use "/app"
                    // as their prefix, as can be seen in the Flatpak source:
                    // https://github.com/flatpak/flatpak/blob/main/common/flatpak-dir.c
                    // And Snaps use "/snap". Both Flatpaks and Snaps use those unique
                    // paths regardless of whether they also exist on the host or not.
                    //
                    // Example "bin" paths for Discord in Flatpak:
                    // - "/app/discord/Discord"
                    // - "/app/discord-canary/DiscordCanary"
                    //
                    // Examples for Snap:
                    // - "/snap/discord/138/usr/share/discord/Discord"
                    // - "/snap/discord-canary/358/usr/share/discord-canary/DiscordCanary"
                    //
                    // Examples for native Discord:
                    // - "/usr/lib64/discord/Discord"
                    // - "/usr/bin/Discord"
                    //
                    // The best way to relaunch applications on Linux would be
                    // to trigger their associated ".desktop" file. Unfortunately,
                    // each Linux desktop environment handles those differently.
                    // So we'll have to settle for directly launching native binaries,
                    // and in case of Flatpaks we'll generate a "flatpak run" cmd,
                    // and for Snaps we'll handle those via "snap run" instead.
                    //
                    // NOTE: "spawn()" is async and detaches the process, which
                    // ensures it continues running even after BD-Installer quits.
                    const userHome = remote.app.getPath("home");  // $HOME
                    const flatpakName = bin.match(/^\/app\/.*?\/(Discord[^\/]*)$/);
                    const snapName = bin.match(/^\/snap\/(discord[^\/]*)\/.*?\/Discord[^\/]*$/);
                    if (flatpakName) {  // Flatpak.
                        // NOTE: Flatpak doesn't really need the cwd, but we set it anyway.
                        setTimeout(() => spawn("flatpak", [ "run", `com.discordapp.${flatpakName[1]}` ], { cwd: userHome }), relaunchAfter);
                    }
                    else if (snapName) {  // Snap.
                        // NOTE: Setting the working directory helps with reliably launching,
                        // otherwise the Snap version can sometimes complain about missing files.
                        // NOTE: The Snap version needs a longer restart delay, due to Snap's slow
                        // machinery after a Snap application is closed, before it can start again.
                        setTimeout(() => spawn("snap", [ "run", snapName[1] ], { cwd: userHome }), relaunchAfter + 2500);
                    }
                    else { // Native application.
                        // NOTE: We set the working directory since it matters for native.
                        setTimeout(() => spawn(bin, [ ], { cwd: path.join(bin, "..") }), relaunchAfter);
                    }
                }
                else {  // Windows and Mac.
                    // Simply trigger the executable via its default system handler.
                    setTimeout(() => shell.openPath(bin), relaunchAfter);
                }
            }
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            const symbol = shouldRestart ? "⚠️" : "❌";
            log(`${symbol} Could not close ${platforms[channel]}.`);
            log(`${symbol} ${err.message}`);
            return err;
        }
    }
}