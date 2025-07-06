const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('Bridge', {
  register: (name) => ipcRenderer.send('register', { name }),
  onRegister: (fn) => ipcRenderer.on('register-response', (_, info) => fn(info)),
  send: (msg) => ipcRenderer.send('route', msg),
  onMessage: (fn) => ipcRenderer.on('to-webview', (_, msg) => fn(msg))
});

// inscription dès le chargement
window.addEventListener('DOMContentLoaded', () => {
  const name = path.basename(__dirname);
  Bridge.register(name);
});
Bridge.send({ from: 0, to: '*', channel: 'test', data: 'ping manuel' });
