class LightNode {
  constructor(name, mainElem, asideElem) {

    this.STATE_COLORS = {
      'online': '#0f0',
      'uncertain': '#ff0',
      'offline': '#f00'
    }

    this.name = name;
    this.state;
    this.mainElem = document.createElement('div');
    mainElem.appendChild(this.mainElem);
    this.asideElem = document.createElement('div');
    asideElem.appendChild(this.asideElem);

    this.data = {
      dmx: {},
      systemInfo: {
        bat: {},
        rssi: {}
      }
    };

    this.info = {}

    this.render();
  }

  render() {
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
          <a href="javascript:command('update-pull', '${this.data.name}')">Upd pull</a>
          <a href="javascript:command('update', '${this.data.name}')">Update</a>
          <a href="javascript:command('dmx', '${this.data.name}')">DMX</a>
          <a href="javascript:command('test', '${this.data.name}')">LED-Test</a>
        </div>
      </div>
    `;
    this.asideElem.innerHTML = `
      <div class="LightNode ${this.state}">
        <h1 style="color: ${this.STATE_COLORS[this.state]}">${this.data.name}</h1>
        <p style="color: hsl(${this.data.systemInfo.bat.perc}, 100%, 50%);">battery_std</p>
        <p style="color: hsl(${this.data.systemInfo.rssi.perc}, 100%, 50%);">wifi</p>
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
      state: data.state
    });
    if (this.rawDataJSON != newJSON) {
      this.updated();
    }
    this.rawDataJSON = newJSON;
    this.rawData = data;
  }
}