export default class BaseNode {
  constructor(name, mainElem, asideElem) {
    this.name = name;
    this.mainElem = document.createElement('div');
    mainElem.appendChild(this.mainElem);
    this.asideElem = document.createElement('div');
    asideElem.appendChild(this.asideElem);
  }

  delete() {
    this.mainElem.parentNode.removeChild(this.mainElem);
    this.asideElem.parentNode.removeChild(this.asideElem);
  }

  render() {
    this.mainElem.innerHTML = '';
    this.mainElem.classList.add('NodeGroup');
    this.titleElem = document.createElement('p');
    this.titleElem.innerText = this.name;
    this.mainElem.appendChild(this.titleElem);
    this.nodesElem = document.createElement('div');
    this.mainElem.appendChild(this.nodesElem);
  }
}