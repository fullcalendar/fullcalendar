#!/usr/bin/env bash
#
set -e # always immediately exit upon error
cd "`dirname $0`/.." # start in project root

proj_dir="$PWD"

# will fail if any of the submodules are not committed too
./bin/require-clean-working-tree.sh

version="$1"

if [[ ! "$version" ]]
then
  echo 'Specify a version'
  exit 1
fi

any_updates=0

for example_path in tests/example-repos/*
do
  gulp example-repo:bump --dir="$example_path" --version="$version"
  cd "$example_path"

  if [[ `git diff` ]] # any changes?
  then
    # commit the changes within the subrepo
    git add package.json
    git commit -m 'bump deps'

    # commit the change in the master repo
    cd "$proj_dir"
    git add "$example_path"

    any_updates=1

    echo
    echo "Committed for `basename $example_path`"
    echo
  else
    echo
    echo "Nothing to commit for `basename $example_path`"
    echo
  fi

  cd "$proj_dir" # for next iteration
done

if [[ "$any_updates" ]]
then
  git commit -m 'update example repo deps'

  echo
  echo 'Committed example-repo submodules'
  echo
else
  echo
  echo 'Nothing to commit for example-repo dep update'
  echo
fi
