
# FullCalendar Multi-Month Plugin

Display a sequence or grid of multiple months

## Installation

Install the necessary packages:

```sh
npm install @fullcalendar/core @fullcalendar/multimonth
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import multiMonthPlugin from '@fullcalendar/multimonth'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [multiMonthPlugin],
  initialView: 'multiMonthYear',
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```
