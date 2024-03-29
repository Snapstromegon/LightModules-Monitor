import BaseNode from "./BaseNode.js";

export default class LightNode extends BaseNode {
  constructor(name, mainElem, asideElem) {
    super(name, mainElem, asideElem);
    console.log("Hi")

    this.STATE_COLORS = {
      undefined: "#fff",
      online: "#0f0",
      uncertain: "#ff0",
      offline: "#f00",
    };

    this.state;

    this.data = {
      dmx: {},
      systemInfo: {
        bat: {},
        rssi: {},
      },
    };

    this.info = {};

    this.render();
    console.log("Hallo Welt", this);
  }

  render() {
    this.renderMain();
    this.renderAside();
  }

  renderMain() {
    console.log(this, this.state);
    this.mainElem.innerHTML = `
      <div class="LightNode">
        <h1 style="color: ${this.STATE_COLORS[this.state]}">${this.name}</h1>
        <div class="infos">
          <p>NetState:  ${this.state}</p>
          <p>Module:  ${this.data.dmx.set}-${this.data.dmx.mod}</p>
          <p>${this.info.address}</p>
          <p>${this.data.systemInfo.FWver}</p>
          <p>Battery:  ${this.data.systemInfo.bat.perc}</p>
          <p>WiFi:  ${this.data.systemInfo.rssi.perc}</p>
          <p>${this.data.msg}</p>
        </div>
        <div class="actions">
          <a href="javascript:command('update-pull?file=http://${
            window.location.hostname
          }/ucls/update/ESP12E_E131_DMX.bin', '${this.data.name}')">Upd pull</a>
          <a href="javascript:command('update', '${this.data.name}')">Update</a>
          <a href="http://${this.info.address}/dmx" target="_blank">DMX</a>
          <a href="javascript:command('test', '${this.data.name}')">LED-Test</a>
        </div>
      </div>
    `;
  }

  renderAside() {
    this.asideElem.innerHTML = `
      <div class="LightNode ${this.state}">
        <h1 style="color: ${this.STATE_COLORS[this.state]}">
          ${this.data.name}
        </h1>
        <p style="color: hsl(${this.data.systemInfo.bat.perc}, 100%, 50%);">
          battery_std
        </p>
        <p style="color: hsl(${this.data.systemInfo.rssi.perc}, 100%, 50%);">
          wifi
        </p>
      </div>
    `;
  }

  updated() {
    this.render();
  }

  update(data) {
    this.data = data.data;
    this.info = data.info;
    this.lastUpdate = data.lastUpdate;
    this.state = data.state;

    const newJSON = JSON.stringify({
      data: data.data,
      info: data.info,
      state: data.state,
    });
    if (this.rawDataJSON != newJSON) {
      this.updated();
    }
    this.rawDataJSON = newJSON;
    this.rawData = data;
  }
}
