
# FullCalendar Preact

FullCalendar Preact package for rendering a calendar

## Installation

```sh
npm install @fullcalendar/preact temporal-polyfill
```

## Usage

Render a `FullCalendar` component with [options](https://fullcalendar.io/docs#toc), including one or more plugins:

```jsx
import FullCalendar from '@fullcalendar/preact'
import classicThemePlugin from '@fullcalendar/preact/themes/classic'
import dayGridPlugin from '@fullcalendar/preact/daygrid'

import '@fullcalendar/preact/skeleton.css'
import '@fullcalendar/preact/themes/classic/theme.css'
import '@fullcalendar/preact/themes/classic/palette.css'

<FullCalendar
  plugins={[
    dayGridPlugin,
    classicThemePlugin,
    // any other plugins
  ]}
  initialView='dayGridMonth'
  weekends={false}
  events={[
    { title: 'Meeting', start: new Date() },
  ]}
/>
```

## Plugins

| Import                             | Provides                                     |
| ---------------------------------- | -------------------------------------------- |
| `@fullcalendar/preact/daygrid`     | `dayGridDay`/`Week`/`Month`/`Year` views     |
| `@fullcalendar/preact/timegrid`    | `timeGridDay`/`Week` views                   |
| `@fullcalendar/preact/list`        | `listDay`/`Week`/`Month`/`Year` views        |
| `@fullcalendar/preact/multimonth`  | `multiMonthYear` view                        |
| `@fullcalendar/preact/interaction` | dragging, resizing, and date/event selection |

Themes are plugins too. `@fullcalendar/preact/themes/classic`, `/monarch`, `/breezy`, `/forma`, and `/pulse` are available, each paired with a `theme.css` and a palette stylesheet.

## Links

- [Preact Documentation](https://fullcalendar.io/docs/preact)
- [Preact Scheduler Documentation](https://fullcalendar.io/docs/preact#fullcalendar-premium)
- [Preact Example Project](https://github.com/fullcalendar/fullcalendar-examples/tree/main/preact)
- [Options Reference](https://fullcalendar.io/docs#toc)
