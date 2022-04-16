import {remote} from "electron";

export function showRestartNotice() {
    remote.dialog.showMessageBox({
        type: "info",
        title: "Restart Discord",
        message: "Powercord could not restart Discord. Please restart it manually."
    });
}

export function showKillNotice() {
    remote.dialog.showMessageBox({
        type: "error",
        title: "Shutdown Discord",
        message: "Powercord could not shut down Discord. Please make sure Discord is fully closed, then run the installer again."
    });
}