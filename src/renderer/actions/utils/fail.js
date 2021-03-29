import {log} from "./log";
import {action, status} from "../../stores/installation";

const discordURL = "https://discord.gg/0Tmfo5ZbORCRqbAd";

export default function fail() {
    log("");
    log(`The ${action.value} seems to have failed. If this problem is recurring, join our discord community for support. ${discordURL}`);
    status.set("error");
}