import LightNode from "./LightNode.js";
import BaseNode from "./BaseNode.js";

export default class NodeGroup extends BaseNode {
  constructor(name, mainElem, asideElem) {
    super(name, mainElem, asideElem);

    this._nodes = {};

    this.render();
  }

  update(data) {
    const knownNodes = new Set(Object.keys(this._nodes));
    for (const name in data.nodes) {
      if (!(name in this._nodes)) {
        this.createNode(data.nodes[name], name);
      }
      knownNodes.delete(name);
      this._nodes[name].update(data.nodes[name]);
    }
    for (const toMuch of knownNodes) {
      this._nodes[toMuch].delete();
      delete this._nodes[toMuch];
    }
  }

  createNode(node, name) {
    switch (node.type) {
      case "NodeGroup":
        this._nodes[name] = new NodeGroup(name, this.nodesElem, this.asideElem);
        break;
      case "LightNode":
        this._nodes[name] = new LightNode(name, this.nodesElem, this.asideElem);
        break;
    }
  }
}
