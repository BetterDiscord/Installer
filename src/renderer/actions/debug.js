import logs from "../stores/logs";

function log(entry) {
    logs.update(a => {
        a.push(entry);
        return a;
    });
}

export default async function(discordPaths) {
    discordPaths.forEach(v => log(v));
}