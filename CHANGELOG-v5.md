
# V5 Changelog and Breaking Changes

Version 5 is still in development. This document explains the currently-implemented changes to the API.


## Major NEW Features

- horizontal scrolling in daygrid/timegrid view (#3022)
  - Activate by setting the new `columnMinWidth` option to a non-zero integer and including `@fullcalendar/scrollgrid` plugin.
    If you are using a bundle or a ZIP build, no need to include this plugin.
  - In the ZIP, see the following demos: `timegrid-views-hscroll.html` and `vertical-resource-view.html`
- vertically expand rows in timegrid view (#265) and resource-timeline view (#4897)
  - Activate by setting the new `expandRows` option to `true`.
  - In the ZIP, see the following demos: `full-height.html` and `timeline-full-height.html`
- The CSS, DOM structure, and classNames have been refactored. More information to come.


## Changes for ALL handlers

Nearly all callback settings in the API receive an `arg` argument that contains a `view` property that represents the current view. Previously, this object had a number of exposed properties and methods that were intended to be internal. Now, it is a *plain object* that ONLY contains the following properties:

```js
{
  type, // string
  title, // string
  activeStart // date
  activeEnd // date
  currentStart // date
  currentEnd // date
}
```

All of these properties were available in v4.


## Calendar Height

The `height` setting can no longer be set to `'parent'`. Instead, set it to `'100%'`. Any other CSS-based string values are accepted as well.

The `height` and `contentHeight` settings no longer accept **functions** to be called when the calendar's height needs to be recomputed. Instead, take an imperative approach by setting the options directly when you need the height to change:

```js
calendar.setOption('height', 650)
// or
calendar.setOption('contentHeight', 500)
```


## View Rendering

<del><strong>viewSkeletonRender</strong></del> renamed to `viewDidMount`

<del><strong>viewSkeletonDestroy</strong></del> renamed to `viewWillUnmount`

When switching between views that share the same type, the view will not be torn down and rebuilt, but rather the existing DOM will be reused. For example, if you switch from `dayGridDay` to `dayGridWeek`, some of the `<td>` cells will be preserved.


## Date Rendering

<del><strong>datesRender</strong></del> removed. Called after all dates within a view were added to the DOM.

<del><strong>datesDestroy</strong></del> removed. Called before all dates within a view were removed from the DOM.

<del><strong>dayRender</strong></del> removed. Used for custom rendering of date cells via direct manipulation of the `arg.el` DOM element. Use the following new callbacks instead:

```js
// called after a day element is added to the DOM
// the `el` reference will remain the same, however, its contents might change in the future
// useful for attaching handlers to `el`
dateDidMount: function(arg) {
  console.log(arg.date); // a Date object
  console.log(arg.el); // an HTMLElement
  console.log(arg.view); // the current View object

  // cannot return anything
},

// determines the classNames on the day's `el`
// called when the day element is created AND every time it is updated
// these classNames will be in addition the stock classNames such as 'fc-day'
dateClassNames: function(arg) {
  console.log(arg.date); // a Date object
  console.log(arg.isToday, arg.isPast, arg.isFuture, arg.isOther); // booleans
  console.log(arg.view); // the current View object

  return [ 'customclass' ]; // return a string or array of strings
},

// determines the DOM content within the `el`
// called when the day element is created AND every time it is updated
dateInnerContent: function(arg) {
  console.log(arg.date); // a Date object
  console.log(arg.isToday, arg.isPast, arg.isFuture, arg.isOther); // booleans
  console.log(arg.view); // the current View object

  // can return...
  return 'some text';
  return { html: 'some html' };
  return { domNodes: [ document.createElement('div') ] };
  return JSX; // more information to come
}
```


## Event Rendering

Previously, whenever any small piece of event data was modified, ALL events were rerendered. NOW, only the affected event(s) will be rerendered. (#3003)

<del><strong>eventRender</strong></del> removed. Used for custom rendering of events via direct manipulation of the `arg.el` DOM element. Use the following callbacks instead:

```js
// called after an event element is added to the DOM
// the `el` reference will remain the same, however, its contents might change in the future
// useful for attaching handlers to `el`
eventDidMount: function(arg) {
  console.log(arg.event); // an Event object (with title, start, end, etc)
  console.log(arg.el); // an HTMLElement
  console.log(arg.view); // the current View object

  // cannot return anything
},

// determines the classNames on the event's `el`
// called when the event element is created AND every time it is updated
// these classNames will be in addition the stock classNames such as 'fc-event'
eventClassNames: function(arg) {
  console.log(arg.event); // an Event object (with title, start, end, etc)
  console.log(arg.timeText); // string
  console.log(arg.isStart, arg.isEnd); // booleans
  console.log(arg.isPast, arg.isFuture, arg.isToday); // booleans
  console.log(arg.isDraggable, arg.isStartResizable, arg.isEndResizable); // booleans
  console.log(arg.isMirror, arg.isDragging, arg.isResizing, arg.isSelected); // booleans
  console.log(arg.view); // the current View object

  return [ 'customclass' ]; // return a string or array of strings
},

// determines the DOM content within the `el`
// called when the event element is created AND every time it is updated
// you do not need to include certain other vital elements, such as resizers
eventInnerContent: function(arg) {
  console.log(arg.event); // an Event object (with title, start, end, etc)
  console.log(arg.timeText); // string
  console.log(arg.isStart, arg.isEnd); // booleans
  console.log(arg.isPast, arg.isFuture, arg.isToday); // booleans
  console.log(arg.isDraggable, arg.isStartResizable, arg.isEndResizable); // booleans
  console.log(arg.isMirror, arg.isDragging, arg.isResizing, arg.isSelected); // booleans
  console.log(arg.view); // the current View object

  // can return...
  return 'some text';
  return { html: 'some html' };
  return { domNodes: [ document.createElement('div') ] };
  return JSX; // more information to come
}
```

<del><strong>eventDestroy</strong></del> renamed to `eventWillUnmount`

<del><strong>eventPositioned</strong></del> removed

<del><strong>Calendar::rerenderEvents</strong></del> method removed. Call the generic `Calendar::render()` method after initialization instead.


## Resource Rendering

<del><strong>resourceLabelText</strong></del> removed. Determines the "Resources" text at the top of resource-timeline view. Use `resourceHeaderInnerContent` instead, which can accept the following values:

```js
'some text'
{ html: 'some html' }
{ domNodes: [ document.createElement('div') ] }
JSX // more information to come
```

<del><strong>resourceRender</strong></del> removed. Used for custom rendering of each resource's title via direct manipulation of the `arg.el` DOM element Use the following callbacks instead:

```js
// called after each resource label is added to the DOM
// the `el` reference will remain the same, however, its contents might change in the future
// useful for attaching handlers to `el`
resourceLabelDidMount: function(arg) {
  console.log(arg.resource); // a Resource object
  console.log(arg.el); // an HTMLElement
  console.log(arg.view); // the current View object

  // cannot return anything
},

// determines the DOM content within the `el`
// called when the resource label element is created AND every time it is updated
resourceLabelInnerContent: function(arg) {
  console.log(arg.resource); // a Resource object
  console.log(arg.view); // the current View object

  // can return...
  return 'some text';
  return { html: 'some html' };
  return { domNodes: [ document.createElement('div') ] };
  return JSX; // more information to come
}
```

<del><strong>resourceText</strong></del> removed as well. Use `resourceLabelInnerContent` instead.

There is a new callback `resourceLabelWillUnmount`.

The <del><strong>resourceGroupText</strong></del> callback has been removed.

The `resourceColumns` option accepts an array of objects. Some of the properties within each object has changed:

- <del><strong>labelText</strong></del> removed. Use `headerInnerContent` instead. Accepts the same argument as `resourceHeaderInnerContent`
- <del><strong>text</strong></del> and <del><strong>render</strong></del> removed. Use `innerContent` instead. Accepts the same argument as `resourceLabelInnerContent`.

<del><strong>Calendar::rerenderResources</strong></del> method removed. Call the generic `Calendar::render()` method after initialization instead.


## Week Numbers

The <del><strong>weekNumbersWithinDays</strong></del> setting has been removed and its behavior has become the *default*. In the daygrid view, the week numbers are always rendered as a little square in the corner of the first day of the week. They are no longer rendered in their own skinny column.
