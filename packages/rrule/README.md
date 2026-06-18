
# FullCalendar RRule Plugin

Recurring events with [RRule](https://github.com/jakubroztocil/rrule)

## Installation

First, ensure the RRule lib is installed:

```sh
npm install rrule
```

Then, install the FullCalendar vanilla-JS package and the RRule plugin:

```sh
npm install fullcalendar @fullcalendar/rrule temporal-polyfill
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from 'fullcalendar'
import dayGridPlugin from 'fullcalendar/daygrid'
import classicThemePlugin from 'fullcalendar/themes/classic'
import rrulePlugin from '@fullcalendar/rrule'

import 'fullcalendar/skeleton.css'
import 'fullcalendar/themes/classic/theme.css'
import 'fullcalendar/themes/classic/palette.css'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    rrulePlugin,
    dayGridPlugin,
    classicThemePlugin
  ],
  initialView: 'dayGridMonth',
  events: [
    {
      title: 'Meeting',
      rrule: {
        freq: 'weekly',
        byweekday: ['mo', 'fr']
      }
    }
  ]
})

calendar.render()
```
