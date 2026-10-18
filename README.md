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
