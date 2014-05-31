#!/usr/bin/env bash

"`dirname $0`/../node_modules/lumbar/bin/lumbar" watch --sourceMap "$@" "$(dirname $(dirname $0))/dist"