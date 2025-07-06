const { contextBridge, ipcRenderer } = require('electron');
const { ModulesGestion } = require('../../mod.js');
const { fsx, path, jqueryPath, WinLoad, loadOrCreateInit, readFile, writeFile } = ModulesGestion({ modulePath: __dirname });

contextBridge.exposeInMainWorld('Bridge', {
  register: (name) => ipcRenderer.send('register', { name }),
  onRegister: (cb) => ipcRenderer.once('register-response', (_, info) => cb(info)),
  send: (msg) => ipcRenderer.send('route', msg),
  onMessage: (cb) => ipcRenderer.on('to-webview', (_, msg) => cb(msg))
});

window.addEventListener('DOMContentLoaded', () => {
  const defaultEntry = { name: path.basename(__dirname), id: '', uuid: '', zuid: '', role: '', context: '', active: true };
  const entry = loadOrCreateInit(__dirname, defaultEntry);

  Bridge.register(entry.name);

  Bridge.onRegister((info) => {
    if (!entry.id) {
      entry.id = info.id;
      entry.uuid = info.uuid;
      entry.zuid = info.zuid;
      writeFile(path.join(__dirname, 'init.json'), JSON.stringify(entry, null, 2));
    }
    WinLoad({
      jqueryPath,
      afterModulLoad: function ($) {
        $('body').append(`<div>Zteam ID=${entry.id}</div>`);
        document.getElementById('send-btn').addEventListener('click', () => {
          Bridge.send({ from: entry.id, to: '*', channel: 'zteam', data: 'Hello from Zteam!' });
        });
      }
    });
  });

  Bridge.onMessage((msg) => {
    alert(`from ${msg.from}: ${msg.data}`);
  });
});

