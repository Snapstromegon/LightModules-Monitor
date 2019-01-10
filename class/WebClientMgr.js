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

  commandCallback(err, res){
    if(!err) {
      this.broadcast(res);
    }
  }

  handleClientMessage(msg){
    try{
      const parsed = JSON.parse(msg);
      switch(parsed.type){
        case 'command':
          this.emit('command', parsed.content.command, this.commandCallback.bind(this), parsed.content.name);
          break;
        case 'server_command':
          this.emit('server_command', parsed.content.command, this.commandCallback.bind(this));
          break;
      }
      return true;
    } catch(e){
      console.error('Invalid Websocket Message', e);
      return false;
    }
  }

  broadcast(msg) {
    try {
      const sMsg = JSON.stringify(msg);
      this.lastData = sMsg;
      for (const client of this.clients) {
        client.send(sMsg);
      }
      return true;
    } catch (e) {
      console.error(e, msg);
      return false;
    }
  }
}