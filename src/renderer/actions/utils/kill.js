import findProcess from "find-process";
import kill from "tree-kill";
import {shell} from "electron";
import {progress} from "../../stores/installation";
import {log} from "./log";

const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export default async function killProcesses(channels, progressPerLoop, shouldRestart = true) {
    for (const channel of channels) {
        let processName = platforms[channel];
        if (process.platform === "darwin") processName = platforms[channel]; // Discord Canary and Discord PTB on Mac
        else processName = platforms[channel].replace(" ", ""); // DiscordCanary and DiscordPTB on Windows/Linux

        log("Attempting to kill " + processName);
        try {
            const results = await findProcess("name", processName, true);
            if (!results || !results.length) {
                log(`✅ ${processName} not running`);
                progress.set(progress.value + progressPerLoop);
                continue;
            }

            const parentPids = results.map(p => p.ppid);
            const discordPid = results.find(p => parentPids.includes(p.pid));
            const bin = discordPid.bin;
            kill(discordPid.pid);
            if (shouldRestart) shell.openExternal(bin);
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            const symbol = shouldRestart ? "⚠️" : "❌";
            log(`${symbol} Could not kill ${platforms[channel]}`);
            log(`${symbol} ${err.message}`);
            return err;
        }
    }
}