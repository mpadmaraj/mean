#!/bin/bash
node-gyp configure build
#node-gyp rebuild
bower install --allow-root
node ./server/server.js
