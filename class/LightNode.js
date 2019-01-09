const { EventEmitter } = require('events');
const http = require('http');

const UNCERTAIN_TIME = 10 * 1000;
const FAILURE_TIME = 20 * 1000;

module.exports = class LightNode extends EventEmitter {
  constructor(from, info) {
    super();
    this.update(from, info);
  }

  toJSON() {
    return {
      type: 'LightNode',
      info: this.info,
      data: this.data,
      state: this.state,
      lastUpdate: this.lastUpdate
    }
  }

  execute(command, cb) {
    http.get(`http://${this.info.address}/${command}`, res => {
      if (res.statusCode !== 200) {
        const error = new Error(`Request Failed.\n Status Code: ${res.statusCode}`);
        res.resume();
        cb(error.message, undefined);
      } else {
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          cb(undefined, {
            type: 'execute',
            content: {
              text: rawData,
              node: this.data.name
            }
          });
        });
      }
    }).on('error', console.error);
  }

  update(from, info) {
    this.data = from;
    this.info = info;

    this.emit('update', this);

    this.updateTimeouts();
  }

  set state(state) {
    if (this.state != state) {
      this._state = state;
      this.emit('update', this);
    }
  }

  get state() {
    return this._state;
  }

  updateTimeouts() {
    this.lastUpdate = Date.now();
    this.setOnline();
    this.clearTimeouts();
    this.updateUncertainTimeout = setTimeout(this.setUncertain.bind(this), UNCERTAIN_TIME);
    this.updateFailureTimeout = setTimeout(this.setOffline.bind(this), FAILURE_TIME);
  }

  setOnline() { this.state = 'online'; }

  setUncertain() { this.state = 'uncertain' }

  setOffline() { this.state = 'offline' }


  clearTimeouts() {
    this.updateUncertainTimeout = clearTimeout(this.updateUncertainTimeout);
    this.updateFailureTimeout = clearTimeout(this.updateFailureTimeout);
  }
}