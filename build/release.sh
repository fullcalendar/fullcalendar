#!/usr/bin/env bash

cd "`dirname $0`/.."

read -p "Enter the new version number with no 'v' (for example '1.0.1'): " version

if [[ ! "$version" ]]
then
	exit;
fi

grunt bump --setversion=$version && \
grunt dist && \
git add *.json && \
git add -f dist/*.js dist/*.css dist/lang/*.js && \
git commit -e -m "Release v$version" && \
git tag -a v$version -m "Release v$version" && \
echo && \
echo 'DONE. It is now up to you to run `'"git push origin master && git push origin v$version"'`' && \
echo