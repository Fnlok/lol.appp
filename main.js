const { app, BrowserWindow, ipcMain, safeStorage, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const MODEL = "claude-sonnet-5-5"; // cambia aquí el modelo si lo necesitas
const keyFile = () => path.join(app.getPath("userData"), "ia-key.bin");

function getKey() {
  try {
    const b = fs.readFileSync(keyFile());
    return safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(b) : b.toString("utf8");
  } catch (e) { return null; }
}
function setKey(k) {
  const data = safeStorage.isEncryptionAvailable() ? safeStorage.encryptString(k) : Buffer.from(k, "utf8");
  fs.writeFileSync(keyFile(), data, { mode: 0o600 });
}
function parseJson(text) {
  const t = text.replace(/```json|```/g, "");
  const a = Math.min(...["[", "{"].map(c => { const i = t.indexOf(c); return i < 0 ? Infinity : i; }));
  const b = Math.max(t.lastIndexOf("]"), t.lastIndexOf("}"));
  if (!isFinite(a) || b < a) throw new Error("La IA no devolvió un JSON válido");
  return JSON.parse(t.slice(a, b + 1));
}

ipcMain.handle("key:has", () => !!getKey());
ipcMain.handle("key:set", (_e, k) => {
  if (typeof k !== "string" || !k.startsWith("sk-ant-")) return { ok: false, error: "La clave debe empezar con sk-ant-" };
  setKey(k.trim()); return { ok: true };
});
ipcMain.handle("ia:ask", async (_e, prompt) => {
  const key = getKey();
  if (!key) return { ok: false, error: "Primero guarda tu clave de la API" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 4000, messages: [{ role: "user", content: String(prompt) }] })
    });
    const j = await res.json();
    if (!res.ok) return { ok: false, error: "Error " + res.status + ": " + ((j.error && j.error.message) || "solicitud rechazada") };
    const text = (j.content || []).filter(c => c.type === "text").map(c => c.text).join("");
    return { ok: true, data: parseJson(text) };
  } catch (e) { return { ok: false, error: e.message }; }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 860, minWidth: 700, minHeight: 600, title: "Builds Locas LoL",
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file://")) e.preventDefault(); });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
