const {expect} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// helper to create a fake webview object
function fakeWebview(name) {
  return {
    name,
    send: sinon.spy(),
    getURL: () => `file:///webview/${name}/`
  };
}

// create stubs for electron ipcMain and webContents
function createStubs() {
  const listeners = {};
  const ipcMain = {
    on: (channel, handler) => { listeners[channel] = handler; }
  };
  const webContents = {
    getAllWebContents: () => stubs.webviews
  };
  const stubs = {ipcMain, webContents, webviews: []};
  return {stubs, listeners};
}

function loadController(stubs) {
  return proxyquire('../controleur.js', {
    electron: {
      ipcMain: stubs.ipcMain,
      webContents: stubs.webContents
    },
    fs: require('fs-extra'),
    path: require('path'),
    crypto: require('crypto')
  });
}

describe('controller message routing', () => {
  it('routes messages between webviews', () => {
    const {stubs, listeners} = createStubs();
    // preload controller with our stubs
    loadController(stubs);

    // register two webviews
    const event = { reply: sinon.spy() };
    listeners['register'](event, {name: 'zteam'});
    const zInfo = event.reply.firstCall.args[1];
    stubs.webviews.push(fakeWebview('zteam'));

    const event2 = { reply: sinon.spy() };
    listeners['register'](event2, {name: 'test'});
    const tInfo = event2.reply.firstCall.args[1];
    stubs.webviews.push(fakeWebview('test'));

    // route message from zteam to test
    const routeEvent = {};
    const msg = {from: zInfo.id, to: tInfo.id, channel: 'chat', data: 'hello'};
    listeners['route'](routeEvent, msg);

    expect(stubs.webviews[1].send.calledWith('to-webview', sinon.match.any)).to.be.true;
    const payload = stubs.webviews[1].send.firstCall.args[1];
    expect(payload.from).to.equal(zInfo.id);
    expect(payload.data).to.equal('hello');
  });
});
