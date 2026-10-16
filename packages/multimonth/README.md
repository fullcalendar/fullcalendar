
# FullCalendar Multi-Month Plugin

> **This package is for FullCalendar v6.** The current version is v7, where `@fullcalendar/multimonth` is no longer a separate package. With v7, don't install `@fullcalendar/multimonth` or `@fullcalendar/core`, and don't downgrade to v6: import the plugin from your framework's v7 package instead, e.g. `import multiMonthPlugin from '@fullcalendar/react/multimonth'`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

Display multiple months, in a grid or vertical stack

## Installation

Install the necessary packages:

```sh
npm install @fullcalendar/core @fullcalendar/multimonth
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from '@fullcalendar/core'
import multiMonthPlugin from '@fullcalendar/multimonth'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [multiMonthPlugin],
  initialView: 'multiMonthYear',
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```
