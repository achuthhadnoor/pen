// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
  preferences: {},
  app: {
    quit: () => ipcRenderer.invoke("quit"),
  },
  handleOpenUrl: (callback: any) => ipcRenderer.on("open-url", callback),
};

contextBridge.exposeInMainWorld("api", electronAPI);

type electronAPIType = typeof electronAPI;
export { electronAPIType };
