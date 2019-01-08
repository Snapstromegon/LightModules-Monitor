let socket = new WebSocket("ws://localhost:8080/ws");
socket.addEventListener('close', _ => {
  setTimeout(_ => { socket = new WebSocket(`ws://${window.location.hostname}${window.location.port? ':' + window.location.port : ''}/ws`); }, 2000);
});

socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'NodeGroup':
      baseGroup.update(data);
      break;
    case 'execute':
    case 'server_execute':
      log(data.content.text, data.content.node);
      
      break;
    default:
      console.log(data);
      break;
  }

});

const baseGroup = new NodeGroup('Modules', document.querySelector('main'), document.querySelector('aside'));

function command(command, name) {
  socket.send(JSON.stringify({
    "type": 'command',
    "content": {
      "command": command,
      "name": name
    }
  }));
}

function serverCommand(command) {
  socket.send(JSON.stringify({
    "type": 'server_command',
    "content": {
      "command": command
    }
  }));
}

function log(msg, source){
  const wrapper = document.createElement('div');
  wrapper.classList.add('logEntry');
  const date = new Date();
  wrapper.innerHTML = `
    <div class="logDate"><p>${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</p></div>
    <div class="logSource"><p>${source}</p></div>
    <div class="logMsg"><p>${msg}</p></div>
  `;
  document.querySelector('footer').prepend(wrapper);
}