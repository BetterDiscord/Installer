import logs from "../stores/logs";

function log(entry) {
    logs.update(a => {
        a.push({summary: entry});
        return a;
    });
}

function createEntry(id, summary) {
    logs.update(a => {
        a.push({id, summary, details: []});
        return a;
    });
}

function appendEntry(id, detail) {
    logs.update(a => {
        const entry = a.find(e => e.id === id);
        entry.details.push(detail);
        return a;
    });
}

export default async function(paths) {
    log("Starting to install...");

    createEntry("download", "Pretending to download internet resource");
    await new Promise(r => setTimeout(r, 2000));
    appendEntry("download", "    ✅ Package downloaded");

    createEntry("moving", "Moving package to correct location");
    await new Promise(r => setTimeout(r, 500));
    appendEntry("moving", "    ✅ Moved successfully");

    createEntry("injection", "Injecting shims");
    for (const path of paths) {
        appendEntry("injection", "Injecting into: " + path);
        await new Promise(r => setTimeout(r, 1000));
        appendEntry("injection", "    ✅ Injection successful");
    }

    log("✅ Installation completed!");
};