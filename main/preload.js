const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("ipcSend", (channel, msg) => {
  return ipcRenderer.send(channel, msg);
});

contextBridge.exposeInMainWorld("ipcInvoke", async (channel, msg) => {
  return await ipcRenderer.invoke(channel, msg);
});
