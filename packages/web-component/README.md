
# FullCalendar Web Component

This package provides a FullCalendar [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (aka "Custom Element").


## Installing via NPM

Install the core package, the web-component package, and any plugins you plan to use:

```sh
npm install --save \
  @fullcalendar/core \
  @fullcalendar/web-component \
  @fullcalendar/daygrid
```

Then, either register the element globally under its default tag name of `<full-calendar />`:

```js
import '@fullcalendar/web-component/global'
```

Or, customize the tag name:

```js
import { FullCalendarElement } from '@fullcalendar/web-component'

customElements.define('some-calendar-tag', FullCalendarElement);
```

## Installing via CDN

Include script tags for the core package, the web-component package, and any plugins you plan to use:

```html
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8' />
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/web-component/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid/index.global.min.js'></script>
</head>
<body>

  <full-calendar shadow options='{
    "headerToolbar": {
      "left": "prev,next today",
      "center": "title",
      "right": "dayGridMonth,dayGridWeek,dayGridDay"
    }
  }' />

</body>
</html>
```


## Options

The full-calendar element accepts a single `options` attribute. It must be a valid JSON string.

The `shadow` attribute is necessary for rendering the calendar within its own shadow DOM (added in v6.1.0). This is recommended.

It is possible to set an `options` *property* on the DOM element. This property is a real JavaScript object, not merely a JSON string.

```js
const fullCalendarElement = document.querySelector('full-calendar')

fullCalendarElement.options = {
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek,dayGridDay'
  }
}
```
