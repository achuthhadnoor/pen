import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import "./windows/load";
import windowManager from "./windows/windowManager";

let tray: Tray | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  if (app.dock) {
    app.dock.hide();
  }
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle("☡");
  tray.setToolTip("Annotate");
  tray.on("click", () => {
    tray.popUpContextMenu(
      Menu.buildFromTemplate([
        {
          label: "Toggle annotate",
        },
        {
          type: "separator",
        },
        {
          label: "Help",
          enabled: false,
        },
        { label: "Guide: How to..." },
        { label: "Send Feedback" },
        { label: "Give a tip!" },
        { label: "Follow us" },
        {
          type: "separator",
        },
        {
          label: "Version 2.0.0",
          enabled: false,
        },
        { label: "Changelog" },
        { label: "About" },
        {
          label: "Auto launch",
          type: "checkbox",
        },
        {
          type: "separator",
        },
        {
          label: "Updates",
          enabled: false,
        },
        { label: "Check for updates" },
        {
          type: "separator",
        },
        {
          label: "Debug",
          enabled: false,
        },
        { label: "Debug log" },
        { label: "Open log" },
        {
          type: "separator",
        },
        {
          role: "quit",
          accelerator: "meta+q",
        },
      ])
    );
  });
  windowManager.toolbar.open();
  windowManager.canvas.open();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.license.open();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
