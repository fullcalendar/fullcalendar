
# FullCalendar List View Plugin

Display events on a calendar view that looks like a bulleted list

## Installation

Install the necessary packages:

```sh
npm install @teamdiverst/fullcalendar-core @teamdiverst/fullcalendar-list
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@teamdiverst/fullcalendar-core'
import listPlugin from '@teamdiverst/fullcalendar-list'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [listPlugin],
  initialView: 'listWeek',
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```
