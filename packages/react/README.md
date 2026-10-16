
# FullCalendar React

FullCalendar React package for rendering a calendar

## Installation

```sh
npm install @fullcalendar/react temporal-polyfill
```

## Coming from v6?

In v7, plugins like dayGrid and timeGrid are part of this package, imported from subpaths like `@fullcalendar/react/daygrid`. The separate `@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/interaction` (etc.) packages are FullCalendar v6. Don't install them with v7, and don't downgrade to v6: uninstall them and import plugins from `@fullcalendar/react/daygrid`. See the [upgrade guide](https://fullcalendar.io/docs/upgrading-from-v6).

## Usage

Render a `FullCalendar` component with [options](https://fullcalendar.io/docs#toc), including one or more plugins:

```jsx
import FullCalendar from '@fullcalendar/react'
import classicThemePlugin from '@fullcalendar/react/themes/classic'
import dayGridPlugin from '@fullcalendar/react/daygrid'

import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/classic/theme.css'
import '@fullcalendar/react/themes/classic/palette.css'

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

| Import                            | Provides                                     |
| --------------------------------- | -------------------------------------------- |
| `@fullcalendar/react/daygrid`     | `dayGridDay`/`Week`/`Month`/`Year` views     |
| `@fullcalendar/react/timegrid`    | `timeGridDay`/`Week` views                   |
| `@fullcalendar/react/list`        | `listDay`/`Week`/`Month`/`Year` views        |
| `@fullcalendar/react/multimonth`  | `multiMonthYear` view                        |
| `@fullcalendar/react/interaction` | dragging, resizing, and date/event selection |

Themes are plugins too. `@fullcalendar/react/themes/classic`, `/monarch`, `/breezy`, `/forma`, and `/pulse` are available, each paired with a `theme.css` and a palette stylesheet.

## Links

- [React Documentation](https://fullcalendar.io/docs/react)
- [React Scheduler Documentation](https://fullcalendar.io/docs/react#fullcalendar-premium)
- [React Example Project](https://github.com/fullcalendar/fullcalendar-examples/tree/main/react19)
- [Options Reference](https://fullcalendar.io/docs/all)
