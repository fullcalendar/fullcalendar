#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./bin/require-clean-working-tree.sh

read -p "Enter the version you want to publish, with no 'v' (for example '1.0.1'): " version
if [[ ! "$version" ]]
then
  echo "Aborting."
  exit 1
fi

# push the current branch (assumes tracking is set up) and the tag
git push --recurse-submodules=on-demand
git push origin "v$version"

success=0

# save reference to current branch
current_branch=$(git symbolic-ref --quiet --short HEAD)

# temporarily checkout the tag's commit, publish to NPM
git checkout --quiet "v$version"
if npm publish --tag legacy
then
  success=1
fi

# return to branch
git checkout --quiet "$current_branch"

# restore generated dist files
git checkout --quiet "v$version" -- dist
git reset --quiet -- dist

if [[ "$success" == "1" ]]
then
  echo "Waiting for release to propagate to NPM..."
  sleep 10

  ./bin/verify-npm.sh

  echo
  echo 'Success.'
  echo 'You can now run:'
  echo '  ./bin/update-example-repo-deps.sh &&'
  echo '  git push --recurse-submodules=on-demand &&'
  echo '  ./bin/build-example-repos.sh --recent-release'
  echo
else
  echo
  echo 'Failure.'
  echo
  exit 1
fi
