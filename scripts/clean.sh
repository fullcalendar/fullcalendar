#!/usr/bin/env bash

set -e # always immediately exit upon error
cd "`dirname $0`/.." # always start in project root


# make sure this list mirrors what's in .gitignore

rm -rf archives

rm -rf packages/*/tsconfig.tsbuildinfo
rm -rf packages/*/tsc
rm -rf packages/*/dist
rm -rf packages/*/locales
rm -rf packages/*/locales-all.js

rm -rf packages-premium/*/tsconfig.tsbuildinfo
rm -rf packages-premium/*/tsc
rm -rf packages-premium/*/dist
rm -rf packages/*/locales
rm -rf packages/*/locales-all.js
