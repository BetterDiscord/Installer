import {writable} from "svelte/store";
import readwritable from "./types/readwritable";

export const status = writable("");
export const hasAgreed = writable(false);
export const platforms = writable({stable: false, canary: false, ptb: false});
export const paths = writable({stable: "", canary: "", ptb: ""});
export const os = writable("windows");

export const progress = readwritable(0);
export const action = readwritable("install");
