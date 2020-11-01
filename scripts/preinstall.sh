#!/usr/bin/env bash

# always immediately exit upon error
set -e

# start in root
cd "`dirname $0`/.."

if [[ -d "packages-contrib/angular" ]]; then
  ./packages-contrib/angular/scripts/ensure-package.sh
fi
