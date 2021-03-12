import {writable} from "svelte/store";
import {locations} from "../actions/paths";

export const hasAgreed = writable(false);
export const action = writable("install");
export const platforms = writable({stable: false, canary: false, ptb: false});
export const paths = writable({stable: locations.stable, canary: locations.canary, ptb: locations.ptb});
export const progress = writable(0);