#!/usr/bin/env bash

set -e

mkdir -p tmp
echo "<---- cloning emmet to tmp/emmet"
git clone git@github.com:emmetio/emmet.git tmp/emmet || true
cd tmp/emmet
#latestRelease="$(git describe --tags `git rev-list --tags --max-count=1`)"
latestRelease="master" #<-- turns out, the latest release is busted. :-(
echo "<---- checkout latest tag: '$latestRelease'"
git checkout "$latestRelease"
echo "<---- installing dependencies"
npm i
echo "<---- building emmet"
$(npm bin)/gulp app
cd ../..
awk '{print "// " $0}' tmp/emmet/LICENSE > app/js/emmet.js
cat tmp/emmet/dist/emmet-app.js >> app/js/emmet.js
git commit -m "emmet $latestRelease" -- app/js/emmet.js || true
rm -rf tmp
