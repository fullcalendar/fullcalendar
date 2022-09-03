#!/usr/bin/env bash

set -e # always immediately exit upon error
cd "`dirname $0`/.." # always start in project root


# make sure this list mirrors what's in .gitignore

rm -rf archives
rm -rf tmp

rm -rf packages/*/tsconfig.tsbuildinfo
rm -rf packages/*/tsc
rm -rf packages/*/locales
rm -rf packages/*/*.js
rm -rf packages/*/*.css
rm -rf packages/*/*.map
rm -rf packages/*/*.d.ts
rm -rf packages/core/src/locales-all.ts

rm -rf packages-premium/*/tsconfig.tsbuildinfo
rm -rf packages-premium/*/tsc
rm -rf packages-premium/*/locales
rm -rf packages-premium/*/*.js
rm -rf packages-premium/*/*.css
rm -rf packages-premium/*/*.map
rm -rf packages-premium/*/*.d.ts
