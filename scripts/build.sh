#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

npm run tsc
npm run locales
npx rollup -c rollup.bundles.locales.js
FORCE_EXTERNAL_CSS=1 npx webpack --config webpack.packages.js
npm run rollup:packages # needs tsc
npm run rollup:bundles # needs tsc
# npx webpack --config webpack.tests.js
