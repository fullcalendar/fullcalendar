#!/bin/bash

# exit upon error
set -e

#
# NOTE: common & resource-common don't have `--tag legacy` because they are stuck in v5,
# because they were removed from v6
#
cd /Users/adam/Code/fullcalendar-legacy/packages/core && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/common && yarn npm publish --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/daygrid && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/timegrid && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/bootstrap && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/bootstrap5 && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/google-calendar && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/icalendar && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/interaction && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/list && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/luxon && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/luxon2 && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/moment && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/moment-timezone && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/rrule && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages/bundle && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/premium-common && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/timeline && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/adaptive && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/scrollgrid && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-common && yarn npm publish --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-daygrid && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-timegrid && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-timeline && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/bundle && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/react && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/vue && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/vue3 && yarn npm publish --tag legacy --access=public
cd /Users/adam/Code/fullcalendar-legacy

echo
echo "Must manually deal with Angular!"
echo

# Angular
#
# cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/angular
# nvm use 14
# npm install
# npm run ci
# cd dist/fullcalendar
# npm publish --tag legacy --access=public
#
# cd /Users/adam/Code/fullcalendar-legacy/example-projects/angular14
# nvm use 14
# npm install
# npm run start

# Git
#
# recursive push
# git push --recurse-submodules=on-demand
#
# tag pushing
# git tag -a v5.11.4 -m v5.11.4 && git push origin v5.11.4
