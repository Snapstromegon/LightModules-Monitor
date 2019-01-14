const { EventEmitter } = require('events');
const LightNode = require('./LightNode');

module.exports = class NodeGroup extends EventEmitter {
  constructor(name = 'NodeGroup') {
    super();
    this.name = name;
    this._nodes = {};
  }

  isEmpty() {
    return Object.keys(this._nodes).length === 0;
  }

  clearNode(nodeName = '') {
    let cleared = 0;
    const node = this._nodes[nodeName];
    if (node instanceof NodeGroup) {
      cleared += node.clear(false);
    } else {
      node.clearTimeouts();
      cleared++;
    }
    delete this._nodes[nodeName];
    return cleared;
  }

  clear(triggerUpdate = true) {
    return this.mapAllNodes(
      nodeName => this.clearNode(nodeName),
      triggerUpdate
    );
  }

  pruneNode(nodeName = '') {
    let pruned = 0;
    const node = this._nodes[nodeName];
    if (node instanceof NodeGroup) {
      pruned += node.prune(false);
    } else if (node.state != 'online') {
      node.clearTimeouts();
      pruned++;
    }
    if (node.isEmpty() || node.state != 'online') {
      delete this._nodes[nodeName];
    }
    return pruned;
  }

  prune(triggerUpdate = true) {
    return this.mapAllNodes(
      nodeName => this.pruneNode(nodeName),
      triggerUpdate
    );
  }

  mapAllNodes(func, triggerUpdate) {
    let changed = 0;
    for (const nodeName in this._nodes) {
      changed += func(nodeName);
    }
    if (triggerUpdate && changed) {
      this.emit('update');
    }
    return changed;
  }

  toJSON() {
    return {
      type: 'NodeGroup',
      name: this.name,
      nodes: this._nodes
    };
  }

  execute(command, cb, name) {
    let nodesToExecute = {};
    if (name) {
      console.log(command, name);

      const node = this.findNodeForName(name);
      nodesToExecute['__DEFAULT__'] = node;
    } else {
      nodesToExecute = this._nodes;
    }
    for (const name in nodesToExecute) {
      this._nodes[name].execute(command, cb);
    }
  }

  hasNodeForPath(path) {
    const firstPart = path[0];
    if (firstPart in this._nodes) {
      if (path.length > 1) {
        return this._nodes[firstPart].hasNodeForPath(path.slice(1));
      } else {
        return true;
      }
    }
    return false;
  }

  createMissingNode(path) {
    const firstPart = path[0];
    if (path.length > 1) {
      const newNode = new NodeGroup(firstPart);
      newNode.on('update', (...args) => this.emit('update', ...args));
      this._nodes[firstPart] = newNode;
      return this._nodes[firstPart].findNodeForPath(path.slice(1), true);
    } else {
      const newNode = new LightNode();
      this._nodes[firstPart] = newNode;
      newNode.on('update', (...args) => this.emit('update', ...args));
      return this._nodes[firstPart];
    }
  }

  findChildNode(path, createMissing) {
    const firstPart = path[0];
    if (this._nodes[firstPart] instanceof NodeGroup) {
      return this._nodes[firstPart].findNodeForPath(
        path.slice(1),
        createMissing
      );
    } else {
      return this._nodes[firstPart];
    }
  }

  findNodeForPath(path, createMissing = false) {
    if (path.length == 0) {
      return this;
    }
    if (path[0] in this._nodes) {
      return this.findChildNode(path, createMissing);
    }
    if (createMissing) {
      return this.createMissingNode(path);
    }
  }

  findNodeForName(name, createMissing = false) {
    if (!name) {
      return this;
    }
    return this.findNodeForPath(name.split('-'), createMissing);
  }
};
