import {writable} from "svelte/store";

export const radioSelectedIndex = writable(0);

let i = 0;

export function checkItem(item) {
    item.checked = !item.checked;
    const changeEvent = new Event("change");
    item.dispatchEvent(changeEvent);
}

export const handleKeyboardToggle = (checkbox) => {
    if ((event.key === "Enter" || event.key === " ") && !checkbox.disabled) {
        checkItem(checkbox);
    }
};

export const handleArrowKeys = (container) => {
    container.focus();
    if (container.hasAttribute("selected-index")) i = container.getAttribute("selected-index");
    if (event.key === "ArrowDown") {
        if (i < (container.children.length - 2)) i++;
        else i = 0;
        checkItem(container.children[i].children[0]);
    }
    if (event.key === "ArrowUp") {
        if (i > 0) i--;
        else i = container.children.length - 2;
        checkItem(container.children[i].children[0]);
    }
};