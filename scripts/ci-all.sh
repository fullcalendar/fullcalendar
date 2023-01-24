#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

echo
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!! Must be using Node 14 !!!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo

yarn run lint
yarn run clean
yarn run build
yarn run lintBuilt
yarn run archive
yarn run contrib:ci
yarn run example:build
yarn run test:ci
FULLCALENDAR_FORCE_REACT=1 yarn run test:ci
