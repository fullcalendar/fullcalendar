#!/usr/bin/env bash

set -e # always immediately exit upon error
cd "`dirname $0`/.." # always start in project root


# make sure this list mirrors what's in .gitignore

rm -rf archives

rm -rf packages/*/tsconfig.tsbuildinfo
rm -rf packages/*/dist
rm -rf packages/*/tsc
rm -rf packages/*/rollup
rm -rf packages/core/locales
rm -rf packages/core/locales-all.js

rm -rf packages-premium/*/tsconfig.tsbuildinfo
rm -rf packages-premium/*/dist
rm -rf packages-premium/*/tsc
rm -rf packages-premium/*/rollup
