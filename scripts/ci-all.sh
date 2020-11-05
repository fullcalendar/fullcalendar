#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

yarn run lint
yarn run clean
yarn run build
yarn run lintBuilt
yarn run archive
yarn run contrib:run all ci
yarn run example:run all build
yarn run test:ci
FULLCALENDAR_FORCE_REACT=1 yarn run test:ci
