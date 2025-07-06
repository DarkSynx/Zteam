const path = require('path');  // ← ajoute cette ligne
const { app, BrowserWindow, ipcMain } = require('electron');
require(path.join(__dirname, 'controleur.js'));

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1200, height: 800, frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      webviewTag: true
    }
  });
  win.loadFile('index.html');
}
app.whenReady().then(createWindow);

ipcMain.on('window-minimize', () => win.minimize());
ipcMain.on('window-toggle-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('window-close', () => win.close());
