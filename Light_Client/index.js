const express = require('express');
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const serverConfig = require('../config.json');

const EXAMPLE_MESSAGE = {
  name: name,
  systemInfo: {
    FWver: 'v3.12',
    state: 'BOOT',
    bat: {
      volt: 0.0,
      perc: 0
    },
    rssi: {
      db: 0,
      perc: 0
    }
  },
  dmx: {
    set: 11,
    mod: 0,
    uni: 2,
    out: 'off',
    color: {
      r: 0,
      g: 0,
      b: 0
    }
  },
  msg: 'ALIVE'
};

function loop(name) {
  const message = JSON.stringify(EXAMPLE_MESSAGE);
  // console.log(`Sending: ${message}`);
  client.send(message, serverConfig.udp.port, '192.168.178.123', err => {
    if (err) {
      client.close();
    }
  });
}

function loop1() {
  ['Ucl-No7-Wheel', 'Ucl-No7-Stick', 'Ucl-No7-Body', 'Ucl-No8-Wheel'].map(
    name => loop(name)
  );
}

setInterval(loop1, 1000);

if (process.argv.indexOf('--commandPort') !== -1) {
  const app = express();
  app.get('/:command', (req, res) => {
    console.log(`Executing: ${req.params.command}`);
    res.send('Executed Command: ' + req.params.command);
  });
  app.listen(process.argv[process.argv.indexOf('--commandPort') + 1]);
}
