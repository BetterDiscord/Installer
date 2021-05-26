import {writable} from "svelte/store";
import {locations} from "../actions/paths";
import readwritable from "./types/readwritable";

export const status = writable("");
export const hasAgreed = writable(false);

const defaultPlatforms = {stable: false, canary: false, ptb: false};
if (locations.stable) {
    defaultPlatforms.stable = true;
}
else if (locations.ptb) {
    defaultPlatforms.ptb = true;
}
else if (locations.canary) {
    defaultPlatforms.canary = true;
}
export const platforms = writable(defaultPlatforms);
export const paths = writable({stable: locations.stable, canary: locations.canary, ptb: locations.ptb});

export const progress = readwritable(0);
export const action = readwritable("install"); 
