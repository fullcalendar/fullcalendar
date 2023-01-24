#!/bin/bash

# exit upon error
set -e

cd /Users/adam/Code/fullcalendar-legacy/packages/core && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/common && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/daygrid && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/timegrid && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/bootstrap && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/bootstrap5 && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/google-calendar && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/icalendar && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/interaction && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/list && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/luxon && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/luxon2 && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/moment && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/moment-timezone && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/rrule && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages/bundle && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/premium-common && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/timeline && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/adaptive && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/scrollgrid && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-common && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-daygrid && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-timegrid && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-timeline && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/bundle && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/react && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/vue && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/vue3 && yarn publish --tag legacy
cd /Users/adam/Code/fullcalendar-legacy

echo "Must manuall do:"
echo /Users/adam/Code/fullcalendar-legacy/packages-contrib/angular && yarn publish
echo "Ensure you specify correct --tag before publishing!"

# tag pushing
# git tag -a v5.11.4 -m v5.11.4 && git push origin v5.11.4
