const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const url = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadURL(url.format({
    pathname:path.join(__dirname, 'build', 'index.html'),
    protocol:'file:'
  }));

}

app.whenReady().then(createWindow);
