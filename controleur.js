const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { ipcMain, webContents } = require('electron');

const CFG = path.join(__dirname, 'config.json');
let config = { onglets: [] };

function log(...args) {
  console.log('[CONTROLEUR]', ...args);
}

function loadConfig() {
  if (fs.existsSync(CFG)) {
    config = fs.readJsonSync(CFG);
    log('Config chargée :', config);
  } else {
    log('Aucune config existante, nouveau fichier initialisé');
  }
}

function saveConfig() {
  fs.writeJsonSync(CFG, config, { spaces: 2 });
  log('Config sauvegardée');
}

function makeUUID() {
  return crypto.randomUUID();
}
function makeZUID(uuid) {
  return crypto.createHash('sha256').update(uuid).digest('hex');
}

function register(event, { name }) {
  log('Requête d\'inscription reçue pour onglet :', name);
  loadConfig();

  let entry = config.onglets.find(o => o.name === name && o.active);
  if (!entry) {
    const uuid = makeUUID();
    const id = config.onglets.length + 1;
    const zuid = makeZUID(uuid);
    entry = { name, id, uuid, zuid, role: '', context: '', active: true };
    config.onglets.push(entry);
    saveConfig();

    const initPath = path.join(__dirname, 'webview', name, 'init.json');
    fs.ensureDirSync(path.dirname(initPath));
    fs.writeJsonSync(initPath, entry, { spaces: 2 });
    log('init.json créé pour', name, entry);
  } else {
    log('Onglet déjà enregistré, renvoi des mêmes données :', entry);
  }

  event.reply('register-response', entry);
  log('Sent register-response pour', name);
}

function routeMessage(event, msg) {
  log('Message route reçu :', msg);
  loadConfig();

  const { from, to, channel, data } = msg;

  config.onglets.forEach(o => {
    if (!o.active) return;
    const wc = webContents
      .getAllWebContents()
      .find(w => w.getURL().includes(`/webview/${o.name}/`));
    if (!wc) return;
    if (to === '*' || to === o.id) {
      wc.send('to-webview', { from, channel, data });
      log(`→ envoyé à id=${o.id} (${o.name}) via channel '${channel}'`);
    }
  });
}

ipcMain.on('register', register);
ipcMain.on('route', (e, msg) => routeMessage(e, msg));

log('✅ Contrôleur initialisé et en écoute');
