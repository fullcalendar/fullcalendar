
# FullCalendar Vue 3 Component

The official [Vue 3](https://vuejs.org/) component for [FullCalendar](https://fullcalendar.io)

## Installation

Install the Vue 3 connector, the core package, and any plugins (like [daygrid](https://fullcalendar.io/docs/month-view)):

```sh
npm install @fullcalendar/vue3 temporal-polyfill
```

## Usage

Render a `FullCalendar` component, supplying an [options](https://fullcalendar.io/docs#toc) object:

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

## Links

- [Documentation](https://fullcalendar.io/docs/vue)
- [Example Project](https://github.com/fullcalendar/fullcalendar-examples/tree/main/vue3)

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
- `clean`
