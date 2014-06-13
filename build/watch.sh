#!/usr/bin/env bash

cd "`dirname $0`/.."

grunt shell:assume-unchanged
grunt lumbar:watch