class NodeGroup{
  constructor(name, mainElem, asideElem){
    this.name = name;
    this.mainElem = document.createElement('div');
    mainElem.appendChild(this.mainElem);
    this.asideElem = document.createElement('div');
    asideElem.appendChild(this.asideElem);

    this._nodes = {};
    
    this.render();
  }

  render(){
    this.mainElem.innerHTML = "";
    this.mainElem.classList.add('NodeGroup');
    this.titleElem = document.createElement('p');
    this.titleElem.innerText = this.name;
    this.mainElem.appendChild(this.titleElem);
    this.nodesElem = document.createElement('div');
    this.mainElem.appendChild(this.nodesElem);
  }

  update(data){
    for(const name in data.nodes){
      if(!(name in this._nodes)){
        switch(data.nodes[name].type){
          case 'NodeGroup':
            this._nodes[name] = new NodeGroup(name, this.nodesElem, this.asideElem);
            break;
          case 'LightNode':
            this._nodes[name] = new LightNode(name, this.nodesElem, this.asideElem);
            break;
        }
      }
      this._nodes[name].update(data.nodes[name]);
    }
  }
}