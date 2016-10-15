#!/bin/bash
http-server -p 80 -c-1 ./app &
while :
do
  babel-node get_data.js
  babel-node get_market.js
  sleep 15
done
