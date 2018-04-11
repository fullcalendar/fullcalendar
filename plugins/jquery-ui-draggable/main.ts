import * as $ from 'jquery'
import { Calendar } from 'fullcalendar'

let $document = $(document)

Calendar.on('initialRender', function(calendar) {

  const handleDragStart = function(ev, ui) {

    const handleDragMove = (ev, ui) => {
      calendar.handleExternalDragMove(ev)
    }

    const handleDragStop = (ev, ui) => {
      calendar.handleExternalDragStop(ev)
      $document
        .off('drag', handleDragMove)
        .off('dragstop', handleDragStop)
    }

    $document
      .on('drag', handleDragMove)
      .on('dragstop', handleDragStop)

    calendar.handlExternalDragStart(
      ev.originalEvent,
      ((ui && ui.item) ? ui.item[0] : null) || ev.target,
      ev.name === 'dragstart' // don't watch mouse/touch movements if doing jqui drag (not sort)
    )
  }

  $document.on('dragstart sortstart', handleDragStart)

  calendar.one('destroy', function(calendar) {
    $document.off('dragstart sortstart', handleDragStart)
  })
})
