#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./bin/require-clean-working-tree.sh

package="$1"
version="$2"
scope="$3"

if [[ ! "$package" ]]
then
  echo "Invalid first argument package name."
  exit 1
fi

if [[ ! "$version" ]]
then
  echo "Invalid second argument version."
  exit 1
fi

if [[ "$scope" != "latest" ]] && [[ "$scope" != "beta" ]] && [[ "$scope" != "alpha" ]]
then
  echo "Invalid third argument scope '$scope'. Aborting."
  exit 1
fi

# # push the current branch (assumes tracking is set up) and the tag
# git push --recurse-submodules=on-demand
# git push origin "v$version"

if {
  # check out dist files for tag
  git checkout --quiet "v$version" -- dist &&

  cd "dist/$package" &&

  # npm publish --tag "$scope"
  echo "FAKE NPM PUBLISH ($PWD)"
}
then
  echo 'Success.'
else
  echo 'Failure.'
  exit 1
fi
