import App from "./App.svelte";
import getStatic from "./getstatic";

const appElement = document.getElementById("app");
const app = new App({
    target: appElement
});

// Setup this in a var because otherwise it won't work in prod
// TODO: wails
appElement.style.setProperty("--background", `url('${getStatic("images/background.png").replace(/\\/g, "\\\\")}')`);

window.refresh = () => window.location.href = `http://${window.location.host}/`;


// Disable user zooming

window.addEventListener("keydown", (e) => {
    if ((e.code === "Minus" || e.code === "Equal") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
});

export default app;