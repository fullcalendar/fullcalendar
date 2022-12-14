
# FullCalendar Luxon 1 Plugin

Enhanced date formatting, conversion, and [named time zone](https://fullcalendar.io/docs/timeZone#named-time-zones) functionality with [Luxon](https://moment.github.io/luxon/) 1

## Installation

First, ensure Luxon is installed:

```sh
npm install luxon@1
```

Then, install the FullCalendar core package, the Luxon plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/luxon @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import luxonPlugin from '@fullcalendar/luxon'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    luxonPlugin,
    dayGridPlugin
  ],
  initialView: 'dayGridMonth',
  titleFormat: 'LLLL d, yyyy', // use Luxon format strings
  timeZone: 'America/New_York' // enhance named time zones
})

calendar.render()
```
