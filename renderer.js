window.onload = () => {
  // Boutons de fenêtre
  document.getElementById('min-btn').onclick = () => window.api.minimize();
  document.getElementById('max-btn').onclick = () => window.api.maximize();
  document.getElementById('close-btn').onclick = () => window.api.close();

  // Si un onglet est cliqué, activation
  document.getElementById('tabbar').addEventListener('click', e => {
    if (e.target.classList.contains('tab')) {
      activateTab(e.target.dataset.id);
    }
  });

  // Si clic droit (suppression) sur un onglet
  document.getElementById('tabbar').addEventListener('contextmenu', e => {
    if (e.target.classList.contains('tab') && e.target.dataset.id !== 'zteam') {
      e.preventDefault();
      removeTab(e.target.dataset.id);
    }
  });

  // Bouton "+ IA"
  document.getElementById('addTabBtn').onclick = addTab;
  

  
};

  document.getElementById('wv-test').send('to-webview', { msg: 'Hello' });

const wvTest = document.getElementById('wv-test');

wvTest.addEventListener('ipc-message', (e) => {
  if (e.channel === 'webview-msg') {
    const msg = e.args[0];
    console.log('🌐 Message reçu de Test WebView :', msg);

    // Pour l’exemple, on renvoie une réponse
    wvTest.send('central-msg', { reply: 'Bien reçu !', original: msg });
  }
});


let tabCount = 1;

function addTab() {
  const id = `ia${tabCount++}`;
  // Création onglet
  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.id = id;
  tab.textContent = id;
  document.getElementById('tabs-right').before(tab);


  activateTab(id);
}

function activateTab(id) {
  // Onglet actif
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.id === id);
  });
  // Webview actif
  document.querySelectorAll('webview').forEach(wv => {
    if (wv.id === `wv-${id}`) {
      wv.classList.remove('inactive');
      wv.classList.add('active');
    } else {
      wv.classList.remove('active');
      wv.classList.add('inactive');
    }
  });
}

function removeTab(id) {
  const tab = document.querySelector(`.tab[data-id="${id}"]`);
  const wv = document.getElementById(`wv-${id}`);
  if (tab && wv) {
    tab.remove();
    wv.remove();
    activateTab('zteam');
  }
}
