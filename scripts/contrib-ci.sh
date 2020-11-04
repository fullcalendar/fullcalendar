#!/usr/bin/env bash

# always immediately exit upon error
set -e

cd "`dirname $0`/../packages-contrib"

cd react
yarn ci
cd -

cd vue
yarn ci
cd -

yarn pnpify --cwd angular yarn ci
