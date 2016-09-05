#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in project root
cd "`dirname $0`/.."

./bin/require-clean-working-tree.sh

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
if ! {
	# make sure deps are as new as possible for bundle
	npm install && \

	# ensures stray files stay out of the release
	gulp clean && \

	# update package manager json files with version number and release date
	gulp bump --version=$version && \

	# build all dist files, lint, and run tests
	gulp release
}
then
	# failure. discard changes from version bump
	git checkout -- *.json
else
	# save reference to current branch
	orig_ref=$(git symbolic-ref --quiet HEAD)

	# make a tagged detached commit of the dist files.
	# no-verify (-n) avoids commit hooks.
	if {
		git checkout --detach --quiet && \
		git add *.json && \
		git add -f dist/*.js dist/*.css dist/locale/*.js && \
		git commit -n -e -m "version $version" && \
		git tag -a "v$version" -m "version $version"
	}
	then
		success=1
	fi

	# return to branch
	git symbolic-ref HEAD "$orig_ref"

	# unstage ignored generated files or files leftover from failed git add's
	git reset
fi

if [[ "$success" = "1" ]]
then
	echo "Success."
else
	echo "Failure."
	exit 1
fi
