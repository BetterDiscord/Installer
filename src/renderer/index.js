import App from "./App.svelte";

const app = new App({
    target: document.getElementById("app")
});

window.refresh = () => window.location.href = `http://${window.location.host}/`;

export default app;
