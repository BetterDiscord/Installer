import {writable} from "svelte/store";

export const canGoBack = writable(false);
export const canGoForward = writable(false);
export const nextPage = writable("/");