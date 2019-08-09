#!/usr/bin/env bash

set -e # always immediately exit upon error

cd "`dirname $0`/.." # start in project root

./scripts/require-clean-working-tree.sh examples

read -p "Do you want to update the example dates? (y/N): " yn

if [[ "$yn" != "y" ]]
then
  exit 0 # won't signal failure
fi

read -p "Enter new year (4 digits): " year
read -p "Enter new month (2 digits): " month

echo "This will modify files in examples/ and commit them to the current branch."
read -p "Is that ok? (y/N): " yn

if [[ "$yn" != "y" ]]
then
  echo "Aborting."
  exit 1
fi

find examples -type f \( -name '*.html' -o -name '*.json' \) -print0 \
| xargs -0 sed -i '' -e "s/[0-9][0-9][0-9][0-9]-[0-9][0-9]/$year-$month/g"

# build the commit
git add examples
git commit --quiet -m "updated example dates"

echo "Success."
