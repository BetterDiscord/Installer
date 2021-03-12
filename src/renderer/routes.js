import LoadingPage from "./pages/Loading.svelte";
import LicensePage from "./pages/License.svelte";
import ActionsPage from "./pages/Actions.svelte";
import PlatformsPage from "./pages/Platforms.svelte";
import PerformActionPage from "./pages/PerformAction.svelte";
import RepairPage from "./pages/Repair.svelte";
import UninstallPage from "./pages/Uninstall.svelte";
import InstallPage from "./pages/Install.svelte";

export default {
    "/": LicensePage,
    "/actions": ActionsPage,
    "/setup/:action": PlatformsPage,
    "/install": PerformActionPage,
    "/repair": PerformActionPage,
    "/uninstall": PerformActionPage,
    "*": LoadingPage,
};