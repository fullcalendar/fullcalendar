
# FullCalendar Moment Date-Formatting Plugin

Enhanced date formatting and conversion with [Moment](https://momentjs.com/)

## Installation

First, ensure Moment is installed:

```sh
npm install moment
```

Then, install the FullCalendar core package, the Moment plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install fullcalendar @fullcalendar/format-moment temporal-polyfill
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic'
import dayGridPlugin from 'fullcalendar/daygrid'
import momentPlugin from '@fullcalendar/format-moment'

import 'fullcalendar/skeleton.css'
import 'fullcalendar/themes/classic/theme.css'
import 'fullcalendar/themes/classic/palette.css'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    momentPlugin,
    dayGridPlugin,
    classicThemePlugin
  ],
  initialView: 'dayGridMonth',
  titleFormat: 'MMMM D, YYYY' // use Moment format strings
})

calendar.render()
```
