#!/usr/bin/env bash
#
# Give a --recent-release flag to test against the currently live release
#
set -e # always immediately exit upon error
cd "`dirname $0`/.." # start in project root

proj_dir="$PWD"

if [[ "$1" == '--recent-release' ]]
then
  use_current=0
else
  use_current=1

  # temporarily make this fullcalendar project global
  npm link
fi

success=1

for example_path in tests/example-repos/*
do
  # has npm build system? then build
  if [[ -f "$example_path/package.json" ]]
  then

    cd "$example_path"

    # start with fresh dependencies
    rm -f "package-lock.json"
    rm -rf "node_modules"

    # link to the globally linked fullcalendar
    # (must be done before `npm install`)
    if [[ "$use_current" == '1' ]]
    then
      npm link fullcalendar
    fi

    npm install

    if npm run build
    then
      echo
      echo "Successfully built `basename $example_path`"
      echo
    else
      echo
      echo "Failed to build `basename $example_path`"
      echo
      success=0
    fi

  fi

  # return to project root, for next iteraion, and for after loop
  cd "$proj_dir"
done

# unlink global fullcalendar
if [[ "$use_current" == '1' ]]
then
  npm unlink
fi

if [[ "$success" == '1' ]]
then
  echo
  echo "Successfully built all example repos."
  echo
else
  echo
  echo "Failed to build all example repos."
  echo
  exit 1
fi
