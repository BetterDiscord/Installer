import {writable} from "svelte/store";
import {locations} from "../actions/paths";
import readwritable from "./types/readwritable";

export const status = writable("");
export const hasAgreed = writable(false);
export const platforms = writable({canary: false});
export const paths = writable({canary: locations.canary});

export const progress = readwritable(0);
export const action = readwritable("install"); 
