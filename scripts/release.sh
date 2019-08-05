#!/usr/bin/env bash

set -e # always immediately exit upon error

cd "`dirname $0`/.." # start in project root


read -p "Do you want to update the example dates? (y/N): " yn

if [[ "$yn" == "y" ]]
then
  ./scripts/update-example-dates.sh
fi


npm run ci
npm run archive


# after version script completes, will call postversion hook, which calls `monorepo publish`
npx monorepo version
