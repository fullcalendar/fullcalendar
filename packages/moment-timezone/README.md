
# FullCalendar Moment Timezone Plugin

Enhanced [named time zone](https://fullcalendar.io/docs/timeZone#named-time-zones) functionality with [Moment Timezone](https://momentjs.com/timezone/)

## Installation

First, ensure Moment Timezone is installed:

```sh
npm install moment-timezone
```

Then, install the FullCalendar core package, the Moment Timezone plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/moment-timezone @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'
import dayGridPlugin from '@fullcalendar/daygrid'

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
```
