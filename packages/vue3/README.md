
# FullCalendar Vue 3 Component

FullCalendar Vue package for rendering a calendar

## Installation

```sh
npm install @fullcalendar/vue3 temporal-polyfill
```

## Usage

Render a `FullCalendar` component with [options](https://fullcalendar.io/docs#toc), including one or more plugins:

```vue
<script>
import FullCalendar from '@fullcalendar/vue3'
import classicThemePlugin from '@fullcalendar/vue3/themes/classic'
import dayGridPlugin from '@fullcalendar/vue3/daygrid'

import '@fullcalendar/vue3/skeleton.css'
import '@fullcalendar/vue3/themes/classic/theme.css'
import '@fullcalendar/vue3/themes/classic/palette.css'

export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  data: function() {
    return {
      calendarOptions: {
        plugins: [classicThemePlugin, dayGridPlugin],
        initialView: 'dayGridMonth',
        weekends: false,
        events: [
          { title: 'Meeting', start: new Date() }
        ]
      }
    }
  }
}
</script>

<template>
  <h1>Demo App</h1>
  <FullCalendar :options='calendarOptions' />
</template>
```

You can even supply [named-slot](https://vuejs.org/guide/components/slots.html#named-slots) templates:

```vue
<template>
  <h1>Demo App</h1>
  <FullCalendar :options='calendarOptions'>
    <template v-slot:eventContent='arg'>
      <b>{{ arg.timeText }}</b>
      <i>{{ arg.event.title }}</i>
    </template>
  </FullCalendar>
</template>
```

## Plugins

| Import                           | Provides                                     |
| -------------------------------- | -------------------------------------------- |
| `@fullcalendar/vue3/daygrid`     | `dayGridDay`/`Week`/`Month`/`Year` views     |
| `@fullcalendar/vue3/timegrid`    | `timeGridDay`/`Week` views                   |
| `@fullcalendar/vue3/list`        | `listDay`/`Week`/`Month`/`Year` views        |
| `@fullcalendar/vue3/multimonth`  | `multiMonthYear` view                        |
| `@fullcalendar/vue3/interaction` | dragging, resizing, and date/event selection |

Themes are plugins too. `@fullcalendar/vue3/themes/classic`, `/monarch`, `/breezy`, `/forma`, and `/pulse` are available, each paired with a `theme.css` and a palette stylesheet.

## Links

- [Vue Documentation](https://fullcalendar.io/docs/vue)
- [Vue Scheduler Documentation](https://fullcalendar.io/docs/vue#fullcalendar-premium)
- [Vue Example Project](https://github.com/fullcalendar/fullcalendar-examples/tree/main/vue3)
- [Options Reference](https://fullcalendar.io/docs#toc)
