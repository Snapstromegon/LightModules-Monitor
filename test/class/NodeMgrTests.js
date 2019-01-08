const assert = require('assert');

const NodeMgr = require('../../class/NodeMgr');

suite('NodeMgr', function () {
  test('Name is "Node Manager"', function () {
    assert.strictEqual(new NodeMgr().name, 'Node Manager');
  });
});