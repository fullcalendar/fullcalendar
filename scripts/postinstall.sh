#!/usr/bin/env bash

set -e # always immediately exit upon error
cd "`dirname $0`/.." # always start in project root


# rewire the @fullcalendar/angular package.
# we still want yarn to install its dependencies,
# but we want other packages to reference it by its dist/fullcalendar folder
cd node_modules/@fullcalendar
rm -f angular
ln -s ../../packages-contrib/angular/dist/fullcalendar angular
