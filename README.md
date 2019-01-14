[![CircleCI](https://circleci.com/gh/Snapstromegon/LightModules-Monitor.svg?style=svg)](https://circleci.com/gh/Snapstromegon/LightModules-Monitor)

[![Coverage Status](https://coveralls.io/repos/github/Snapstromegon/LightModules-Monitor/badge.svg?branch=master)](https://coveralls.io/github/Snapstromegon/LightModules-Monitor?branch=master)

[![Maintainability](https://api.codeclimate.com/v1/badges/e9331b3c44af8849ea8c/maintainability)](https://codeclimate.com/github/Snapstromegon/LightModules-Monitor/maintainability)

# LightModules-Monitor

## Install

Run this commands:

- `git clone https://github.com/Snapstromegon/LightModules-Monitor.git`
- `cd LightModules-Monitor`
- `npm i`

## Configurate

Open config.json and set

- express.port for the frontend and websocket port
- udp.port for the port the server listens for Modules

## Run

- ```npm start```
or
- ```node .```

## Automatic launch at system start (Raspberry Pi based on Stretch)

Copy script once:
- ```sudo cp system/nodeserver.service  /etc/systemd/system```
Register service once:
- ```sudo systemctl enable nodeserver.service```

Stop service manually :
- ```sudo systemctl stop nodeserver.service```
Start service manually :
- ```sudo systemctl start nodeserver.service```
Show status of service:
- ```sudo systemctl status nodeserver.service```

