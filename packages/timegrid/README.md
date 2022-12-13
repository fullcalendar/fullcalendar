
# FullCalendar Time Grid Plugin

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
