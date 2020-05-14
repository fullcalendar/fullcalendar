#!/usr/bin/env bash

set -e # always immediately exit upon error
cd "`dirname $0`/.." # always start in project root


# rewire the @fullcalendar/angular package.
# we still want yarn to install its dependencies,
# but we want other packages to reference it by its dist/fullcalendar folder
rm -f node_modules/@fullcalendar/angular
ln -s ../../packages-contrib/angular/dist/fullcalendar node_modules/@fullcalendar/angular


# same concept for fullcalendar-tests
rm -f node_modules/fullcalendar-tests
ln -s ../packages/__tests__/tsc node_modules/fullcalendar-tests
