import { contextBridge, ipcRenderer, shell } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, args);
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  openExternal: (url: string) => {
    shell.openExternal(url);
  },
  dirname: __dirname,
});
