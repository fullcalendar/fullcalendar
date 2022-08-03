
# FullCalendar Web Component

This package provides a FullCalendar [Web Component] (aka "Custom Element") that accepts a single
`options` attribute. It must be a valid JSON string.

```html
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8' />
<script src='<SOME-CDN>/@fullcalendar/web-component/main.global.js'></script>
<script src='<SOME-CDN>/@fullcalendar/daygrid/main.global.js'></script>
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

It is also possible to set an `options` *property* on the DOM element. This property is a rich
JavaScript object, not merely a JSON string.

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

[Web Component]: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
