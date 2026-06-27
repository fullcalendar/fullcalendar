
# FullCalendar Luxon 3 Date-Formatting Plugin

Enhanced date formatting with [Luxon](https://moment.github.io/luxon/) 3

## Installation

First, ensure Luxon is installed:

```sh
npm install luxon@3
```

Then, install the FullCalendar core package, the Luxon plugin, and any other plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install fullcalendar @fullcalendar/format-luxon3 temporal-polyfill
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic'
import dayGridPlugin from 'fullcalendar/daygrid'
import luxon3Plugin from '@fullcalendar/format-luxon3'

import 'fullcalendar/skeleton.css'
import 'fullcalendar/themes/classic/theme.css'
import 'fullcalendar/themes/classic/palette.css'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    luxon3Plugin,
    dayGridPlugin,
    classicThemePlugin
  ],
  initialView: 'dayGridMonth',
  titleFormat: 'LLLL d, yyyy', // use Luxon format strings
})

calendar.render()
```
