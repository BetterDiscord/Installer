import {Quit as exit} from "@wails/runtime";
import {ConfirmAction as showMessageBox} from "@backend/Dialogs";


export default async function() {
    const confirmation = await showMessageBox("Are you sure?", "Are you sure you want to quit the installation?");
    if (confirmation === "Yes") {
        exit();
    }
}