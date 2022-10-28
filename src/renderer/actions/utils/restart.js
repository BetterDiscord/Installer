
import {shell} from "electron";
import {progress, bins} from "../../stores/installation";
import {log} from "./log";

const platforms = {stable: "Discord", ptb: "Discord PTB", canary: "Discord Canary"};
export default async function killProcesses(channels, progressPerLoop) {
    for (const channel of channels) {
        if (!bins.value[channel]) continue; 
        log(`Attempting to start ${platforms[channel]}`);
        try {
            if (bins.value[channel]) {
               setTimeout(() => shell.openPath(bins.value[channel]), 1000);
               log(`✅ ${platforms[channel]} launched`);
            }
            else { // If we didn't kill it, we can't start it
                log(`✅ ${platforms[channel]} was not running`); 
            }
            
            progress.set(progress.value + progressPerLoop);
        }
        catch (err) {
            log(`❌ Could not start ${platforms[channel]}`);
            log(`❌ ${err.message}`);
            return err;
        }
    }
}