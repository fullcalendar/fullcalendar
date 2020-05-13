#!/usr/bin/env bash

set -e # immediately exit upon error
cd "`dirname $0`/.." # start in project root

npm run tsc
npm run locales
npm run rollup:packages
npm run sass # will write to dest dirs created by rollup:packages
npm run rollup:bundles
