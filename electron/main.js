const { app, BrowserWindow, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

const isMac = process.platform === 'darwin';

function createWindow() {
  console.log('=== Creating main window ===');
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
  
  const htmlPath = path.join(__dirname, './dist/index.html');
  console.log('HTML path:', htmlPath);
  console.log('HTML path exists:', fs.existsSync(htmlPath));
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: 'YYC³ Cloud Intelli-Matrix',
    icon: path.join(__dirname, '../public/icons/icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#060e1f',
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 12, y: 12 },
  });

  console.log('Loading HTML file...');
  mainWindow.loadFile(htmlPath);

  mainWindow.on('ready-to-show', () => {
    console.log('=== Window ready to show ===');
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    console.log('=== Window closed ===');
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('=== Failed to load ===');
    console.error('Error code:', errorCode);
    console.error('Error description:', errorDescription);
    console.error('Validated URL:', validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('=== Page loaded successfully ===');
  });

  mainWindow.webContents.openDevTools();
}

function createTray() {
  console.log('=== Creating tray ===');
  const trayIconPath = path.join(__dirname, '../public/icons/icon-512.png');
  const trayIcon = nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: '重启应用',
      click: () => {
        app.relaunch();
        app.exit();
      },
    },
    {
      label: '检查更新',
      click: async () => {
        if (mainWindow) {
          dialog.showMessageBox(mainWindow, {
            title: '检查更新',
            message: '当前版本: v1.0.0',
            detail: '请访问 GitHub 查看最新版本',
            buttons: ['确定'],
          });
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]));

  tray.setIgnoreDoubleClickEvents(true);
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function init() {
  console.log('=== App initializing ===');
  
  if (app.requestSingleInstanceLock()) {
    console.log('=== Single instance lock acquired ===');
    
    app.on('second-instance', () => {
      console.log('=== Second instance detected ===');
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    });

    app.whenReady().then(() => {
      console.log('=== App ready ===');
      createWindow();
      createTray();

      app.on('activate', () => {
        console.log('=== App activated ===');
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      console.log('=== All windows closed ===');
      if (!isMac) {
        app.quit();
      }
    });
  } else {
    console.log('=== Another instance is running, quitting ===');
    app.quit();
  }
}

init();
