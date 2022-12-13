
# FullCalendar Bootstrap 5 Plugin

[Bootstrap 5](https://getbootstrap.com/) theme for [FullCalendar](https://fullcalendar.io)

## Installation

First, ensure you have the necessary Bootstrap packages installed:

```sh
npm install bootstrap bootstrap-icons
```

Then, install the FullCalendar core package, the Bootstrap plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/core @fullcalendar/bootstrap5 @fullcalendar/daygrid
```

## Usage

Instantiate a Calendar with the correct plugins and options:

```js
import { Calendar } from '@fullcalendar/core'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import dayGridPlugin from '@fullcalendar/daygrid'

// import bootstrap stylesheets directly from your JS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css' // needs additional webpack config!

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    bootstrap5Plugin,
    dayGridPlugin
  ],
  themeSystem: 'bootstrap5', // don't forget this!
  initialView: 'dayGridMonth'
})

calendar.render()
```
