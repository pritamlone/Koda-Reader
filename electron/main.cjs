const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  const preloadPath = path.join(__dirname, 'preload.cjs');

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: iconPath,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    backgroundColor: '#0f172a',
    show: false, // Hide until ready-to-show to avoid visual flash
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: fs.existsSync(preloadPath) ? preloadPath : undefined,
    },
  });

  if (process.platform === 'darwin' && app.dock && fs.existsSync(iconPath)) {
    app.dock.setIcon(iconPath);
  }

  // Reveal window as soon as content is rendered
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  const distIndexPath = path.join(__dirname, '../dist/index.html');

  // Load priority:
  // 1. Explicit dev server URL
  // 2. Production dist/index.html if built
  // 3. Local dev server (http://localhost:3000) with auto-retry
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (fs.existsSync(distIndexPath)) {
    mainWindow.loadFile(distIndexPath).catch((err) => {
      console.error('Failed to load dist/index.html:', err);
      mainWindow.loadURL(devServerUrl);
    });
  } else {
    mainWindow.loadURL(devServerUrl);
  }

  // If loading local dev server fails because Vite is still booting up, auto-retry
  let retryTimer = null;
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (!app.isPackaged && !fs.existsSync(distIndexPath)) {
      console.log(`Dev server not ready (${errorDescription}). Retrying in 1s...`);
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => {
        mainWindow.loadURL(devServerUrl);
      }, 1000);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
