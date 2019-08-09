#!/usr/bin/env bash

set -e # always immediately exit upon error

cd "`dirname $0`/.." # start in project root


version_arg="$1"
if [[ -z "$version_arg" ]]
then
  echo "Please supply a version arg"
  exit 1
fi


read -p "Do you want to update the example dates? (y/N): " yn
if [[ "$yn" == "y" ]]
then
  ./scripts/update-example-dates.sh
fi


npm run ci
npm run archive


# after version script completes, will call postversion hook, which calls `monorepo publish`
npx monorepo version "$version_arg"
