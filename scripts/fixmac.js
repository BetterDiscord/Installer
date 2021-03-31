// Exists due to https://github.com/electron-userland/electron-builder/issues/4299
// Tempfix adapted from: https://gist.github.com/harshitsilly/a1bd5a405f93966aad20358ae6c4cec5

const path = require("path");
const {execSync} = require("child_process");
const fs = require("fs");
const yaml = require("js-yaml");
const {appBuilderPath} = require("app-builder-bin");
const currentWorkingDirectory = process.cwd();
const packageInfo = require(path.join(currentWorkingDirectory, "package.json"));

const APP_NAME = packageInfo.build.productName;
const APP_VERSION = process.argv[2] ? process.argv[2] : packageInfo.version;
const APP_DIST_PATH = path.join(currentWorkingDirectory, "dist");


/* eslint-disable no-console */
module.exports = function(buildResult) {
    if (!buildResult.artifactPaths.some(p => p.toLowerCase().endsWith("mac.zip"))) return console.log("No Mac build detected");
    console.log("Zipping Started");

    execSync(
        `ditto -c -k --sequesterRsrc --keepParent --zlibCompressionLevel 9 "${APP_DIST_PATH}/mac/${APP_NAME}.app" "${APP_DIST_PATH}/${APP_NAME}-${APP_VERSION}-mac.zip"`
    );

    console.log("Zipping Completed");

    const APP_GENERATED_BINARY_PATH = path.join(APP_DIST_PATH, `${APP_NAME}-${APP_VERSION}-mac.zip`);
    try {
        const output = execSync(
            `${appBuilderPath} blockmap --input="${APP_GENERATED_BINARY_PATH}" --output="${APP_DIST_PATH}/${APP_NAME}-${APP_VERSION}-mac.zip.blockmap" --compression=gzip`
        );
        const {sha512, size} = JSON.parse(output);

        const ymlPath = path.join(APP_DIST_PATH, "latest-mac.yml");
        const ymlData = yaml.safeLoad(fs.readFileSync(ymlPath, "utf8"));
        // console.log(ymlData);
        ymlData.sha512 = sha512;
        ymlData.files[0].sha512 = sha512;
        ymlData.files[0].size = size;
        const yamlStr = yaml.safeDump(ymlData);
        // console.log(yamlStr);
        fs.writeFileSync(ymlPath, yamlStr, "utf8");
        console.log("Successfully updated YAML file and configurations with blockmap.");
    }
    catch (e) {
        console.log("Error in updating YAML file and configurations with blockmap.", e);
    }
};