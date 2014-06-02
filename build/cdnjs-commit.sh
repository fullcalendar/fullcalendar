#!/usr/bin/env bash

cd "`dirname $0`/.."
proj_dir="$PWD"

echo
echo "This script assumes the following:"
echo "1. You have run the release script"
echo "2. You have a clone of CDNJS's repo with remotes 'upstream' and 'origin'"
echo "3. You have initialized CDNJS's repo with 'npm install'"
echo

# 1. make a fork of cdnjs on github
# 2. clone the fork from github (which will be the 'origin')
# 3. `git remote add upstream git@github.com:cdnjs/cdnjs.git`

version=$(sed -n 's/^.*"version" *: *"\([^"]*\)".*$/\1/p' package.json)
cdnjs_dir="$HOME/Scratch/cdnjs"

echo "FullCalendar version: $version"
echo "Default CDNJS directory: $cdnjs_dir"
echo

echo "Enter the location of the CDNJS directory. To keep the default, press enter."
read cdnjs_dir_override

if [[ "$cdnjs_dir_override" ]]
then
	cdnjs_dir="$cdnjs_dir_override"
fi

echo "Updating local copy of CDNJS..." && \
cd "$cdnjs_dir" && \
git pull upstream master && \
\
echo "Copying over our changes..." && \
cd "$proj_dir" && \
cp -r -f dist/cdnjs/* "$cdnjs_dir/ajax/libs/fullcalendar/" && \
\
echo "Running CDNJS's tests..." && \
cd "$cdnjs_dir" && \
npm test && \
\
echo "Building commit..." && \
git add "ajax/libs/fullcalendar/" && \
git commit -e -m "fullcalendar v$version" && \
echo && \
echo 'DONE. It is now up to you to run `'"cd $cdnjs_dir && git push origin master"'` and submit the PR to CDNJS.' && \
echo