const { EventEmitter } = require('events');
const http = require('http');

const UNCERTAIN_TIME = 10 * 1000;
const FAILURE_TIME = 20 * 1000;

module.exports = class LightNode extends EventEmitter {
  constructor(info, from) {
    super();

    this.info = info;

    this.update(from);
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
        console.error(error.message);
        res.resume();
        cb(error.message);
      }else { 
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          cb({
            type:'execute',
            content:{
              text: rawData,
              node: this.data.name
            }
          });
        });
      }
    }).on('error', (e) => {});;
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
    this.state = 'online';
    if (this.updateUncertainTimeout) {
      clearTimeout(this.updateUncertainTimeout);
    }
    this.updateUncertainTimeout = setTimeout(_ => this.state = 'uncertain', UNCERTAIN_TIME);
    if (this.updateFailureTimeout) {
      clearTimeout(this.updateFailureTimeout);
    }
    this.updateFailureTimeout = setTimeout(_ => this.state = 'offline', FAILURE_TIME);
  }
}