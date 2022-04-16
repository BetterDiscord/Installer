import LoadingPage from "./pages/Loading.svelte";
import LicensePage from "./pages/License.svelte";
import ActionsPage from "./pages/Actions.svelte";
import PlatformsPage from "./pages/Platforms.svelte";
import PerformActionPage from "./pages/PerformAction.svelte";

export default {
    "/": LicensePage,
    "/actions": ActionsPage,
    "/setup/:action": PlatformsPage,
    "/install": PerformActionPage,
    "/repair": PerformActionPage,
    "/uninstall": PerformActionPage,
    "/inject": PerformActionPage,
    "/uninject": PerformActionPage,
    "*": LoadingPage,
};