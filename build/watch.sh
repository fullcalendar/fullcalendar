#!/usr/bin/env bash

cd "`dirname $0`/.."

./node_modules/lumbar/bin/lumbar watch --sourceMap "$@" build/lumbar.json dist