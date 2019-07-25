#!/usr/bin/env bash

set -e # always immediately exit upon error

npm run ci
npm run archive

npx monorepo version
# ^after it completes, will call postversion hook, which calls `monorepo publish`
