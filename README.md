# FullCalendar

Full-sized drag & drop calendar in JavaScript

- [Project Website](https://fullcalendar.io/)
- [Documentation](https://fullcalendar.io/docs)
- [Changelog](CHANGELOG.md)
- [Support](https://fullcalendar.io/support)
- [License](LICENSE.md)
- [Roadmap](https://fullcalendar.io/roadmap)

Connectors:

- [React](https://fullcalendar.io/docs/react)
- [Angular](https://fullcalendar.io/docs/angular)
- [Vue](https://fullcalendar.io/docs/vue)
- [Preact](https://fullcalendar.io/docs/preact)
- [Web Component](https://fullcalendar.io/docs/web-component)
- [Salesforce LWC](https://fullcalendar.io/docs/salesforce-lwc)

## Installation

Install the FullCalendar vanilla-JS package and its `temporal-polyfill` peer dependency ([more info](https://fullcalendar.io/docs/temporal-polyfill)):

```sh
npm install fullcalendar temporal-polyfill
```

## Usage

Instantiate a Calendar with plugins and options:

```js
import { Calendar } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic'
import dayGridPlugin from 'fullcalendar/daygrid'
import interactionPlugin from 'fullcalendar/interaction'

import 'fullcalendar/skeleton.css'
import 'fullcalendar/themes/classic/theme.css'
import 'fullcalendar/themes/classic/palette.css'

const calendarEl = document.getElementById('calendar')
const calendar = new Calendar(calendarEl, {
  plugins: [
    classicThemePlugin,
    dayGridPlugin,
    interactionPlugin
  ],
  initialView: 'dayGridMonth',
  editable: true,
  events: [
    { title: 'Meeting', start: new Date() }
  ]
})

calendar.render()
```

## Calendar Systems

By default the calendar counts years, months and days with the Gregorian calendar. The
`calendarSystem` option switches it to the Jalali calendar, also known as the Persian or
Solar Hijri calendar:

```js
import faLocale from 'fullcalendar/locales/fa'

const calendar = new Calendar(calendarEl, {
  plugins: [classicThemePlugin, dayGridPlugin],
  initialView: 'dayGridMonth',
  calendarSystem: 'jalali',
  locale: faLocale
})
```

With `calendarSystem: 'jalali'`:

- A month view covers one Jalali month, so it is 29, 30 or 31 days long, depending on the
  month and on whether the year is a leap year.
- The month grid begins on the week that holds the first day of the Jalali month. The days
  before and after the month are marked as non-current, like in a Gregorian month view.
- The prev and next buttons move by one Jalali month, and the today button goes to the
  Jalali month that holds today.
- The title, the day numbers and the other date texts are formatted in the Jalali calendar.

The option only changes which calendar the dates are counted in. The text, and which day
starts the week, still come from `locale`, and the right-to-left layout still comes from
`direction`. A Persian calendar therefore normally sets `calendarSystem: 'jalali'` together
with the `fa` locale.

Event dates are not affected. They are given to the calendar, and read back from it, as
ordinary dates.

## Development

You must install this repo with [PNPM](https://pnpm.io/):

```
pnpm install
```

Available scripts (via `pnpm run <script>`):

- `build` - build production-ready dist files
- `dev` - build & watch development dist files
- `test` - test headlessly
- `test:dev` - test interactively
- `lint`
- `clean`

[Info about contributing code &raquo;](CONTRIBUTING.md)
