#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./bin/require-clean-working-tree.sh demos

read -p "Enter new year (4 digits): " year
read -p "Enter new month (2 digits): " month

echo "This will modify files in demos/ and commit them to the current branch."
read -p "Is that ok? (y/N): " yn

if [[ "$yn" != "y" ]]
then
  echo "Aborting."
  exit 1
fi

find demos -type f \( -name '*.html' -o -name '*.json' \) -print0 \
| xargs -0 sed -i '' -e "s/[0-9][0-9][0-9][0-9]-[0-9][0-9]/$year-$month/g"

# build the commit
git add demos
git commit --quiet -m "updated demo dates"

echo "Success."
