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
git update-index -q --refresh
err=0

# Disallow unstaged changes in the working tree
if ! git diff-files --quiet -- "$working_subdir"
then
  echo >&2 "You have unstaged changes."
  git diff-files --name-status -r -- "$working_subdir" >&2
  err=1
fi

# Disallow uncommitted changes in the index
if ! git diff-index --cached --quiet HEAD --
then
  echo >&2 "Your index contains uncommitted changes."
  git diff-index --cached --name-status -r HEAD -- >&2
  err=1
fi

if [ $err = 1 ]
then
  echo >&2 "Please commit or stash them."
  exit 1
fi
