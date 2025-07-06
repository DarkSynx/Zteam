// mods.js – à placer à la racine de ton projet
const fs = require('fs-extra');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');

// Une simple API d'encodage
function readFile(filePath, encoding = null) {
  const buf = fs.readFileSync(filePath);
  if (!encoding) {
    const info = jschardet.detect(buf);
    encoding = info.encoding || 'utf-8';
  }
  return iconv.decode(buf, encoding);
}

function writeFile(filePath, data, encoding = 'utf-8') {
  const buf = iconv.encode(data, encoding);
  fs.outputFileSync(filePath, buf);
}

function loadOrCreateInit(modulePath, defaultEntry) {
  const initPath = path.join(modulePath, 'init.json');
  let entry = {};

  if (fsx.existsSync(initPath)) {
    entry = JSON.parse(readFile(initPath));
  } else {
    entry = defaultEntry;
  }

  let changed = false;
  for (const key of Object.keys(defaultEntry)) {
    if (entry[key] === undefined || entry[key] === '') {
      entry[key] = defaultEntry[key];
      changed = true;
    }
  }

  if (changed) writeFile(initPath, JSON.stringify(entry, null, 2));
  return entry;
}


// Fonctions d’I/O ou de reconnaissance, à adapter
async function speechToText(audioPath) {
  // Mock : à remplacer par la vraie API si besoin
  return `Texte reconnu depuis ${audioPath}`;
}
async function speakText(text) {
  // Mock
  console.log('→ Speech:', text);
}

// Injection de jQuery + callback
function WinLoad({ jqueryPath, afterModulLoad }) {
  const script = document.createElement('script');
  script.src = jqueryPath;
  script.onload = () => {
    const $ = window.$;
    afterModulLoad($, jQuery);
  };
  document.head.appendChild(script);
}

// Communication de la webview vers le centralisateur
function ipcToWebView(msg) {
  ipcRenderer.sendToHost('webview-msg', msg);
}

// Définition du chemin vers le jQuery local
const jqueryPath = path.join(__dirname, 'jquery-3.7.1.min.js');

// Structure exposée
function ModulesGestion({ modulePath }) {
  return {
    fsx: fs,
    path,
    jqueryPath,
    WinLoad,
    ipcToWebView,
    path_CFG: path.join(modulePath, 'config.json'),
    path_ROOT: modulePath,
    path_DOCS: path.join(modulePath, 'docs'),
    readFile,
    writeFile,
    speechToText,
    speakText
  };
}

module.exports = { ModulesGestion };
