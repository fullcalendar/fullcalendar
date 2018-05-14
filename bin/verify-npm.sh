#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

echo
echo "Please audit the NPM package's dependencies:"

# create directory, move into it, clear contents
mkdir -p "tmp/verify-npm"
cd "tmp/verify-npm"
rm -rf *

# save reference to stdout, then redirect
# (because `npm init` is very loud)
exec 4<&1
exec 1>bar

npm init --yes

# restore stdout
exec 1<&4

npm install --save "fullcalendar"

# will print out tree
npm ls

# remove the test project directory
cd ..
rm -rf "verify-npm"
