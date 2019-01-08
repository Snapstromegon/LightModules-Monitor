const assert = require('assert');

const NodeMgr = require('../../class/NodeMgr');

describe('/class/NodeMgr', () => {

  describe('constructor', () => {
    it('should set name to "Node Manager"', () => {
      assert.strictEqual(new NodeMgr().name, 'Node Manager');
    });
  });

  describe('handleData', ()=>{
    let nodeMgr;
    let testNode;
    beforeEach(() => {
      nodeMgr = new NodeMgr();
      testNode = nodeMgr.findNodeForName('HandleDataTest', true);
    });
    afterEach(() => {
      testNode.clearTimeouts();
    });
    it('should update correct Node', () => {
      const testData = { name: 'HandleDataTest' };
      const testInfo = {};
      nodeMgr.handleData(testData, testInfo);
      assert.strictEqual(testNode.data, testData);
      assert.strictEqual(testNode.info, testInfo);
    });
  });
});