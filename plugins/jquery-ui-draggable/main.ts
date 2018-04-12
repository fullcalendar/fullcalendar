import * as $ from 'jquery'
import { Calendar, ExternalDropping } from 'fullcalendar'

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


const origGetEmbeddedElData = ExternalDropping.getEmbeddedElData

ExternalDropping.getEmbeddedElData = function(el, name, shouldParseJson = false) {
  let val = $(el).data(name) // will automatically parse JSON

  if (val != null) {
    return val
  }

  return origGetEmbeddedElData.apply(ExternalDropping, arguments)
}
