
import {progress} from "../stores/installation";

import {log, lognewline} from "./utils/log";
import succeed from "./utils/succeed";
import fail from "./utils/fail";
import kill from "./utils/kill";
import reset from "./utils/reset";
import doSanityCheck from "./utils/sanity";
import { uninjectClient } from "./uninstall";

const INJECT_PROGRESS = 80;
const RESTART_DISCORD_PROGRESS = 100;

export default async function(config) {
    await reset();
    const sane = doSanityCheck(config);
    if (!sane) return fail();

    const channels = Object.keys(config);

    await new Promise(r => setTimeout(r, 200));

    lognewline("Uninjecting client...");
    const injectClientErrors = await uninjectClient(channels);
    if (injectClientErrors) return fail();
    log("✅ Uninjection successful");
    progress.set(INJECT_PROGRESS);

    lognewline("Killing Discord...");
    const killErr = await kill(channels, (RESTART_DISCORD_PROGRESS - progress.value) / channels.length);
    if (killErr) showRestartNotice(); // No need to bail out
    else log("✅ Discord restarted");
    progress.set(RESTART_DISCORD_PROGRESS);

    succeed();
};