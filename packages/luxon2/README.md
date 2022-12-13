
# FullCalendar Luxon 2 Plugin

Enhanced date formatting, conversion, and time zone functionality with [Luxon](https://moment.github.io/luxon/) 2

## Installation

Install the FullCalendar core package, the Luxon plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/luxon2 @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the correct plugins and options:

```js
import { Calendar } from '@fullcalendar/core'
import luxon2Plugin from '@fullcalendar/luxon2'
import dayGridPlugin from '@fullcalendar/daygrid'

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar')

  const calendar = new Calendar(calendarEl, {
    plugins: [
      luxon2Plugin,
      dayGridPlugin
    ],
    initialView: 'dayGridMonth',
    titleFormat: 'LLLL d, yyyy', // use Luxon format strings
    timeZone: 'America/New_York' // enhance named time zones
  })

  calendar.render()
})
```
