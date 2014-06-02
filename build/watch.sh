#!/usr/bin/env bash

cd "`dirname $0`/.."

npm run-script assume-unchanged
grunt lumbar:watch