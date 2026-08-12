const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  ping: () => 'pong',
  readdirSync: (dirPath) => {
    try {
      return fs.readdirSync(dirPath);
    } catch (e) {
      console.error('Error in readdirSync:', e);
      return [];
    }
  },
  dirname: (filePath) => path.dirname(filePath),
  join: (...args) => path.join(...args),
  readFileSync: (filePath) => {
    try {
      return fs.readFileSync(filePath);
    } catch (e) {
      console.error('Error in readFileSync:', e);
      return null;
    }
  },
  existsSync: (filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch (e) {
      return false;
    }
  },
});

