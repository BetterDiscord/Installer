
import path from "path";
import findProcess from "find-process";
import kill from "tree-kill";
import {shell} from "electron";
import {progress, bins} from "../../stores/installation";
import {log} from "./log";

const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export default async function killProcesses(channels, progressPerLoop) {
    bins.set({});
    for (const channel of channels) {
        let processName = platforms[channel];
        if (process.platform === "darwin") processName = platforms[channel]; // Discord Canary and Discord PTB on Mac
        // else if (process.platform === "win32") processName = `${platforms[channel].replace(" ", "")}.exe`; // DiscordCanary and DiscordPTB on Windows/Linux
        else processName = platforms[channel].replace(" ", ""); // DiscordCanary and DiscordPTB on Windows/Linux

        log(`Attempting to stop ${platforms[channel]}`);
        try {
            const results = await findProcess("name", processName, true);
            if (!results || !results.length) {
                log(`✅ ${processName} not running`);
                progress.set(progress.value + progressPerLoop);
                continue;
            }

            const parentPids = results.map(p => p.ppid);
            const discordPid = results.find(p => parentPids.includes(p.pid));
            const bin = process.platform === "darwin" ? path.resolve(discordPid.bin, "..", "..", "..") : discordPid.bin;
            const killErr = await new Promise(r => kill(discordPid.pid, "SIGKILL", r));
            if (killErr) throw killErr;
            bins.update(o => {
                o[channel] = bin;
                return o;
            });
            // if (shouldRestart) setTimeout(() => shell.openPath(bin), 1000);
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not stop ${platforms[channel]}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}