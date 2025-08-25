
# FullCalendar Moment Timezone Plugin

Enhanced [named time zone](https://fullcalendar.io/docs/timeZone#named-time-zones) functionality with [Moment Timezone](https://momentjs.com/timezone/)

## Installation

First, ensure Moment Timezone is installed:

```sh
npm install moment-timezone
```

Then, install the FullCalendar core package, the Moment Timezone plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @teamdiverst/fullcalendar-core @teamdiverst/fullcalendar-moment-timezone @teamdiverst/fullcalendar-daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@teamdiverst/fullcalendar-core'
import momentTimezonePlugin from '@teamdiverst/fullcalendar-moment-timezone'
import dayGridPlugin from '@teamdiverst/fullcalendar-daygrid'

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
