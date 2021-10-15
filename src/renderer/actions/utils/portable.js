import path from "path";

import {log} from "./log";
import exists from "./exists";

export default async function doPortableCheck(config) {
    const paths = Object.values(config);

    // Only Window Version exist for Portable
    if (!process.platform === "win32") return false;

    if (paths && paths.length) {
        const app = path.join(paths[0], "app");
        const appBackup = path.join(paths[0], "app_org");

        const isAppExist = await exists(app);
        const isBackupExist = await exists(appBackup);

        if (!isAppExist && !isBackupExist) return false;

        log(`Found Discord Portable Version`);
        return true;
    }

    log("❌ Something went wrong internally.");
    return false;
}