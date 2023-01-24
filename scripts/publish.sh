#!/bin/bash

# exit upon error
set -e

cd /Users/adam/Code/fullcalendar-legacy/packages/core && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/common && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/daygrid && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/timegrid && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/bootstrap && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/bootstrap5 && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/google-calendar && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/icalendar && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/interaction && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/list && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/luxon && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/luxon2 && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/moment && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/moment-timezone && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/rrule && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages/bundle && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/premium-common && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/timeline && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/adaptive && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/scrollgrid && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-common && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-daygrid && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-timegrid && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/resource-timeline && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-premium/bundle && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/react && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/vue && yarn publish
cd /Users/adam/Code/fullcalendar-legacy/packages-contrib/vue3 && yarn publish
cd /Users/adam/Code/fullcalendar-legacy

echo "Must manuall do:"
echo /Users/adam/Code/fullcalendar-legacy/packages-contrib/angular && yarn publish

# tag pushing
# git tag -a v5.11.4 -m v5.11.4 && git push origin v5.11.4
