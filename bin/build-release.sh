#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./bin/require-clean-working-tree.sh

if [[ ! -f 'package-lock.json' ]]
then
  echo "No package-lock.json present. Run npm install/update."
  exit 1
fi

read -p 'Have you already ran `npm update` (y/N): ' updated_npm_deps
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

# save reference to current branch
current_branch=$(git symbolic-ref --quiet --short HEAD)

# detach the branch head
git checkout --quiet --detach

if {
  # ensures stray files stay out of the release
  npm run clean &&

  # update package manager json files with version number and release date
  ./bin/bump-version.js "$version" &&

  # build everything
  npm run dist &&

  # test in headless browser
  npm run test-single &&

  # commit new files
  git add -f dist package.json package-lock.json &&
  git commit --quiet --no-verify -e -m "version $version" &&
  git tag -a "v$version" -m "version $version"
}
then
  # return to branch
  git checkout --quiet "$current_branch"

  # keep some newly generated files around
  git checkout --quiet "v$version" -- dist package-lock.json
  git reset --quiet -- dist package-lock.json

  echo "Success."

else
  # unstage all added changes
  git reset --hard --quiet

  # return to branch
  git checkout --quiet "$current_branch"

  echo "Failure."
  exit 1
fi
