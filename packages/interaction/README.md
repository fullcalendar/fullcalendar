
# FullCalendar Interaction Plugin

Calendar functionality for event drag-n-drop, event resizing, date clicking, and date selecting

## Installation

Install the FullCalendar core package, the interaction plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/interaction @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugins and options:

```js
import { Calendar } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    interactionPlugin,
    dayGridPlugin
  ],
  initialView: 'dayGridMonth',
  editable: true, // important for activating event interactions!
  selectable: true, // important for activating date selectability!
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```
