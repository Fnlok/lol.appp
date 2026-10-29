const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("lolApp", {
  hasKey: () => ipcRenderer.invoke("key:has"),
  setKey: async k => { const r = await ipcRenderer.invoke("key:set", k); if (!r.ok) throw new Error(r.error); },
  ask: async prompt => { const r = await ipcRenderer.invoke("ia:ask", prompt); if (!r.ok) throw new Error(r.error); return r.data; }
});
