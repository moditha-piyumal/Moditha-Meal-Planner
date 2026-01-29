// =============================================
// 🧠 MAIN PROCESS — Meal Abacus
// =============================================

// Electron core modules
const { app, BrowserWindow, ipcMain } = require("electron");

// Node utility for file paths
const path = require("path");

// Keep a global reference to the window
// (prevents it from being garbage-collected)
let mainWindow;

// =============================================
// 🪟 CREATE MAIN WINDOW
// =============================================
function createWindow() {
	// Create the browser window
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 900,
		resizable: false, // simple utility app — fixed layout
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			// ❗ No nodeIntegration here
			// We will do things the right way via preload
		},
	});

	// Load the HTML file
	mainWindow.loadFile("index.html");

	// Optional: open DevTools while building
	mainWindow.webContents.openDevTools();

	// When window is closed
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

// =============================================
// 📡 IPC HANDLERS
// =============================================

// Provide AppData (userData) path to renderer
ipcMain.handle("get-user-data-path", () => {
	return app.getPath("userData");
});

// =============================================
// 🚀 APP LIFECYCLE
// =============================================

// This runs when Electron is ready
app.whenReady().then(() => {
	createWindow();

	// macOS behavior (not critical for Windows, but correct)
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

// Quit app when all windows are closed (Windows behavior)
app.on("window-all-closed", () => {
	// On Windows, we quit immediately
	if (process.platform !== "darwin") {
		app.quit();
	}
});
