/*
    Fliger
    Copyright (C) 2021  Atheesh  Thirumalairajan
    LICENSE
*/

const { app, BrowserWindow, screen, globalShortcut, dialog } = require('electron');
const { spawn } = require('child_process');
const ipc = require('electron').ipcMain;
const path = require("path");
const fliger_plugins = require("./plugins");
const open = require('open');
var fliger_bar;
var fliger_panel;

function createWindow() {
    var BrowserWindowOptions = {
        width: Math.round((screen.getPrimaryDisplay().workAreaSize.width) / 2),
        height: Math.round((screen.getPrimaryDisplay().workAreaSize.height) / 15),
        x: Math.round((screen.getPrimaryDisplay().workAreaSize.width) / 4),
        y: Math.round((screen.getPrimaryDisplay().workAreaSize.height) / 4),
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "api", "electron-scripts", 'preload_bar.js'),
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    };

    var SuggestionsWindowOptions = {
        width: Math.round((screen.getPrimaryDisplay().workAreaSize.width) / 2),
        height: Math.round((screen.getPrimaryDisplay().workAreaSize.height) / 2),
        x: Math.round((screen.getPrimaryDisplay().workAreaSize.width) / 4),
        y: BrowserWindowOptions.y + Math.round((screen.getPrimaryDisplay().workAreaSize.height) / 15) + 10, //+x for spacing
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, "api", "electron-scripts", 'preload_panel.js'),
            nodeIntegration: true,
            contextIsolation: false,
            //devTools: false,
        }
    };

    BrowserWindowOptions.type = "splash";
    SuggestionsWindowOptions.type = "splash";

    fliger_panel = new BrowserWindow(SuggestionsWindowOptions);
    fliger_panel.setResizable(false);
    fliger_panel.setVisibleOnAllWorkspaces(true);
    fliger_panel.loadFile(path.join(__dirname, "public", "fliger_panel.html"));

    fliger_bar = new BrowserWindow(BrowserWindowOptions);
    fliger_bar.setResizable(false);
    fliger_bar.setVisibleOnAllWorkspaces(true);
    fliger_bar.loadFile(path.join(__dirname, "public", "fliger_bar.html"));

    fliger_bar.on("blur", () => {
        if (!fliger_panel.isFocused() && !fliger_bar.isFocused()) {
            fliger_bar.hide();
            fliger_panel.hide();
        }
    });

    fliger_panel.on("hide", () => {
        fliger_panel.webContents.send("clear_suggestion_preview", { src: "app.js" });
    });

    ipc.on('display_suggestions', (event, message) => {
        if (message === true) {
            //fliger_panel.webContents.send('suggestion_data', suggestion_data);
            fliger_panel.show();
            fliger_bar.focus();
        } else {
            fliger_panel.hide();
            fliger_bar.focus();
        }
    });

    ipc.on("fliger_query_string", (event, message) => {
        fliger_plugins.automate(message, fliger_panel, (query_suggestions) => {
            fliger_panel.webContents.send("take_query_suggestions", query_suggestions);
        })
    });

    ipc.on("fliger-suggestion-default", (event, message) => {
        resetFrontend();
    })

    ipc.on("exec-term-command", (event, message) => {
        spawn(message, { shell: true, detached: true, stdio: 'ignore' }).unref();
        resetFrontend();
    });

    ipc.on("open-default-app", (event, message) => {
        open(message);
        resetFrontend();
    });

    ipc.on("show-fliger-licenses", (event, message) => {
        const license_message = "Fliger\nCopyright (C) 2021  Atheesh  Thirumalairajan\nGNU GENERAL PUBLIC LICENSE"
        dialog.showMessageBox(fliger_panel, {
            type: "info",
            message: license_message,
            buttons: ["Show all Licenses"],
            cancelId: 1,
            title: "License Information"
        }).then((clicked_button) => {
            if (!clicked_button.response == 1) {
                console.log("Opening Open Source Licenses");
                open(path.join(__dirname, "public", "licenses.pdf"));
                resetFrontend();
            }
        })
    });
}

function resetFrontend() {
    fliger_bar.webContents.send("clear_inpur_query", { src: "app.js" });
    fliger_panel.hide();
    fliger_bar.hide();
}

app.whenReady().then(() => {
    const fliger_launch_binder = globalShortcut.register('Control+Space', () => {
        console.log('Launch Shortcut Initated');
        if (fliger_bar.isVisible()) {
            fliger_bar.hide();
            fliger_panel.hide();
        } else {
            fliger_bar.show();
            fliger_bar.webContents.send('isQueryEmpty', { src: "app.js" });
            ipc.on("isQueryEmpty", (event, message) => {
                if (!message) {
                    fliger_panel.show();
                    fliger_bar.focus();
                }
            });
        }
    });

    if (!fliger_launch_binder) {
        console.log("Failed to Bind Global Shortcut!");
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});