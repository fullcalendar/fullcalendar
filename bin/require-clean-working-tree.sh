#!/usr/bin/env bash

# http://stackoverflow.com/questions/3878624/how-do-i-programmatically-determine-if-there-are-uncommited-changes

# optional argument
working_subdir="$1"

# git complains if empty string path in statements below
if [[ -z "$working_subdir" ]]
then
  working_subdir="."
fi

# Update the index
git update-index -q --ignore-submodules --refresh
err=0

# Disallow unstaged changes in the working tree
if ! git diff-files --quiet --ignore-submodules -- "$working_subdir"
then
  echo >&2 "You have unstaged changes."
  git diff-files --name-status -r --ignore-submodules -- "$working_subdir" >&2
  err=1
fi

# Disallow uncommitted changes in the index
if ! git diff-index --cached --quiet HEAD --ignore-submodules --
then
  echo >&2 "Your index contains uncommitted changes."
  git diff-index --cached --name-status -r --ignore-submodules HEAD -- >&2
  err=1
fi

if [ $err = 1 ]
then
  echo >&2 "Please commit or stash them."
  exit 1
fi
