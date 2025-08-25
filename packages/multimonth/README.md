
# FullCalendar Multi-Month Plugin

Display multiple months, in a grid or vertical stack

## Installation

Install the necessary packages:

```sh
npm install @teamdiverst/fullcalendar-core @teamdiverst/fullcalendar-multimonth
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@teamdiverst/fullcalendar-core'
import multiMonthPlugin from '@teamdiverst/fullcalendar-multimonth'

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
