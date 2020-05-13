#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

# necessary for watch tasks
npm run tsc # startup will be fast the second time
npm run locales # watch task has ignoreInitial
npm run sass # watch task won't recompile if no changes

# do NOT watch rollup:packages
# we access the raw tsc-generated files instead

npx concurrently \
  --kill-others-on-fail \
  -n 'tsc,locales,sass,rollup' \
  'npm:tsc:watch' \
  'npm:locales:watch' \
  'npm:sass:watch' \
  'npm:rollup:bundles:watch'
