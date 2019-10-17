#!/usr/bin/env bash

set -e # always immediately exit upon error

npm run clean
npm run build
npm run test:single
npm run lint

EXCLUDE_PKGS=''

# all angular-related packages have e2e tests that require a complicated CI setup.
# (see .travis.yml in each project). Skip altogether for now.
if [[ "$CI" == "true" ]]
then
  echo "Skipping angular because we're in a CI environment"
  EXCLUDE_PKGS='**/angular'
fi

# all contrib projects build/test/lint/etc?
npx monorepo run ci --filter-pkgs 'packages-contrib/*' --exclude-pkgs "$EXCLUDE_PKGS" --no-parallel

# all example projects can build?
npx monorepo run build --filter-pkgs 'example-projects/*' --exclude-pkgs "$EXCLUDE_PKGS" --no-parallel

# TODO: make --no-parallel the default for monorepo-tool
