import {state} from "../stores/navigation";
import {cubicInOut} from "svelte/easing";

export default function page(node, {delay = 0, duration = 250, easing = cubicInOut, x = 550, y = 0, out = false}) {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;

    const direction = out ? -1 : 1;
    x = direction * x;
    x = state.direction * x;

    return {
        delay,
        duration,
        easing,
        css: t => {
            return `transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);`;
        }
    };
}