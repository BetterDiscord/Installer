import App from "./App.svelte";
import {paths, os} from "./stores/installation";
import {GetPlatform as platform} from "@backend/Backend";
import {GetDiscordPath as getDiscordPath} from "@backend/Paths";

import backgroundUrl from "@assets/images/background.png";

const appElement = document.getElementById("app");
const app = new App({
    target: appElement
});

// Setup this in a var because otherwise it won't work in prod
appElement.style.setProperty("--background", `url('${backgroundUrl}')`);

window.refresh = () => window.location.href = `http://${window.location.host}/`;


// Disable user zooming

window.addEventListener("keydown", (e) => {
    if ((e.code === "Minus" || e.code === "Equal") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
});

platform().then(osName => os.set(osName));

const channels = ["stable", "ptb", "canary"];

for (const channel of channels) {
    getDiscordPath(channel).then(path => {
        paths.update(current => ({...current, [channel]: path}));
    });
}

export default app;