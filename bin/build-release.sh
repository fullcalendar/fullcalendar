#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./bin/require-clean-working-tree.sh

read -p 'Have you already ran `npm update` and committed the package-lock.json? (y/N): ' updated_npm_deps
if [[ "$updated_npm_deps" != "y" ]]
then
  echo "Go do that!"
  exit 1
fi

read -p "Have you already updated the changelog? (y/N): " updated_changelog
if [[ "$updated_changelog" != "y" ]]
then
  echo "Go do that!"
  exit 1
fi

read -p "Would you like to update dates in the demos? (y/N): " update_demos
if [[ "$update_demos" == "y" ]]
then
  ./bin/update-demo-dates.sh
fi

read -p "Enter the new version number with no 'v' (for example '1.0.1'): " version
if [[ ! "$version" ]]
then
  echo "Aborting."
  exit 1
fi

success=0
if {
  # ensures stray files stay out of the release
  gulp clean &&

  # update package manager json files with version number and release date
  gulp bump --version=$version &&

  # build all dist files, lint, and run tests
  gulp release
}
then
  # save reference to current branch
  current_branch=$(git symbolic-ref --quiet --short HEAD)

  # make a tagged detached commit of the dist files.
  # no-verify avoids commit hooks.
  if {
    git checkout --quiet --detach &&
    git add *.json &&
    git add -f dist/*.js dist/*.d.ts dist/*.css dist/locale/*.js &&
    git commit --quiet --no-verify -e -m "version $version" &&
    git tag -a "v$version" -m "version $version"
  }
  then
    success=1
  fi

  # return to branch
  git checkout --quiet "$current_branch"
fi

if [[ "$success" == "1" ]]
then
  # keep newly generated dist files around
  git checkout --quiet "v$version" -- dist
  git reset --quiet -- dist

  echo "Success."
else
  # unstage all dist/ or *.json changes
  git reset --quiet

  # discard changes from version bump
  git checkout --quiet -- *.json

  echo "Failure."
  exit 1
fi
