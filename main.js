//Imports the app and BrowserWindow Electron modules
//- app controls the application's event lifecycle
//- BrowserWindow creates and manages app windows
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron/main')
const path = require('node:path')

//Loads the web page into a BrowserWindow instance
const createWindow = () => {
  const win = new BrowserWindow({
    width: 550,
    height: 650,
    resizable:false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.setMenu(null);
  win.loadFile('index.html')
}

//Calls the loading function when the app is ready
app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()
//For macOS
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})


//Exits the application if all windows are closed (excluding macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('close-app', function () {
    app.quit();
});

ipcMain.on('minimize-app', function () {
    BrowserWindow.getFocusedWindow().minimize();
});