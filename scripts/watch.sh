#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

npm run tsc # startup will be fast the second time
npm run locales # watch task has ignoreInitial

npx concurrently \
  --kill-others-on-fail \
  -n 'tsc,locales,webpack,rollup' \
  'npm:tsc:watch' \
  'npm:locales:watch' \
  'npx webpack --config webpack.packages.js --watch' \
  'npx rollup -c rollup.bundles.locales.js --watch'

# rollup.bundles.locales needs core-locales to be done first
# core-locales needs to tsc to be done first
