import * as $ from 'jquery'
import { Calendar } from 'fullcalendar'

let $document = $(document)

Calendar.on('initialRender', function(calendar) {

  const handleDragStart = function(ev, ui) {

    const handleDragMove = (ev, ui) => {
      if (calendar.view) {
        calendar.view.handleExternalDragMove(ev)
      }
    }
    const handleDragStop = (ev, ui) => {
      if (calendar.view) {
        calendar.view.handleExternalDragStop(ev)
      }
      $document
        .off('drag', handleDragMove)
        .off('dragstop', handleDragStop)
    }

    $document
      .on('drag', handleDragMove)
      .on('dragstop', handleDragStop)

    if (calendar.view) {
      const el = ((ui && ui.item) ? ui.item[0] : null) || ev.target
      calendar.view.handlExternalDragStart(
        ev.originalEvent,
        el,
        ev.name === 'dragstart' // don't watch mouse/touch movements if doing jqui drag (not sort)
      )
    }

  }

  $document.on('dragstart sortstart', handleDragStart)

  calendar.on('destroy', function(calendar) {
    $document.off('dragstart sortstart', handleDragStart)
  })
})
