#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./bin/require-clean-working-tree.sh

package="$1" # a short name like 'core'
version="$2"
release_tag="$3"
production_str="$4"
RELEASES_ROOT="../fullcalendar-site/fullcalendar-releases"

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

if [[ "$release_tag" != "latest" ]] && [[ "$release_tag" != "beta" ]] && [[ "$release_tag" != "alpha" ]]
then
  echo "Invalid third argument release tag '$release_tag'. Aborting."
  exit 1
fi

if [[ "$production_str" == "" ]]
then

  echo "Copying to fullcalendar-releases dir..."
  mkdir -p "$RELEASES_ROOT/$package"
  rm -rf "$RELEASES_ROOT/$package/$version" # clear to dir nesting doesn't happen
  cp -r "dist/$package" "$RELEASES_ROOT/$package/$version"

  echo "Publishing to DEV NPM INSTALLATION..."
  npm_registry_str="--registry http://localhost:4873"
  # actual publish happens later in script...

elif [[ "$production_str" == "--production" ]]
then

  echo "Pushing to Github..."

  # push the current branch (assumes tracking is set up) and the tag
  git push --recurse-submodules=on-demand
  git push origin "v$version"

  echo "Publishing to LIVE NPM..."
  npm_registry_str=""
  # actual publish happens later in script...

else
  echo "Invalid flag $production_str. Aborting"
  exit 1
fi

if {
  # check out dist files for tag but don't stage them
  git checkout --quiet "v$version" -- dist &&
  git reset --quiet -- dist &&

  cd "dist/$package" &&

  npm publish --tag "$release_tag" --access public $npm_registry_str
}
then
  echo 'Success.'
else
  echo 'Failure.'
  exit 1
fi
