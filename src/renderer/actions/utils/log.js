import logs from "../../stores/logs";

export function log(entry) {
    logs.update(a => {
        a.push(entry);
        return a;
    });
}

export function lognewline(entry) {
    logs.update(a => {
        a.push("");
        a.push(entry);
        return a;
    });
}