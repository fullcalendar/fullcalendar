
# FullCalendar Standard Bundle

Easily render a full-sized drag & drop calendar with a combination of standard plugins

This `fullcalendar` package bundles these plugins:

- [@fullcalendar/core](https://github.com/fullcalendar/fullcalendar/tree/main/packages/core)
- [@fullcalendar/interaction](https://github.com/fullcalendar/fullcalendar/tree/main/packages/interaction)
- [@fullcalendar/daygrid](https://github.com/fullcalendar/fullcalendar/tree/main/packages/daygrid)
- [@fullcalendar/timegrid](https://github.com/fullcalendar/fullcalendar/tree/main/packages/timegrid)
- [@fullcalendar/list](https://github.com/fullcalendar/fullcalendar/tree/main/packages/list)

## Usage with CDN or ZIP archive

Load the `index.global.min.js` file and use the `FullCalendar` global namespace:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar/index.global.min.js'></script>
    <script>

      document.addEventListener('DOMContentLoaded', function() {
        const calendarEl = document.getElementById('calendar')
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth'
        })
        calendar.render()
      })

    </script>
  </head>
  <body>
    <div id='calendar'></div>
  </body>
</html>
```

## Usage with NPM and ES modules

```sh
npm install fullcalendar
```

```js
import { Calendar } from 'fullcalendar'

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar')
  const calendar = new Calendar(calendarEl, {
    initialView: 'dayGridMonth'
  })
  calendar.render()
})
```
