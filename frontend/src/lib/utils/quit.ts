import {Application} from "@wailsio/runtime";
import {ConfirmAction as showMessageBox} from "@backend/dialogservice";
import {ConfirmationResult} from "@backend/models";


export default async function () {
    const confirmation = await showMessageBox("Are you sure?", "Are you sure you want to quit the installation?");
    if (confirmation === ConfirmationResult.ConfirmationYes) {
        // eslint-disable-next-line new-cap
        await Application.Quit();
    }
}