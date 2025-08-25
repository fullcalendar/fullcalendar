
# FullCalendar Day Grid Plugin

Display events on a [month view](https://fullcalendar.io/docs/month-view) or ["day grid" view](https://fullcalendar.io/docs/daygrid-view)

## Installation

Install the necessary packages:

```sh
npm install @teamdiverst/fullcalendar-core @teamdiverst/fullcalendar-daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@teamdiverst/fullcalendar-core'
import dayGridPlugin from '@teamdiverst/fullcalendar-daygrid'

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
