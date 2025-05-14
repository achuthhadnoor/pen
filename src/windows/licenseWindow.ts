import { BrowserWindow } from "electron";
import windowManager from "./windowManager";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

class LicenseWindow {
  private window: BrowserWindow | null = null;

  private createWindow() {
    this.window = new BrowserWindow({
      height: 600,
      width: 800,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    this.window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // this.window.on("closed", () => {
    //   this.window = null;
    // });
  }
  open() {
    if (!this.window) this.createWindow();
    else this.window.show();
  }

  close() {
    if (this.window) this.window.close();
  }
}

windowManager.setLicenseWindow(new LicenseWindow());
