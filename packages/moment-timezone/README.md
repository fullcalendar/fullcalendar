
# FullCalendar Moment Timezone Plugin

Enhanced named time zone functionality with [Moment Timezone](https://momentjs.com/timezone/)

## Installation

Install the FullCalendar core package, the Moment plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/moment-timezone @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the correct plugins and options:

```js
import { Calendar } from '@fullcalendar/core'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import dayGridPlugin from '@fullcalendar/daygrid'

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar')

  const calendar = new Calendar(calendarEl, {
    plugins: [
      momentTimezonePlugin,
      dayGridPlugin
    ],
    initialView: 'dayGridMonth',
    timeZone: 'America/New_York' // enhance named time zones
  })

  calendar.render()
})
```
