
# FullCalendar Web Component

FullCalendar [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) package for rendering a calendar

## Installation

```sh
npm install @fullcalendar/web-component temporal-polyfill
```

## Usage

Render a `FullCalendar` component with [options](https://fullcalendar.io/docs#toc), including one or more plugins:

```js
// globally installs the <full-calendar> tag
import '@fullcalendar/web-component/global'

// plugins
import themePlugin from '@fullcalendar/web-component/themes/monarch' // YOUR THEME
import dayGridPlugin from '@fullcalendar/web-component/daygrid'

// stylesheets
import '@fullcalendar/web-component/skeleton.styles' // ALWAYS NEED SKELETON
import '@fullcalendar/web-component/themes/monarch/theme.styles' // YOUR THEME
import '@fullcalendar/web-component/themes/monarch/palettes/purple.css' // YOUR THEME'S PALETTE

// initialize with options and plugins
const fullCalendarElement = document.querySelector('full-calendar')
fullCalendarElement.options = {
  plugins: [themePlugin, dayGridPlugin],
  initialView: 'dayGridMonth',
  weekends: false,
  events: [
    { title: 'Meeting', start: new Date() }
  ]
}
```

Please note, `skeleton.styles` and `theme.styles` are JS, and yes they do inject CSS. This is required for the web component’s shadow DOM.

Then, in your HTML:

```html
<full-calendar></full-calendar>
```

## Plugins

| Import                                    | Provides                                     |
| ----------------------------------------- | -------------------------------------------- |
| `@fullcalendar/web-component/daygrid`     | `dayGridDay`/`Week`/`Month`/`Year` views     |
| `@fullcalendar/web-component/timegrid`    | `timeGridDay`/`Week` views                   |
| `@fullcalendar/web-component/list`        | `listDay`/`Week`/`Month`/`Year` views        |
| `@fullcalendar/web-component/multimonth`  | `multiMonthYear` view                        |
| `@fullcalendar/web-component/interaction` | dragging, resizing, and date/event selection |

Themes are plugins too. `@fullcalendar/web-component/themes/classic`, `/monarch`, `/breezy`, `/forma`, and `/pulse` are available, each paired with a `theme.styles` module and a palette stylesheet.

## Links

- [Web Component Documentation](https://fullcalendar.io/docs/web-component)
- [Web Component Scheduler Documentation](https://fullcalendar.io/docs/web-component#fullcalendar-premium)
- [Options Reference](https://fullcalendar.io/docs#toc)
