const { EventEmitter } = require('events');
module.exports = class WebClientMgr extends EventEmitter{
  constructor() {
    super();
    this.clients = new Set();
  }

  addClient(client) {
    this.clients.add(client);
    client.on('close', _ => this.removeClient(client));
    client.on('end', _ => this.removeClient(client));
    client.on('error', _ => this.removeClient(client));
    client.on('message', msg => this.handleClientMessage(msg));
    if(this.lastData){
      client.send(this.lastData);
    }
  }

  removeClient(client) {
    this.clients.delete(client);
  }

  handleClientMessage(msg){
    try{
      const parsed = JSON.parse(msg);
      if(parsed.type == 'command'){
        this.emit('command', parsed.content.command, (err, res) => {
          if(!err) {
            this.broadcast(res);
          }
        }, parsed.content.name);
      }
      if(parsed.type == 'server_command'){
        this.emit('server_command', parsed.content.command, res => this.broadcast(res));
      }
    } catch(e){
      console.log('Invalid Websocket Message', e);
    }
  }

  broadcast(msg) {
    try {
      const sMsg = JSON.stringify(msg);
      this.lastData = sMsg;
      for (const client of this.clients) {
        client.send(sMsg);
      }
    } catch (e) {
      console.error(e, msg);
    }
  }
}