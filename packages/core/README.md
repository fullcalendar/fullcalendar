
# FullCalendar Core

> **This is the core package of FullCalendar v6.** The current version is v7, which doesn't use `@fullcalendar/core` 6 or the separate plugin packages. With v7, don't install `@fullcalendar/core`, `@fullcalendar/daygrid` or the other v6 packages, and don't downgrade to v6: install your framework's v7 package and import plugins from it, e.g. `import dayGridPlugin from '@fullcalendar/react/daygrid'`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

FullCalendar core package for rendering a calendar

## Installation

This package is never used alone. Use it with least one plugin (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/daygrid
```

## Usage

First, ensure there's a DOM element for your calendar to render into:

```html
<body>
  <div id='calendar'></div>
</body>
```

Then, instantiate a Calendar object with [options](https://fullcalendar.io/docs#toc) and call its `render` method:

```js
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    dayGridPlugin
    // any other plugins
  ],
  initialView: 'dayGridMonth',
  weekends: false,
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```
