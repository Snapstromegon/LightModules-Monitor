const dgram = require('dgram');
const express = require('express');
const expressWs = require('express-ws');
const path = require('path');

const config = require('./config.json');

const NodeMgr = require('./class/NodeMgr');
const nodeMgr = new NodeMgr();

const WebClientMgr = require('./class/WebClientMgr');
const webClientMgr = new WebClientMgr();
nodeMgr.on('update', msg => webClientMgr.broadcast(nodeMgr));
webClientMgr.on('command', (...args) => {
  nodeMgr.execute(...args)
});

webClientMgr.on('server_command', (cmd, cb) => {
  switch(cmd){
    case 'stop':
      cb({
        'type': 'server_execute',
        'content': {
          'text': 'Stopping Server',
          'name': 'Server'
        }
      });
      process.exit();
      break;
  }
});

const app = express();
expressWs(app);

app.use(express.static(path.join(__dirname, 'static')));
app.ws('/ws', (ws, req) => {
  webClientMgr.addClient(ws);
});

const expressServer = app.listen(config.express.port, () => {
  const address = expressServer.address();
  console.log(`Express listening on port ${address.port}`);
});

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  try{
    nodeMgr.handleData(JSON.parse(msg), rinfo);
  } catch(e){
    console.error('Invalid Client Message!', e);
  }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening on port ${address.port}`);
});

server.bind(config.udp.port);