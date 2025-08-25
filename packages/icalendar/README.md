
# FullCalendar iCalendar Plugin

Display events from a public [iCalendar feed](https://icalendar.org/)

## Installation

First, ensure ical.js is installed:

```sh
npm install ical.js
```

Then, install the FullCalendar core package, the iCalendar plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @teamdiverst/fullcalendar-core @teamdiverst/fullcalendar-icalendar @teamdiverst/fullcalendar-daygrid
```

## Usage

Instantiate a Calendar with the necessary plugins and options:

```js
import { Calendar } from '@teamdiverst/fullcalendar-core'
import iCalendarPlugin from '@teamdiverst/fullcalendar-icalendar'
import dayGridPlugin from '@teamdiverst/fullcalendar-daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    iCalendarPlugin,
    dayGridPlugin
  ],
  initialView: 'dayGridMonth',
  events: {
    url: 'https://mywebsite.com/icalendar-feed.ics',
    format: 'ics' // important!
  }
})

calendar.render()
```
