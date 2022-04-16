
import path from "path";
import findProcess from "find-process";
import kill from "tree-kill";
import {shell} from "electron";
import {progress} from "../../stores/installation";
import {log} from "./log";
import { platforms } from "../paths";

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
            const bin = process.platform === "darwin" ? path.resolve(discordPid.bin, "..", "..", "..") : discordPid.bin;
            await new Promise(r => kill(discordPid.pid, r));
            if (shouldRestart) setTimeout(() => shell.openPath(bin), 1000);
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