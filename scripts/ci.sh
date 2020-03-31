#!/usr/bin/env bash

set -e # always immediately exit upon error

npm run clean
npm run build
npm run test:ci
# npm run lint # for v5!!!

EXCLUDE_PKGS=''

# all angular-related packages have e2e tests that require a complicated CI setup.
# (see .travis.yml in each project). Skip altogether for now.
if [[ "$CI" == "true" ]]
then
  echo "Skipping everything angular when in a CI environment because of ChromeHeadless problems (fixed?)"
  EXCLUDE_PKGS='**/angular'
else
  echo "Skipping angular example project because we sometimes get a 'Maximum call stack size exceeded' when 'flattening the source-map'"
  echo "TODO: come up with a solution for v5"
  EXCLUDE_PKGS='example-projects/angular'
fi

# all contrib projects build/test/lint/etc?
npx monorepo run ci --filter-pkgs 'packages-contrib/*' --exclude-pkgs "$EXCLUDE_PKGS" --no-parallel

# all example projects can build?
npx monorepo run build --filter-pkgs 'example-projects/*' --exclude-pkgs "$EXCLUDE_PKGS" --no-parallel

# TODO: make --no-parallel the default for monorepo-tool
