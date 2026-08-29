const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  setTitleBarTheme: (isDark) => ipcRenderer.invoke("set-titlebar-theme", isDark),
});