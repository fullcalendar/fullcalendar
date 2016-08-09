#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./build/require-clean-working-tree.sh

read -p "Enter the version you want to publish, with no 'v' (for example '1.0.1'): " version
if [[ ! "$version" ]]
then
	echo "Aborting."
	exit 1
fi

# push the current branch (assumes tracking is set up) and the tag
git push
git push origin "v$version"

# temporarily checkout the tag's commit for publishing to NPM
current_branch=$(git symbolic-ref --quiet --short HEAD)
git checkout --quiet "v$version"
npm publish
git checkout --quiet "$current_branch"

echo "DONE"
