
# FullCalendar Bootstrap 5 Plugin

A [Bootstrap 5](https://getbootstrap.com/) theme for FullCalendar

## Installation

Requires **Bootstrap 5.3 or later**, whose color-modes system introduced the semantic color variables (such as `--bs-secondary-bg`, `--bs-tertiary-bg`, and `--bs-border-color`) that this theme relies on for its light/dark styling.

Also requires **[Bootstrap Icons](https://icons.getbootstrap.com/)** for its toolbar and control icons. The theme uses the icon-font (glyph) technique — referencing icons via `bi bi-*` classes — rather than inline SVGs, so the Bootstrap Icons font stylesheet must be loaded.

Install the FullCalendar vanilla-JS package, the Bootstrap 5 plugin, and Bootstrap 5 with its icon font:

```sh
npm install \
  @fullcalendar/bootstrap5 \
  fullcalendar \
  temporal-polyfill \
  bootstrap \
  bootstrap-icons
```

## Usage

Instantiate a Calendar with the necessary plugin:

```js
import { Calendar } from 'fullcalendar'
import dayGridPlugin from 'fullcalendar/daygrid'
import bootstrapPlugin from '@fullcalendar/bootstrap5'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'fullcalendar/skeleton.css'
import '@fullcalendar/bootstrap5/theme.css'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    bootstrapPlugin,
    dayGridPlugin
  ],
  initialView: 'dayGridMonth'
})

calendar.render()
```
