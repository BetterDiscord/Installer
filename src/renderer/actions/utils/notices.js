import {remote} from "electron";
import {format} from "svelte-i18n";
import {get} from 'svelte/store';

export function showRestartNotice() {
    remote.dialog.showMessageBox({
        type: "info",
        title: "Restart Discord",
        message: "BetterDiscord could not restart Discord. Please restart it manually."
    });
}

export function showKillNotice() {
    const _ = get(format);
    remote.dialog.showMessageBox({
        type: "error",
        title: _("action.repair.notice.restart.title"),
        message: _("action.repair.notice.restart.message")
    });
}