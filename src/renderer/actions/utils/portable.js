import path from "path";
import {promises as fs} from "fs";

import {log} from "./log";
import exists from "./exists";

export default async function doPortableCheck(config) {
    const paths = Object.values(config);

    // Only Window Version exist for Portable
    if (!process.platform === "win32") return false;

    if (paths && paths.length) {
        const appBackup = path.join(paths[0], "app_org");
        const isBackupExist = await exists(appBackup);

        /**
         * If the folder have App backup mean it is Portable version
         * else check Package.json , discord have default package nname
         */
        if (!isBackupExist) {
            const app = path.join(paths[0], "app");
            const appPackage = path.join(app, "package.json");

            const isPackageExist = await exists(appPackage);

            /**
             * Normal Discord dont have Package.json unless BDD installed
             * Portable Discord may have Package.json based on BDD instal or not
             */
            if (!isPackageExist) return false;

            const appPackageData = await fs.readFile(appPackage);

            try {
                const packageData = JSON.parse(appPackageData);
                const packageName = packageData ? packageData.name : "";
                if (packageName !== "discord") return false;
            }
            catch (error) {
                return false;
            }
        }

        log(`Found Discord Portable Version`);
        return true;
    }

    return false;
}