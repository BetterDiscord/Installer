import {remote} from "electron";

export default async function() {
    const confirmation = await remote.dialog.showMessageBox(remote.BrowserWindow.getFocusedWindow(), {
        type: "question",
        title: "Are you sure?",
        message: "Are you sure you want to quit the installation?",
        noLink: true,
        buttons: ["Quit", "Cancel"]
    });

    if (confirmation.response === 1) {
        remote.app.quit();
    }
}