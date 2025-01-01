const { app, BrowserWindow, screen, ipcMain, dialog } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
let mainWindow;
let numberOfDisplays = 0;

// Check if we're running from webpack bundle
const isProduction = typeof IS_PROD !== "undefined" && IS_PROD;

function createTempHtml() {
  // Create temp html file only in production
  tempHtmlPath = path.join(os.tmpdir(), `proctoring-${Date.now()}.html`);
  fs.writeFileSync(tempHtmlPath, INLINE_HTML);
  return tempHtmlPath;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 120,
    height: 120,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isProduction) {
    const htmlPath = createTempHtml();
    mainWindow.loadFile(htmlPath);
  } else {
    mainWindow.loadFile("index.html");
  }

  // Check displays every 10 seconds
  setInterval(updateDisplayInfo, 10000);
  updateDisplayInfo();
}

function updateDisplayInfo() {
  const displays = screen.getAllDisplays();
  if (numberOfDisplays === 0) {
    numberOfDisplays = displays.length;
    if (numberOfDisplays > 1) {
      showDisplayInfo();
    }
  } else if (numberOfDisplays !== displays.length && displays.length > 1) {
    numberOfDisplays = displays.length;
    showDisplayInfo();
  }
  const displayInfo = displays.map((display) => ({
    id: display.id,
    name: display.label || `Display ${display.id}`,
    bounds: display.bounds,
    internal: display.internal,
  }));
  mainWindow.webContents.send("display-count", {
    count: displays.length,
    displays: displayInfo,
  });
}

function showDisplayInfo() {
  const displays = screen.getAllDisplays();
  let message = displays
    .map((display) => {
      const name = display.label || `Display ${display.id}`;
      return (
        `${name}${display.internal ? " (Internal)" : ""}:\n` +
        `Resolution: ${display.bounds.width} x ${display.bounds.height}\n` +
        `Position: (${display.bounds.x}, ${display.bounds.y})\n`
      );
    })
    .join("\n");

  dialog.showMessageBox(mainWindow, {
    type: "error",
    title: "Error",
    message: `Total Displays: ${displays.length}`,
    detail: message,
    buttons: ["OK"],
  });
}

ipcMain.on("show-display-info", () => {
  showDisplayInfo();
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("will-quit", () => {
  if (isProduction && tempHtmlPath) {
    try {
      fs.unlinkSync(tempHtmlPath);
    } catch (err) {
      console.error("Error cleaning up:", err);
    }
  }
});
