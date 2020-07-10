#!/bin/bash

until cd /usr/src/app/cert
do
	echo "Waiting for volumes"
done
cd /usr/src/app
node server.js
