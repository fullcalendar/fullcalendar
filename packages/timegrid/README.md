
# FullCalendar Time Grid Plugin

> **This package is for FullCalendar v6.** The current version is v7, where `@fullcalendar/timegrid` is no longer a separate package. With v7, don't install `@fullcalendar/timegrid` or `@fullcalendar/core`, and don't downgrade to v6: import the plugin from your framework's v7 package instead, e.g. `import timeGridPlugin from '@fullcalendar/react/timegrid'`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

Display events on time slots

## Installation

Install the necessary packages:

```sh
npm install @fullcalendar/core @fullcalendar/timegrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [timeGridPlugin],
  initialView: 'timeGridWeek',
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```
