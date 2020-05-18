#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

yarn run clean
yarn run build
# yarn run lint # for v5!!!

FULLCALENDAR_FORCE_REACT=1 yarn run test:ci
yarn run test:ci

./scripts/packages-contrib-ci.js
./scripts/example-projects-build.js
