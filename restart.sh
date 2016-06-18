#!/bin/bash

name=japaname
port=3001

echo $name $port
forever stop $name
PORT=$port forever start -a --uid "$name" bin/www 
