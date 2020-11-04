#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in root
cd "`dirname $0`/.."

root_dir="$PWD"

for package_file in example-projects/*/package.json
do
  cd "$(dirname $package_file)"

  dist_html_files=$(find dist -name '*.html')

  if [[ "$dist_html_files" ]]
  then
    for html_file in "$dist_html_files"
    do
      open -a "Google Chrome" "file://$PWD/$html_file"
    done
  else
    for html_file in *.html
    do
      open -a "Google Chrome" "file://$PWD/$html_file"
    done
  fi

  cd "$root_dir"
done
