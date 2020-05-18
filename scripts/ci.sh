#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

# do react testing before the clean
FULLCALENDAR_FORCE_REACT=1 yarn run build
FULLCALENDAR_FORCE_REACT=1 yarn run test:ci

yarn run clean
yarn run build
# yarn run lint # for v5!!!
yarn run test:ci

./scripts/packages-contrib-ci.js
./scripts/example-projects-build.js
