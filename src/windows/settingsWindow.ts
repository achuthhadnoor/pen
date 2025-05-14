import { BrowserWindow } from "electron";
import windowManager from "./windowManager";

class SettingsWindow {
  private window: BrowserWindow | null = null;

  private createWindow() {
    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.window.loadURL("path/to/license.html");

    this.window.on("closed", () => {
      this.window = null;
    });
  }
  open() {
    if (!this.window) this.createWindow();
    else this.window.show();
  }

  close() {
    if (this.window) this.window.close();
  }
}

windowManager.setSettingsWindow(new SettingsWindow());
