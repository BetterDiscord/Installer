import {log} from "./log";
import {action, status} from "../../stores/installation";

// Garlic-Team discord because unofficial installer :(
const discordURL = "https://discord.gg/AjKJSBbGm2";

export default function fail(message) {
    log("");

    if (message) log(`⚠️ ${message}`);

    log(`The ${action.value} seems to have failed. If this problem is recurring, join our discord community for support. ${discordURL}`);
    status.set("error");
}