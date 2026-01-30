// =============================================
// 🌉 PRELOAD SCRIPT — Meal Abacus
// =============================================

// Electron utilities for safe bridging
const { contextBridge, ipcRenderer } = require("electron");

// Node utility for paths
const path = require("path");

// =============================================
// 🔐 SAFE API EXPOSURE
// =============================================

// Everything exposed here will be accessible as:
// window.mealAPI.<function>
contextBridge.exposeInMainWorld("mealAPI", {
	getUserDataPath: () => ipcRenderer.invoke("get-user-data-path"),
	loadData: () => ipcRenderer.invoke("load-data"),
	saveData: (data) => ipcRenderer.invoke("save-data", data),
});

// contextBridge.exposeInMainWorld("mealAPI", {
// 	// -----------------------------------------
// 	// 📁 Get AppData path (userData)
// 	// -----------------------------------------
// 	getUserDataPath: () => {
// 		// Ask main process for the path
// 		return ipcRenderer.invoke("get-user-data-path");
// 	},

// 	// ⚠️ Future methods will go here:
// 	// - loadData()
// 	// - saveData()
// });
