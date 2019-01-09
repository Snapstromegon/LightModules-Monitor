const assert = require('assert');
const nock = require('nock');

const LightNode = require('../../class/LightNode');

describe('/class/LightNode', () => {
  let testNode;
  afterEach(() => {
    testNode.clearTimeouts();
  });

  describe('constructor', () => {
    it('Check that info and from gets set"', () => {
      const testFrom = { from: 'from' };
      const testInfo = { info: 'info' };
      testNode = new LightNode(testFrom, testInfo);
      assert.equal(testNode.data, testFrom);
      assert.equal(testNode.info, testInfo);
    });
  });

  describe('toJSON', () => {
    const testFrom = { from: 'from' };
    const testInfo = { info: 'info' };
    before(() => {
      testNode = new LightNode(testFrom, testInfo);
    });
    it('should return a JSON parseable object', () => {
      JSON.stringify(testNode.toJSON());
    });
    it('should set type to "LightNode"', () => {
      assert.strictEqual(testNode.toJSON().type, 'LightNode');
    });
    it('should correct a complete object', () => {
      const resObject = testNode.toJSON();
      const expect = ['type', 'info', 'data', 'state', 'lastUpdate'];
      for (const attr in resObject) {
        if (expect.indexOf(attr) == -1) {
          throw attr + ' to much!';
        } else {
          expect.splice(expect.indexOf(attr), 1);
        }
      }
      if (expect.length) {
        throw JSON.stringify(expect) + ' to much';
      }
    });
  });

  describe('execute', () => {
    before(() => {
      testNode = new LightNode({name: 'testname'}, {address: '127.0.0.1'});
    });
    it('should request info.address/{command} and respond with answer', async () => {
      const command = 'TestCommand3w94g5rtv8huzo7';
      nock('http://127.0.0.1').get('/404').reply(404);
      nock('http://127.0.0.1').get('/'+command).reply(200, command);
      const failPromise = await new Promise(res => {
        testNode.execute('404', (err, appRes) => {
          assert.strictEqual(appRes, undefined);
          assert.notEqual(err, undefined);
          res();
        })
      });
      const successPromise = await new Promise(res => {
        testNode.execute(command, (err, appRes) => {
          assert.strictEqual(err, undefined);
          assert.strictEqual(appRes.type, 'execute');
          assert.strictEqual(appRes.content.text, command);
          assert.strictEqual(appRes.content.node, 'testname');
          res();
        })
      });
      return Promise.all([ successPromise]);
    });
  });

  describe('update', () => {
    it('Check that info and from gets set"', async () => {
      const testFrom = { from: 'from' };
      const testInfo = { info: 'info' };
      testNode = new LightNode(testFrom, testInfo);
      assert.equal(testNode.data, testFrom);
      assert.equal(testNode.info, testInfo);
      testNode.lastUpdate = undefined;
      const updatePromise = new Promise(res => {
        testNode.on('update', _ => {
          res();
        });
      });
      const newTestFrom = { from: 'newfrom' };
      const newTestInfo = { info: 'newinfo' };
      testNode.update(newTestFrom, newTestInfo);
      assert.equal(testNode.data, newTestFrom);
      assert.equal(testNode.info, newTestInfo);
      assert.notEqual(testNode.lastUpdate, undefined);
      return updatePromise;
    });
  });

  describe('updateTimeouts', () => {
    it('should update all timeouts', () => {
      testNode = new LightNode();
      testNode.clearTimeouts();
      testNode.lastUpdate = undefined;
      testNode.state = undefined;
      testNode.updateTimeouts();
      assert.notEqual(testNode.updateUncertainTimeout, undefined);
      assert.notEqual(testNode.updateFailureTimeout, undefined);
      assert.notEqual(testNode.lastUpdate, undefined);
      assert.notEqual(testNode.state, undefined);
    });
  });

  describe('setOnline', () => {
    testNode = new LightNode();
    testNode.clearTimeouts();
    testNode.setOnline();
    assert.strictEqual(testNode.state, 'online');
  });

  describe('setUncertain', () => {
    testNode = new LightNode();
    testNode.clearTimeouts();
    testNode.setUncertain();
    assert.strictEqual(testNode.state, 'uncertain');
  });

  describe('setOffline', () => {
    testNode = new LightNode();
    testNode.clearTimeouts();
    testNode.setOffline();
    assert.strictEqual(testNode.state, 'offline');
  });

  describe('clearTimeouts', () => {
    it('should clear all timeouts', () => {
      testNode = new LightNode();
      testNode.clearTimeouts();
      assert.strictEqual(testNode.updateUncertainTimeout, undefined);
      assert.strictEqual(testNode.updateFailureTimeout, undefined);
    });
  });
});