
# FullCalendar Web Component

This package provides a FullCalendar [Web Component](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) (aka "Custom Element") that accepts a single `options` attribute. It must be a valid JSON string.

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

  <full-calendar options='{
    "headerToolbar": {
      "left": "prev,next today",
      "center": "title",
      "right": "dayGridMonth,dayGridWeek,dayGridDay"
    }
  }' />

</body>
</html>
```

It is also possible to set an `options` *property* on the DOM element. This property is a real JavaScript object, not merely a JSON string.

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
