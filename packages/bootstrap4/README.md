
# FullCalendar Bootstrap 4 Plugin

[Bootstrap 4](https://getbootstrap.com/docs/4.6/getting-started/introduction/) theme for [FullCalendar](https://fullcalendar.io)

> For [Bootstrap 5](https://getbootstrap.com/), use the [@fullcalendar/bootstrap5](https://github.com/fullcalendar/fullcalendar/tree/main/packages/bootstrap5) package

## Installation

First, ensure the necessary Bootstrap packages are installed:

```sh
npm install bootstrap@4 @fortawesome/fontawesome-free
```

Then, install the FullCalendar core package, the Bootstrap plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/bootstrap @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the necessary plugins and options:

```js
import { Calendar } from '@fullcalendar/core'
import bootstrapPlugin from '@fullcalendar/bootstrap'
import dayGridPlugin from '@fullcalendar/daygrid'

// import third-party stylesheets directly from your JS
import 'bootstrap/dist/css/bootstrap.css'
import '@fortawesome/fontawesome-free/css/all.css' // needs additional webpack config!

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    bootstrapPlugin,
    dayGridPlugin
  ],
  themeSystem: 'bootstrap', // important!
  initialView: 'dayGridMonth'
})

calendar.render()
```
