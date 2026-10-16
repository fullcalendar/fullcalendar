
# FullCalendar List View Plugin

> **This package is for FullCalendar v6.** The current version is v7, where `@fullcalendar/list` is no longer a separate package. With v7, don't install `@fullcalendar/list` or `@fullcalendar/core`, and don't downgrade to v6: import the plugin from your framework's v7 package instead, e.g. `import listPlugin from '@fullcalendar/react/list'`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

Display events on a calendar view that looks like a bulleted list

## Installation

Install the necessary packages:

```sh
npm install @fullcalendar/core @fullcalendar/list
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import listPlugin from '@fullcalendar/list'

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
