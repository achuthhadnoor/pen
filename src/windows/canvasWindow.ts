import { BrowserWindow, screen } from "electron";
import windowManager from "./windowManager";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

class SettingsWindow {
  private windows: BrowserWindow[] = [];

  private createWindows() {
    // Get all displays
    const displays = screen.getAllDisplays();

    // Create a window for each display
    displays.forEach((display) => {
      const window = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        transparent: true,
        frame: false,
        hiddenInMissionControl: true,
        enableLargerThanScreen: true,
        alwaysOnTop: true,
        focusable: false,
        webPreferences: {
          preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
      });

      window.loadURL(`${MAIN_WINDOW_WEBPACK_ENTRY}/#/canvas`);
      window.setAlwaysOnTop(true, "screen-saver", 1);
      window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      window.setIgnoreMouseEvents(true);
      window.on("closed", () => {
        const index = this.windows.indexOf(window);
        if (index > -1) {
          this.windows.splice(index, 1);
        }
      });

      this.windows.push(window);
    });
  }

  open() {
    if (this.windows.length === 0) {
      this.createWindows();
    } else {
      this.windows.forEach((window) => window.show());
    }
  }

  close() {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.windows = [];
  }
}

windowManager.setCanvasWindow(new SettingsWindow());
