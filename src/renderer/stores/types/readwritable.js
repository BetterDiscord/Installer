import {writable} from "svelte/store";

export default function readWritable(initial) {
    const {subscribe, set, update} = writable(initial);

    let cached = initial;
    return {
        subscribe,
        update: fn => {
            update(v => {
                const retVal = fn(v);
                cached = retVal;
                return retVal;
            });
        },
        set: val => {
            cached = val;
            set(val);
        },
        get value() {return cached;}
    };
}