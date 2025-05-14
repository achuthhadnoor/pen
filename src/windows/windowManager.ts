interface LicenseWindowManager {
  open: () => void;
  close: () => void;
}
interface SettingsWindowManager {
  open: () => void;
  close: () => void;
}

class WindowManager {
  toolbar: LicenseWindowManager;
  canvas: LicenseWindowManager;
  license: LicenseWindowManager;
  settings: SettingsWindowManager;

  setToolbarWindow(toolbar: LicenseWindowManager) {
    this.toolbar = toolbar;
  }
  setCanvasWindow(canvas: LicenseWindowManager) {
    this.canvas = canvas;
  }
  setLicenseWindow(license: LicenseWindowManager) {
    this.license = license;
  }
  setSettingsWindow(settings: SettingsWindowManager) {
    this.settings = settings;
  }
}

export default new WindowManager();
