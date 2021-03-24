import {writable} from "svelte/store";

export let radioSelectedIndex = writable(0);
export const toggleCheck = (checkbox) => {
    if ((event.key === 'Enter' || event.key === ' ') && checkbox.disabled != true) {
        console.log(checkbox.disabled);
        if (checkbox.checked == true) {
            checkbox.checked = false;
        } else {
            checkbox.checked = true;
        }
        const changeEvent = new Event('change');
        checkbox.dispatchEvent(changeEvent);
    }
}