import logs from "../stores/logs";
import {status, progress} from "../stores/installation";

function log(entry) {
    logs.update(a => {
        a.push(entry);
        return a;
    });
}

export default async function(discordPaths) {
    discordPaths.forEach(v => log(v));
    setTimeout(() => {progress.set(10);}, 200);
    setTimeout(() => {progress.set(25);}, 500);
    setTimeout(() => {progress.set(50);}, 1500);
    setTimeout(() => {status.set("error");}, 2500);
    setTimeout(() => {status.set("");}, 4000);
    setTimeout(() => {progress.set(75);}, 4500);
    setTimeout(() => {progress.set(100);}, 5000);
    setTimeout(() => {status.set("success");}, 5200);
}