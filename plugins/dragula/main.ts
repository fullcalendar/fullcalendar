import * as dragula from 'dragula'
import * as FullCalendar from 'fullcalendar'


let visibleCalendars = []

FullCalendar.Calendar.on('initialRender', function(calendar) {
  visibleCalendars.push(calendar)

  calendar.one('destroy', function() {
    FullCalendar.removeExact(visibleCalendars, calendar)
  })
})


let recentEvent

[
  'mousedown',
  'touchstart',
  'pointerdown'
].forEach(function(eventName) {
  document.addEventListener(eventName, function(ev) {
    recentEvent = ev
  })
})


function constructDragula(...args) {
  let drake = dragula.apply(window, args)

  drake.on('drag', function(draggingEl) { // dragging started
    for (let calendar of visibleCalendars) {
      calendar.handlExternalDragStart(
        recentEvent,
        draggingEl,
        false // have FullCalendar watch for mouse/touch events
          // because dragula doesn't expose a 'move' event
      )
    }
  })

  return drake
}


(FullCalendar as any).dragula = constructDragula
export default constructDragula
