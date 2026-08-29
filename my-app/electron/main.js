const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

// Same hex values used for --background / --foreground in app/globals.css
const TITLEBAR_COLORS = {
  dark: { color: "#0c0c0c", symbolColor: "#ededed" },
  light: { color: "#f0f8ff", symbolColor: "#171717" },
};

let mainWindow = null;

function createWindow() {
  const supportsOverlay = process.platform === "win32" || process.platform === "linux";

  mainWindow = new BrowserWindow({
    title: "Leo",
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: TITLEBAR_COLORS.dark.color,
    show: false,
    ...(supportsOverlay
      ? {
          titleBarStyle: "hidden",
          titleBarOverlay: {
            color: TITLEBAR_COLORS.dark.color,
            symbolColor: TITLEBAR_COLORS.dark.symbolColor,
            height: 32,
          },
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.setTitle("Leo");
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }
}

ipcMain.handle("set-titlebar-theme", (_event, isDark) => {
  if (!mainWindow || !mainWindow.setTitleBarOverlay) return;
  const palette = isDark ? TITLEBAR_COLORS.dark : TITLEBAR_COLORS.light;
  try {
    mainWindow.setTitleBarOverlay({
      color: palette.color,
      symbolColor: palette.symbolColor,
      height: 32,
    });
    mainWindow.setBackgroundColor(palette.color);
  } catch {
    // titleBarOverlay isn't supported on this platform/window config — ignore.
  }
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});