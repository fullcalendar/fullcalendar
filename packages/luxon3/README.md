
# FullCalendar Luxon 3 Plugin

Enhanced date formatting, conversion, and [named time zone](https://fullcalendar.io/docs/timeZone#named-time-zones) functionality with [Luxon](https://moment.github.io/luxon/) 3

## Installation

First, ensure Luxon is installed:

```sh
npm install luxon@3
```

Then, install the FullCalendar core package, the Luxon plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @teamdiverst/fullcalendar-core @teamdiverst/fullcalendar-luxon3 @teamdiverst/fullcalendar-daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@teamdiverst/fullcalendar-core'
import luxon3Plugin from '@teamdiverst/fullcalendar-luxon3'
import dayGridPlugin from '@teamdiverst/fullcalendar-daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    luxon3Plugin,
    dayGridPlugin
  ],
  initialView: 'dayGridMonth',
  titleFormat: 'LLLL d, yyyy', // use Luxon format strings
  timeZone: 'America/New_York' // enhance named time zones
})

calendar.render()
```
