
# FullCalendar Google Calendar Plugin

Display events from a public [Google Calendar feed](https://support.google.com/calendar/answer/37648?hl=en)

## Installation

Install the FullCalendar core package, the Google Calendar plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/google-calendar @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    googleCalendarPlugin,
    dayGridPlugin
  ],
  initialView: 'dayGridMonth',
  events: {
    googleCalendarId: 'abcd1234@group.calendar.google.com'
  }
})

calendar.render()
```
