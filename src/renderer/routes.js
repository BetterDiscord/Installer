import LoadingPage from "./pages/Loading.svelte";
import ActionsPage from "./pages/Actions.svelte";
import PlatformsPage from "./pages/Platforms.svelte";
import PerformActionPage from "./pages/PerformAction.svelte";

export default {
    "/": ActionsPage,
    "/setup/:action": PlatformsPage,
    "/install": PerformActionPage,
    "/repair": PerformActionPage,
    "/uninstall": PerformActionPage,
    "*": LoadingPage,
};