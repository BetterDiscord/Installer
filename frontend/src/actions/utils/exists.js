// import {promises as fs} from "fs";

// TODO: wails
export default async function exists(file) {
    try {
        // await fs.stat(file);
        return true;
    }
    catch {
        return false;
    }
}