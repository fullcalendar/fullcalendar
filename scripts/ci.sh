#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

yarn run clean

FULLCALENDAR_FORCE_REACT=1 yarn run build
FULLCALENDAR_FORCE_REACT=1 yarn run test:ci

yarn run build
yarn run test:ci

# yarn run lint # for v5!!!

./scripts/packages-contrib-ci.js
./scripts/example-projects-build.js
