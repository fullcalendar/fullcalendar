
# FullCalendar Preact

FullCalendar Preact package for rendering a calendar

## Installation

```sh
npm install @fullcalendar/preact temporal-polyfill
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
import { Calendar } from '@fullcalendar/preact'
import classicThemePlugin from '@fullcalendar/preact/themes/classic'
import dayGridPlugin from '@fullcalendar/preact/daygrid'

import '@fullcalendar/preact/skeleton.css'
import '@fullcalendar/preact/themes/classic/theme.css'
import '@fullcalendar/preact/themes/classic/palette.css'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    dayGridPlugin,
    classicThemePlugin,
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
