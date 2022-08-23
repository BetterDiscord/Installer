import {remote} from "electron";

export function showRestartNotice() {
    remote.dialog.showMessageBox({
        type: "info",
        title: "Restart Discord",
        message: "BetterDiscord could not restart Discord.\n\nPlease restart it manually."
    });
}

export function showKillNotice() {
    remote.dialog.showMessageBox({
        type: "error",
        title: "Shutdown Discord",
        message: "BetterDiscord could not shut down Discord.\n\nPlease make sure Discord is fully closed, and then run the installer again."
    });
}