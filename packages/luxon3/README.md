
# FullCalendar Luxon 3 Plugin

> **This package is for FullCalendar v6.** The current version is v7, which has no `@fullcalendar/luxon3` package. With v7, don't install `@fullcalendar/luxon3` or `@fullcalendar/core`, and don't downgrade to v6: use `@fullcalendar/format-luxon3` for Luxon formatting strings; time zones are built into v7. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

Enhanced date formatting, conversion, and [named time zone](https://fullcalendar.io/docs/timeZone#named-time-zones) functionality with [Luxon](https://moment.github.io/luxon/) 3

## Installation

First, ensure Luxon is installed:

```sh
npm install luxon@3
```

Then, install the FullCalendar core package, the Luxon plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/luxon3 @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import luxon3Plugin from '@fullcalendar/luxon3'
import dayGridPlugin from '@fullcalendar/daygrid'

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
