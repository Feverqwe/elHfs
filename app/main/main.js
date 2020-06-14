const {app, Menu, Tray, dialog, shell} = require('electron');
const express = require('express');
const expressIndex = require('express-index');
const compression = require('compression');
const Fs = require('fs');
const Path = require('path');

const configPath = Path.join(app.getAppPath(), 'config.json');

const defaultConfig = {
  port: 80,
  address: '0.0.0.0',
  public: app.getAppPath(),
};

const config = {...defaultConfig};

(() => {
  if (!app.requestSingleInstanceLock()) {
    return app.quit();
  }

  app.setAppUserModelId('com.electron.hfs');

  app.on('ready', () => {
    setTrayMenu();

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
  app.use('/', expressIndex(path, { theme : 'darko' }));

  server = app.listen(port, address);
  server.on('connection', (socket) => {
    connections.push(socket);
    socket.once('close', function () {
      removeFromArrayItem(connections, socket);
    });
  });
}

function setTrayMenu() {
  const tray = new Tray(Path.join(__dirname, '../assets/icons/48.png'));

  tray.setContextMenu(getContextMenu());
}

function getContextMenu() {
  const items = [];

  items.push({
    label: 'Open',
    click: () => {
      let address = config.address;
      if (address === '0.0.0.0') {
        address = '127.0.0.1';
      }
      shell.openExternal(`http://${address}:${config.port}/`);
    }
  });

  items.push({
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

  items.push({
    label: 'Edit config',
    click: () => {
      ensureConfig();
      shell.openExternal(configPath);
    }
  });

  items.push({
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
