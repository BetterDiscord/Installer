import App from "./App.svelte";

const app = new App({
    target: document.getElementById("app")
});

window.refresh = () => window.location.href = `http://${window.location.host}/`;


// Disable user zooming

window.addEventListener("keydown", (e) => {
    if ((e.code == "Minus" || e.code == "Equal") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
    }
});

export default app;