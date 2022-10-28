
import {shell} from "electron";
import {progress, bins} from "../../stores/installation";
import {log} from "./log";

const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export default async function killProcesses(channels, progressPerLoop) {
    for (const channel of channels) {
        log(`Attempting to start ${platforms[channel]}`);
        try {
            setTimeout(() => shell.openPath(bins.value[channel]), 1000);
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not start ${platforms[channel]}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}