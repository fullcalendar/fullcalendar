
# FullCalendar Time Grid Plugin

Display events on time slots

## Installation

Install the necessary packages:

```sh
npm install @teamdiverst/fullcalendar-core @teamdiverst/fullcalendar-timegrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@teamdiverst/fullcalendar-core'
import timeGridPlugin from '@teamdiverst/fullcalendar-timegrid'

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
