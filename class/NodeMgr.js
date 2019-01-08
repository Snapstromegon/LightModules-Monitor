const LightNode = require('./LightNode.js');
const NodeGroup = require('./NodeGroup.js');

module.exports = class NodeMgr extends NodeGroup {

  constructor() {
    super('Node Manager');
  }

  handleData(data, info) {
    let node = this.findNodeForName(data.name, true);
    node.update(data, info);
  }
}