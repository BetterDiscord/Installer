import {writable} from "svelte/store";
import {locations} from "../actions/paths";
import readwritable from "./types/readwritable";

export const status = writable("");
export const hasAgreed = writable(false);
export const platforms = writable({stable: false, canary: false, development: false, ptb: false});
export const paths = writable({stable: locations.stable, canary: locations.canary, development: locations.development, ptb: locations.ptb});

export const progress = readwritable(0);
export const action = readwritable("install");
