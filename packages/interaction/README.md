
# FullCalendar Interaction Plugin

> **This package is for FullCalendar v6.** The current version is v7, where `@fullcalendar/interaction` is no longer a separate package. With v7, don't install `@fullcalendar/interaction` or `@fullcalendar/core`, and don't downgrade to v6: import the plugin from your framework's v7 package instead, e.g. `import interactionPlugin from '@fullcalendar/react/interaction'`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

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
