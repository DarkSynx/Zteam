const { contextBridge, ipcRenderer } = require('electron');
const { ModulesGestion } = require('../../mods.js');
const { fsx, path, jqueryPath, WinLoad, loadOrCreateInit } = ModulesGestion({ modulePath: __dirname });

window.addEventListener('DOMContentLoaded', () => {
  const defaultEntry = { name: path.basename(__dirname), id: '', uuid: '', zuid: '', role: '', context: '', active: true };
  const entry = loadOrCreateInit(__dirname, defaultEntry);

  Bridge.register(entry.name);
Bridge.send({ from: 0, to: '*', channel: 'test', data: 'ping manuel' });

  Bridge.onRegister((info) => {
    if (!entry.id) {
      entry.id = info.id;
      entry.uuid = info.uuid;
      entry.zuid = info.zuid;
      writeFile(path.join(__dirname, 'init.json'), JSON.stringify(entry, null,2));
    }
    WinLoad({ jqueryPath, afterModulLoad: function ($) {
      $('body').append(`<div>Zteam ID=${entry.id}</div>`);
    }});
  });

  Bridge.onMessage((msg) => alert(`Reçu: ${JSON.stringify(msg)}`));
});
