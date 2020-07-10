#!/bin/bash
COMMIT=$(git rev-parse HEAD)
echo "Commit $COMMIT"
sed -i -e "s/##commit##/$COMMIT/g" ./public/index.html