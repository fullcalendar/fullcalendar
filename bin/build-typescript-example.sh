#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

#
# Give a --recent-release flag to test against the currently live release
#

if [[ "$1" == '--recent-release' ]]
then
  use_current=0
else
  use_current=1
fi

if [[ ! -d 'tests/example-repos/typescript-example' ]]
then
  echo "Checking out the typescript-example git submodule..."
  git submodule init
  git submodule update
fi

cd 'tests/example-repos/typescript-example'

npm install

if [[ "$use_current" == '1' ]]
then
  echo "Linking to fullcalendar current working directory..."
  npm link ../../../
fi

success=0

if npm run build
then
  success=1
fi

# undo the link regardless of success/failure.
# IMPORTANT, otherwise other tasks trip up on infinite directory recursion
if [[ "$use_current" == '1' ]]
then
  echo "Unlinking fullcalendar..."
  npm unlink fullcalendar
fi

if [[ "$success" == '1' ]]
then
  echo "Success."
else
  echo "Failure."
  exit 1
fi
