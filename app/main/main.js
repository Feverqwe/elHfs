const {app, Menu, Tray, dialog, shell, nativeImage, powerSaveBlocker} = require('electron');
const express = require('express');
const folderIndex = require('./folder-index');
const compression = require('compression');
const Fs = require('fs');
const Path = require('path');

const configPath = Path.join(app.getPath('userData'), 'config.json');

const defaultConfig = {
  port: 80,
  address: null,
  public: Path.dirname(app.getPath('exe')),
};

const config = {...defaultConfig};

let trayIcon = null;

(() => {
  if (!app.requestSingleInstanceLock()) {
    return app.quit();
  }

  app.setAppUserModelId('com.electron.hfs');

  return app.whenReady().then(() => {
    trayIcon = setTrayMenu();

    reload();
  });
})();

function reload() {
  loadConfig();

  createServer(config.public, config.address, config.port);
}

function loadConfig() {
  for (const key in config) {
    delete config[key];
  }

  Object.assign(config, defaultConfig);

  try {
    Object.assign(config, JSON.parse(Fs.readFileSync(configPath).toString()));
  } catch (err) {
    if (err.code === 'ENOENT') {
      ensureConfig();
    } else {
      console.error('Read config error', err);
    }
  }
}

function saveConfig() {
  Fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function ensureConfig() {
  try {
    Fs.accessSync(configPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      Fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } else {
      console.error('ensureConfig config error', err);
    }
  }
}

let server = null;
const connections = [];
function createServer(path, address, port) {
  if (server) {
    while (connections.length) {
      const socket = connections.shift();
      if (socket.destroyed) continue;
      socket.destroy();
    }
    server.close();
  }

  const app = express();
  app.use(compression());

  app.use('/', express.static(path));
  app.use('/', folderIndex(path));

  server = app.listen(port, address);
  server.on('connection', (socket) => {
    connections.push(socket);
    socket.once('close', function () {
      removeFromArrayItem(connections, socket);
      if (connections.length === 0) {
        stopNoSleep();
      }
    });
    if (connections.length === 1) {
      startNoSleep();
    }
  });
}

let timeoutId = null;
let noSleepId = null;
function startNoSleep() {
  clearTimeout(timeoutId);
  if (noSleepId === null) {
    noSleepId = powerSaveBlocker.start('prevent-app-suspension');
  }
}
function stopNoSleep() {
  if (noSleepId !== null) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      powerSaveBlocker.stop(noSleepId);
      noSleepId = null;
    }, 3 * 60 * 1000);
  }
}

function setTrayMenu() {
  const icons = [{
    path: Path.join(__dirname, '../assets/icons/icon.ico'), scaleFactor: 1.0,
  }, {
    path: Path.join(__dirname, '../assets/icons/16.png'), scaleFactor: 1.0,
  }, {
    path: Path.join(__dirname, '../assets/icons/32.png'), scaleFactor: 2.0,
  }];

  let iconImage;
  for (const {path, scaleFactor = 1.0} of icons) {
    if (/\.ico/.test(path)) {
      if (process.platform !== 'win32') continue;
      iconImage = nativeImage.createFromPath(path);
      break;
    } else {
      if (!iconImage) {
        iconImage = nativeImage.createEmpty();
      }
      const buffer = Fs.readFileSync(path);
      iconImage.addRepresentation({buffer, scaleFactor});
    }
  }

  const tray = new Tray(iconImage);

  tray.setContextMenu(getContextMenu());

  return tray;
}

function getContextMenu() {
  const items = [];

  items.push({
    label: 'Open',
    click: () => {
      let address = config.address;
      if (!address || address === '0.0.0.0') {
        address = '127.0.0.1';
      }
      shell.openExternal(`http://${address}:${config.port}/`);
    }
  });

  let configItems = null;
  items.push({
    label: 'Config',
    submenu: configItems = []
  });

  configItems.push({
    label: 'Set public path',
    click: () => {
      dialog.showOpenDialog({
        defaultPath: config.public,
        properties: ['openDirectory']
      }).then(({canceled, filePaths}) => {
        if (canceled || !filePaths.length) return;
        config.public = filePaths[0];
        saveConfig();
        reload();
      });
    }
  });

  configItems.push({
    label: 'Edit config',
    click: () => {
      ensureConfig();
      shell.openExternal(configPath);
    }
  });

  configItems.push({
    label: 'Open config path',
    click: () => {
      ensureConfig();
      shell.openPath(Path.dirname(configPath));
    }
  });

  configItems.push({
    label: 'Reload config',
    click: () => {
      reload();
    }
  });

  items.push({
    label: 'Quit',
    click: () => {
      app.quit();
    }
  });

  return Menu.buildFromTemplate(items);
}

function removeFromArrayItem(arr, item) {
  const pos = arr.indexOf(item);
  if (pos !== -1) {
    arr.splice(pos, 1);
    return true;
  }
  return false;
}
