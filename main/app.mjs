import * as path from "path";
import { fileURLToPath } from "url";
import { app, BrowserWindow, Menu, ipcMain, Tray } from "electron";
import { OllamaTranslationHandler } from "./ipc/ollama-handler.mjs";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export class Application {
  constructor(windowOptions) {
    this.app = app;
    this.lock = app.requestSingleInstanceLock();
    this.mainWindowOptions = Object.assign(windowOptions, {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
    });
    /** @type {BrowserWindow | null} */
    this.mainWindow = null;
    /** @type {Tray | null} */
    this.tray = null;
    this.ipcMain = ipcMain;
  }

  createMainWindow() {
    if (!this.mainWindow) {
      this.mainWindow = new BrowserWindow(this.mainWindowOptions);
    }
    this.mainWindow.loadFile("index.html");
    this.createTray();
    this.mainWindow.on("close", (e) => {
      e.preventDefault();
      this.mainWindow.hide();
    });
    return this.mainWindow;
  }

  createTray() {
    this.tray = new Tray("resources/app.png");
    const trayMenu = Menu.buildFromTemplate([
      {
        label: "显示窗口",
        click: () => {
          this.mainWindow.show();
        },
      },
      {
        label: "退出",
        click: () => {
          this.app.exit(0);
        },
      },
    ]);

    this.tray.setToolTip("MO7");
    this.tray.setContextMenu(trayMenu);
    this.tray.on("double-click", () => {
      this.mainWindow.show();
    });

    return this.tray;
  }

  initApp() {
    if (!this.lock) {
      this.app.exit(0);
    } else {
      this.app.on("second-instance", (event, command, workingDirectory) => {
        // 已经有实例运行则恢复原窗口
        this.createMainWindow();
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        this.mainWindow.focus();
      });

      this.app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
          this.app.quit();
        }
      });
      this.app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    }
  }

  initIPCMain() {
    this.ipcMain.on("mainWindow", (event, msg) => {
      switch (msg) {
        case "hide": {
          this.mainWindow.hide();
          break;
        }
        case "min": {
          this.mainWindow.minimize();
          break;
        }
        case "max": {
          if (this.mainWindow.isMaximized()) {
            this.mainWindow.restore();
          } else {
            this.mainWindow.maximize();
          }
          break;
        }
        case "pin": {
          let status = this.mainWindow.isAlwaysOnTop();
          this.mainWindow.setAlwaysOnTop(!status);
          // 是否置于最前端
          break;
        }
      }
    });

    this.ipcMain.handle("ollama-translator", OllamaTranslationHandler);
  }

  run() {
    this.initApp();
    this.initIPCMain();
    this.app.whenReady().then(() => {
      this.createMainWindow();
    });
  }
}
