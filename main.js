// =============================================
// 🧠 MAIN PROCESS — Meal Abacus
// =============================================

// Electron core modules
const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");

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
		width: 1280, // ⬅️ more horizontal breathing room
		height: 900,

		resizable: false, // simple utility app — fixed layout
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			// ❗ No nodeIntegration here — use preload + IPC
		},
	});

	// Load the HTML file
	mainWindow.loadFile("index.html");

	// Optional: open DevTools while building
	// mainWindow.webContents.openDevTools();

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
// 💾 STORAGE IPC
// =============================================

const DATA_FILE = "meal-abacus.json";

ipcMain.handle("load-data", () => {
	try {
		const filePath = path.join(app.getPath("userData"), DATA_FILE);

		if (!fs.existsSync(filePath)) {
			return null; // no saved plan yet
		}

		const raw = fs.readFileSync(filePath, "utf-8");
		return JSON.parse(raw);
	} catch (err) {
		console.error("Failed to load data:", err);
		return null;
	}
});

ipcMain.handle("save-data", (_, data) => {
	try {
		const filePath = path.join(app.getPath("userData"), DATA_FILE);
		fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
		return true;
	} catch (err) {
		console.error("Failed to save data:", err);
		return false;
	}
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
