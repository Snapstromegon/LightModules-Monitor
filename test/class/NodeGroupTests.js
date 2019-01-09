const assert = require('assert');

const NodeGroup = require('../../class/NodeGroup.js');
const LightNode = require('../../class/LightNode.js');

describe('/class/NodeGroup', () => {

  describe('constructor', () => {
    it('should set name to the given name', () => {
      const uniqueName = "RANDOM NAME sdeg43tgd";
      assert.strictEqual(new NodeGroup(uniqueName).name, uniqueName);
    });
    it('should use "NodeGroup" as default name', () => {
      assert.strictEqual(new NodeGroup().name, 'NodeGroup');
    });
  });

  describe('isEmpty', () => {
    it('should return true when empty', () => {
      assert.strictEqual(new NodeGroup().isEmpty(), true);
    });
    it('should return false when not empty', () => {
      const nodeGroup = new NodeGroup();
      nodeGroup.findNodeForName("Test", true).clearTimeouts();
      assert.strictEqual(nodeGroup.isEmpty(), false);
    });
  });

  describe('toJSON', () => {
    const testFrom = { from: 'from' };
    const testInfo = { info: 'info' };
    let testGroup;
    before(() => {
      testGroup = new NodeGroup("test");
    });
    it('should return a JSON parseable object', () => {
      JSON.stringify(testGroup.toJSON());
    });
    it('should set type to "NodeGroup"', () => {
      assert.strictEqual(testGroup.toJSON().type, 'NodeGroup');
    });
    it('should correct a complete object', () => {
      const resObject = testGroup.toJSON();
      const expect = ['type', 'name', 'nodes'];
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
    let testNode;
    let testGroup;
    beforeEach(() => {
      testGroup = new NodeGroup("Test");
      testNode = testGroup.findNodeForName("TestNode", true);
      testNode.clearTimeouts();
    });

    it('should call nodes execute with command, callback and enpty name',() => {
      const command = "Command";
      const callback = () => {};
      let timesExecuted = 0;
      testGroup._nodes.TestNode = {
        execute(cmd, cb){
          assert.strictEqual(cmd, command);
          assert.strictEqual(cb, callback);
          timesExecuted++;
        }
      };
      testGroup.execute(command, callback);
      testGroup.execute(command, callback, "TestNode");
      testGroup.execute(command, callback, "XTestNode");
      assert.strictEqual(timesExecuted, 2);
    });
  });

  describe('hasNodeForPath', () => {
    let testGroup;
    beforeEach(() => {
      testGroup = new NodeGroup("Test");
    });

    it('should return false if node doesn\'t exists', () => {
      assert.strictEqual(testGroup.hasNodeForPath(["TestNode"]), false);
    });

    it('should return true if node exists', () => {
      const testNode = testGroup.findNodeForName("TestNode", true);
      testNode.clearTimeouts();
      assert.strictEqual(testGroup.hasNodeForPath(["TestNode"]), true);
    });

    it('should return true if deep node exists', () => {
      const testNode = testGroup.findNodeForName("Group-TestNode", true);
      testNode.clearTimeouts();
      assert.strictEqual(testGroup.hasNodeForPath(["Group", "TestNode"]), true);
    });
  });

  describe('findNodeForPath', () => {
    let testGroup;
    beforeEach(() => {
      testGroup = new NodeGroup("Test");
    });
    it('should not find not existing nodes', () => {
      assert.strictEqual(testGroup.findNodeForPath(["notExisting"]), undefined);
    });
    it('should return itself if path is empty', () => {
      assert.strictEqual(testGroup.findNodeForPath([]), testGroup);
    });
    it('should create missing if wanted', () => {
      const testNode = testGroup.findNodeForPath(["create"], true);
      testNode.clearTimeouts();
      assert.notEqual(testNode, undefined);
      assert.strictEqual(testGroup.hasNodeForPath(["create"]), true);
    });
    it('should not create duplicates', () => {
      const testNode = testGroup.findNodeForPath(["create"], true);
      testNode.clearTimeouts();
      const testNodeB = testGroup.findNodeForPath(["create"], true);
      testNodeB.clearTimeouts();
      assert.strictEqual(testNode, testNodeB);
    });
    it('should find deep nodes', () => {
      const testNode = testGroup.findNodeForPath(["create", "this"], true);
      testNode.clearTimeouts();
      assert.notEqual(testNode, undefined);
      assert.strictEqual(testGroup._nodes.create._nodes.this, testNode);
      assert.strictEqual(testGroup.findNodeForPath(["create", "this"]), testNode);
    });
    it('should bubble update events', async () => {
      const updateFlat = new Promise(resolve => {
        const testNode = testGroup.findNodeForPath(["create"], true);
        testNode.clearTimeouts();
        testGroup.on('update', resolve);
        testNode.update();
        testNode.clearTimeouts();
      });
      const updateDeep = new Promise(resolve => {
        const testNode = testGroup.findNodeForPath(["this", "create"], true);
        testNode.clearTimeouts();
        testGroup.on('update', resolve);
        testNode.update();
        testNode.clearTimeouts();
      });
      return Promise.all([updateDeep, updateFlat]);
    });
  });

  describe('findNodeForName', () => {
    let testGroup;
    beforeEach(() => {
      testGroup = new NodeGroup("Test");
    });
    it('schould return itself if name is empty', () => {
      assert.strictEqual(testGroup.findNodeForName(''), testGroup);
      assert.strictEqual(testGroup.findNodeForName(false), testGroup);
      assert.strictEqual(testGroup.findNodeForName(), testGroup);
      assert.strictEqual(testGroup.findNodeForName(null), testGroup);
      assert.strictEqual(testGroup.findNodeForName(undefined), testGroup);
    });
    it('call findNodeForPath with the parsed name', () => {
      const testName = "Test-Name";
      const scndParam = Symbol();
      testGroup.findNodeForPath = (path, createMissing) => {
        assert.deepEqual(path, testName.split('-'));
        assert.deepEqual(createMissing, scndParam);
      };
    });
  });
  
});