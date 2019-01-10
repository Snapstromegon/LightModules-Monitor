const assert = require('assert');
const { EventEmitter } = require('events');

const WebClientMgr = require('../../class/WebClientMgr');

describe('/class/WebClientMgr', () => {

  describe('addClient', () => {
    let wCMgr;
    let fakeClient;
    beforeEach(() => {
      wCMgr = new WebClientMgr();
      fakeClient = new EventEmitter();
      fakeClient.send = () => { };
    });

    it('should add the client to the clients', () => {
      wCMgr.addClient(fakeClient);
      assert.strictEqual(wCMgr.clients.has(fakeClient), true);
    });
    it('should remove the client on close', () => {
      wCMgr.addClient(fakeClient);
      fakeClient.emit('close');
      assert.strictEqual(wCMgr.clients.has(fakeClient), false);
    });
    it('should remove the client on end', () => {
      wCMgr.addClient(fakeClient);
      fakeClient.emit('end');
      assert.strictEqual(wCMgr.clients.has(fakeClient), false);
    });
    it('should remove the client on error', () => {
      wCMgr.addClient(fakeClient);
      fakeClient.emit('error');
      assert.strictEqual(wCMgr.clients.has(fakeClient), false);
    });
    it('should remove the client on error', () => {
      const testMsg = {};
      wCMgr.addClient(fakeClient);
      wCMgr.handleClientMessage = data => assert.strictEqual(data, testMsg);
      fakeClient.emit('message', testMsg);
    });
    it('should send the client the last message', () => {
      const testMsg = {};
      wCMgr.broadcast(testMsg);
      fakeClient.send = data => assert.strictEqual(data, JSON.stringify(testMsg));
      wCMgr.addClient(fakeClient);
    });
  });

  describe('removeClient', () => {
    it('should remove client from clients', () => {
      const wCMgr = new WebClientMgr();
      const fakeClient = {
        'on': () => { },
        'send': () => { }
      };
      wCMgr.addClient(fakeClient);
      wCMgr.removeClient(fakeClient);
      assert.strictEqual(wCMgr.clients.size, 0);
    });
  });

  describe('commandCallback', () => {
    it('should call broadcast when no error is given', (done) => {
      const wCMgr = new WebClientMgr();
      const res = {};
      wCMgr.broadcast = (result) => {
        assert.strictEqual(res, result);
        done();
      };
      wCMgr.commandCallback(undefined, res);
    });
    it('should not call broadcast when an error is given', () => {
      const wCMgr = new WebClientMgr();
      const res = {};
      let callbackCalls = 0;
      wCMgr.broadcast = () => { callbackCalls++; };
      wCMgr.commandCallback("Error");
      assert.strictEqual(callbackCalls, 0);
    });
  });

  describe('handleClientMessage', () => {
    let wCMgr;
    let fakeClient;
    beforeEach(() => {
      wCMgr = new WebClientMgr();
      fakeClient = new EventEmitter();
    });
    it('should return true if message is valid JSON and well formatted', () => {
      const originalError = console.error;
      console.error = () => { };
      const testMsg = JSON.stringify({
        "type": "command",
        "content": {
          "command": "",
          "name": ""
        }
      });
      assert.strictEqual(wCMgr.handleClientMessage(testMsg), true);
      console.error = originalError;
    });
    it('should return false if message is invalid JSON', () => {
      const originalError = console.error;
      console.error = () => { };
      assert.strictEqual(wCMgr.handleClientMessage("{:sdgf"), false);
      console.error = originalError;
    });
    it('should emit command if msg type is "command" with correct command', (done) => {
      wCMgr.on('command', (cmd, cb, name) => {
        assert.strictEqual(cmd, "testCommand");
        assert.strictEqual(name, "testName");
        assert.strictEqual(typeof cb, "function");
        done();
      });
      wCMgr.addClient(fakeClient);
      const testMsg = JSON.stringify({
        "type": "command",
        "content": {
          "command": "testCommand",
          "name": "testName"
        }
      });
      wCMgr.handleClientMessage(testMsg);
    });
    it('should emit command if msg type is "server_command" with correct command and name', (done) => {
      wCMgr.on('server_command', (cmd, cb) => {
        assert.strictEqual(cmd, "testCommand");
        assert.strictEqual(typeof cb, "function");
        done();
      });
      wCMgr.addClient(fakeClient);
      const testMsg = JSON.stringify({
        "type": "server_command",
        "content": {
          "command": "testCommand",
          "name": ""
        }
      });
      wCMgr.handleClientMessage(testMsg);
    });
  });

  describe('broadcast', () => {
    let wCMgr;
    let fakeClient;
    beforeEach(() => {
      wCMgr = new WebClientMgr();
      fakeClient = new EventEmitter();
      fakeClient.send = () => { };
    });
    it('should return true if send is okay', () => {
      assert.strictEqual(wCMgr.broadcast({}), true);
    });
    it('should return false if send fails', () => {
      const originalError = console.error;
      console.error = () => { };
      fakeClient.send = undefined;
      wCMgr.addClient(fakeClient);
      assert.strictEqual(wCMgr.broadcast({}), false);
      console.error = originalError;
    });
    it('should send the clients the message', () => {
      const testMsg = {};
      fakeClient.send = data => assert.strictEqual(data, JSON.stringify(testMsg));
      wCMgr.addClient(fakeClient);
      wCMgr.broadcast(testMsg);
    });
  });
});