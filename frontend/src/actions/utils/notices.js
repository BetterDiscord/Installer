import {ShowNotice as showNotice} from "@backend/Dialogs";


export function showRestartNotice() {
    showNotice("info", "Restart Discord", "BetterDiscord could not restart Discord. Please restart it manually.");
}

export function showKillNotice() {
    showNotice("error", "Shutdown Discord", "BetterDiscord could not shut down Discord. Please make sure Discord is fully closed, then run the installer again.");
}