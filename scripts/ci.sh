#!/usr/bin/env bash

set -e # always immediately exit upon error

npm run clean
npm run build
npm run test:single
npm run lint

# TODO: make --no-parallel the default for monorepo-tool

# all contrib projects build/test/lint/etc?
npx monorepo run ci --filter-pkgs 'packages-contrib/*' --no-parallel

# all example projects can build?
npx monorepo run build --filter-pkgs 'example-projects/*' --no-parallel
