import {app, BrowserWindow, ipcMain} from "electron";
import path from "path";
import URL from "url";

const isDevelopment = process.env.NODE_ENV !== "production";
app.name = "BetterDiscord";

let mainWindow; // global reference to mainWindow (necessary to prevent window from being garbage collected)

function createMainWindow() {
    const window = new BrowserWindow({
        title: "BetterDiscord Installer",
        frame: false,
        width: 550,
        height: 350,
        resizable: false,
        fullscreenable: false,
        maximizable: false,
        backgroundColor: "#0c0d10",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    if (isDevelopment) {
        window.webContents.openDevTools({mode: "detach"});
    }

    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
    }
    else {
        window.loadURL(URL.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true
        }));
    }

    window.on("closed", () => {
        mainWindow = null;
    });

    window.webContents.on("devtools-opened", () => {
        window.focus();
        setImmediate(() => {
            window.focus();
        });
    });

    // force <a> tags to open in browser

    window.webContents.on("new-window", (e, url) => {
        e.preventDefault();
        require("electron").shell.openExternal(url);
    });  

    window.on('click', e => {
        console.log('hi');
        if (e.key === "ArrowRight") {
            goToNext();
        }
    });

    return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
    if (process.platform === "darwin") return; // on macOS it is common for applications to stay open until the user explicitly quits
    app.quit();
});

// on macOS it is common to re-create a window even after all windows have been closed
app.on("activate", () => {
    if (mainWindow !== null) return;
    mainWindow = createMainWindow();
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
    mainWindow = createMainWindow();
});
