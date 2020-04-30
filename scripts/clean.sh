#!/usr/bin/env bash

# make sure this list mirrors what's in .gitignore

rm -rf tmp archives

rm -rf packages/*/*.js
rm -rf packages/*/*.css
rm -rf packages/*/*.map
rm -rf packages/*/*.d.ts
rm -rf packages/core/locales
rm -rf packages/bundle/locales

rm -rf packages-premium/*/*.js
rm -rf packages-premium/*/*.css
rm -rf packages-premium/*/*.map
rm -rf packages-premium/*/*.d.ts
rm -rf packages-premium/bundle/locales
