
# FullCalendar Moment Timezone Plugin

> **This package is for FullCalendar v6.** The current version is v7, which has no `@fullcalendar/moment-timezone` package. With v7, don't install `@fullcalendar/moment-timezone` or `@fullcalendar/core`, and don't downgrade to v6. v7 needs no replacement, since named time zones are built in, via the `temporal-polyfill` peer dependency. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

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
