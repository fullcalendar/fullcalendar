#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

yarn run lint

# do react testing before the clean
FULLCALENDAR_FORCE_REACT=1 yarn run build
FULLCALENDAR_FORCE_REACT=1 yarn run test:ci

yarn run clean
yarn run build
yarn run lintBuilt
yarn run archive
yarn run test:ci

./scripts/packages-contrib-ci.sh
# ./scripts/example-projects-build.js # TODO: renable!!!

# rebuild because building angular example project modifies
# the @fullcalendar/angular dist files unfortunately
yarn workspace @fullcalendar/angular run ci
