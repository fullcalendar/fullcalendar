#!/usr/bin/env bash

set -e # always immediately exit upon error

# TODO: revisit

npm run build
npx gulp archive
npm run lint # knowing about linting before tests is faster
npm run test:single
