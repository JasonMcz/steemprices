#!/bin/bash
http-server -p 80 -c-1 ./app &

running=1

finish()
{
    running=0
}

trap finish SIGINT

while (( running )); do
    // Execute the command here that starts your server.
    echo "Restarting server on crash.."
    babel-node get_data.js
    babel-node get_market.js
    sleep 30
done
