import { app, BrowserWindow, Menu, nativeImage, ipcMain, dialog } from 'electron';
import path from 'path';
import dotenv from 'dotenv';
import { createApplicationMenu, createContextMenu } from './menu';
import { setupFFmpegHandlers } from './ipc/handlers';

// Load environment variables BEFORE anything else
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  // Development: Load from apps/desktop/.env.local
  dotenv.config({ path: path.join(__dirname, '../.env.local') });
  console.log(
    '[Env] Loaded .env.local from:',
    path.join(__dirname, '../.env.local')
  );
} else {
  // Production: Load from user data directory
  const userDataPath = app.getPath('userData');
  const envPath = path.join(userDataPath, '.env.local');
  dotenv.config({ path: envPath });
  console.log('[Env] Loaded .env.local from:', envPath);
}

// Log configuration status (don't log sensitive values)
console.log('[Env] Environment loaded');
console.log(
  '[Env] Storage mode:',
  process.env.GCS_BUCKET_NAME ? 'hybrid' : 'local-only'
);

// Set app name before app is ready
app.name = 'HLS Starter';
const isMac = process.platform === 'darwin';
const WEB_URL = isDev
  ? 'http://localhost:3000'
  : 'https://your-production-url.com';

let mainWindow: BrowserWindow | null = null;

/**
 * Setup IPC handlers for window controls
 * Allows the renderer process to control window state
 */
function setupWindowControls() {
  ipcMain.on('window-minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  // Handle window state queries
  ipcMain.handle('window-is-maximized', () => {
    return mainWindow?.isMaximized() ?? false;
  });
}

/**
 * Setup file system IPC handlers
 */
function setupFileSystemHandlers() {
  // File picker
  ipcMain.handle(
    'fs:select-file',
    async (
      event,
      options?: { filters?: Array<{ name: string; extensions: string[] }> }
    ) => {
      if (!mainWindow) return null;

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: options?.filters || [
          {
            name: 'Video Files',
            extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
          },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled) return null;
      return result.filePaths[0];
    }
  );

  // Directory picker
  ipcMain.handle('fs:select-directory', async () => {
    if (!mainWindow) return null;

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  // Save location picker
  ipcMain.handle(
    'fs:select-save-location',
    async (event, defaultPath?: string) => {
      if (!mainWindow) return null;

      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath,
        filters: [
          { name: 'Video Files', extensions: ['mp4', 'mov', 'mkv'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled) return null;
      return result.filePath;
    }
  );
}

/**
 * Setup platform info handler
 */
function setupPlatformHandlers() {
  ipcMain.handle('platform:info', () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      appVersion: app.getVersion(),
      storageMode: process.env.GCS_BUCKET_NAME ? 'hybrid' : 'local-only',
    };
  });
}

async function createWindow() {
  // Load icon
  const iconPath = isMac
    ? path.join(__dirname, '../assets/icons/icon.icns')
    : process.platform === 'win32'
      ? path.join(__dirname, '../assets/icons/icon.ico')
      : path.join(__dirname, '../assets/icons/512x512.png');

  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch (error) {
    console.warn('Could not load app icon:', error);
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'HLS Starter',
    icon,
    backgroundColor: '#0a0a0a',

    // Custom title bar configuration using Window Controls Overlay API
    ...(isMac && {
      titleBarStyle: 'hidden', // Hide title bar completely
      trafficLightPosition: { x: 12, y: 12 }, // Position traffic lights
    }),

    // For Windows/Linux - frameless with custom controls
    ...(!isMac && {
      frame: false, // Remove default frame on Windows/Linux
    }),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Set up application menu
  const menu = createApplicationMenu();
  Menu.setApplicationMenu(menu);

  // Set up context menu for right-click
  const contextMenu = createContextMenu();
  mainWindow.webContents.on('context-menu', () => {
    contextMenu.popup();
  });

  // Load from localhost in dev, production URL in production
  await mainWindow.loadURL(WEB_URL);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log icon path for debugging
  if (icon && !icon.isEmpty()) {
    console.log('Icon loaded from:', iconPath);
  } else {
    console.log('Using default icon');
  }
}

void app.whenReady().then(async () => {
  // Set dock icon (macOS)
  if (isMac) {
    const dockIconPath = path.join(__dirname, '../assets/icons/512x512.png');
    try {
      const dockIcon = nativeImage.createFromPath(dockIconPath);
      if (!dockIcon.isEmpty()) {
        app.dock.setIcon(dockIcon);
      }
    } catch (error) {
      console.warn('Could not set dock icon:', error);
    }
  }

  // Setup all IPC handlers
  setupWindowControls();
  setupFileSystemHandlers();
  setupPlatformHandlers();
  setupFFmpegHandlers();

  await createWindow();

  app.on('activate', () => {
    void (async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
      }
    })();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
