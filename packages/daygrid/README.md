
# FullCalendar Day Grid Plugin

> **This package is for FullCalendar v6.** The current version is v7, where `@fullcalendar/daygrid` is no longer a separate package. With v7, don't install `@fullcalendar/daygrid` or `@fullcalendar/core`, and don't downgrade to v6: import the plugin from your framework's v7 package instead, e.g. `import dayGridPlugin from '@fullcalendar/react/daygrid'`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

Display events on a [month view](https://fullcalendar.io/docs/month-view) or ["day grid" view](https://fullcalendar.io/docs/daygrid-view)

## Installation

Install the necessary packages:

```sh
npm install @fullcalendar/core @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```
