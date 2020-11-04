#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

yarn run lint
yarn run clean
yarn run build
yarn run lintBuilt
yarn run archive
yarn run contrib:ci
yarn run test:ci
# FULLCALENDAR_FORCE_REACT=1 yarn run test:ci
yarn run ex:build

# # rebuild because building angular example project modifies
# # the @fullcalendar/angular dist files unfortunately
# yarn workspace @fullcalendar/angular run ci
