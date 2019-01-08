const { EventEmitter } = require('events');
const LightNode = require('./LightNode');

module.exports = class NodeGroup extends EventEmitter {
  constructor(name = 'NodeGroup') {
    super();
    this.name = name;
    this._nodes = {};
  }

  toJSON() {
    return {
      type: 'NodeGroup',
      name: this.name,
      nodes: this._nodes
    }
  }

  execute(command, cb, name) {
    if (name) {
      console.log(command,name);
      
      const node = this.findNodeForName(name);
      if(node){
        node.execute(command, cb);
      }
    } else {
      for (const name in this._nodes) {
        this._nodes[name].execute(command, cb);
      }
    }
  }

  hasNodeForPath(path) {
    const firstPart = path[0];
    if (firstPart in this._nodes) {
      if (path) {
        return this._nodes[firstPart].hasNodeForPath(path.slice(1));
      } else {
        return true;
      }
    }
    return false;
  }

  findNodeForPath(path, createMissing = false) {
    if(path.length == 0){ return this; }
    const firstPart = path[0];
    if (firstPart in this._nodes) {
      if (this._nodes[firstPart] instanceof NodeGroup) {
        return this._nodes[firstPart].findNodeForPath(path.slice(1), createMissing);
      } else {
        return this._nodes[firstPart];
      }
    }
    if (createMissing) {
      if (path.length > 1) {
        const newNode = new NodeGroup(firstPart);
        newNode.on('update', (...args) => this.emit('update', ...args));
        this._nodes[firstPart] = newNode;
        return this._nodes[firstPart].findNodeForPath(path.slice(1), createMissing);
      } else {
        const newNode = new LightNode();
        this._nodes[firstPart] = newNode;
        newNode.on('update', (...args) => this.emit('update', ...args));
        return this._nodes[firstPart];
      }
    }
  }

  findNodeForName(name, createMissing = false) {
    if (name === '') {
      return this;
    }
    return this.findNodeForPath(name.split('-'), createMissing);
  }
}