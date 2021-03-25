import {writable} from "svelte/store";

export const radioSelectedIndex = writable(0);

function checkItem(item) {
    if (item.checked == true) {
        item.checked = false;
    }
    else {
        item.checked = true;
    }
    const changeEvent = new Event("change");
    item.dispatchEvent(changeEvent);
}

export const handleKeyboardToggle = (checkbox) => {
    if ((event.key === "Enter" || event.key === " ") && checkbox.disabled != true) {
        checkItem(checkbox);
    }
};

let i = 0;

export const handleArrowKeys = (container) => {
    event.preventDefault();
    container.focus();
    if (event.key === "ArrowDown") {
        if (i < (container.children.length - 2)) {
            i++;
        } else {
            i = 0;
        }
        checkItem(container.children[i].children[0]);
    }
    if (event.key === "ArrowUp") {
        if (i > 0) {
            i--;
        } else {
            i = container.children.length - 2;
        }
        checkItem(container.children[i].children[0]);
    }
};