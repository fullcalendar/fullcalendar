
# FullCalendar Moment Plugin

Enhanced date formatting and conversion with [Moment](https://momentjs.com/)

## Installation

First, ensure Moment is installed:

```sh
npm install moment
```

Then, install the FullCalendar core package, the Moment plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/moment @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import momentPlugin from '@fullcalendar/moment'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    momentPlugin,
    dayGridPlugin
  ],
  initialView: 'dayGridMonth',
  titleFormat: 'MMMM D, YYYY' // use Moment format strings
})

calendar.render()
```
