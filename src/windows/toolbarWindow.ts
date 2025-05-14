import { BrowserWindow } from "electron";
import windowManager from "./windowManager";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

class ToolbarWindow {
  private window: BrowserWindow | null = null;

  private createWindow() {
    this.window = new BrowserWindow({
      height: 45,
      width: 800,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      backgroundMaterial: "mica",
      vibrancy: "sidebar",
      visualEffectState: "active",
      hasShadow: false,
      darkTheme: true,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    this.window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    this.window?.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });
    // this.window.on("closed", () => {
    //   this.window = null;
    // });
    this.window?.webContents.on("did-finish-load", () => {
      //asd
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

windowManager.setToolbarWindow(new ToolbarWindow());
