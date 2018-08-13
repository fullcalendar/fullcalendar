import { getRectCenter, getRectTopLeft, subtractPoints, addPoints } from '../lib/geom'
import * as EventRenderUtils from '../event-render/EventRenderUtils'


export function resize(rect0, rect1, debug) {
  var eventEl = EventRenderUtils.getSingleEl()

  eventEl.simulate('mouseover') // so that resize handle is revealed

  var resizerEl = eventEl.find('.fc-resizer')
  var resizerRect = resizerEl[0].getBoundingClientRect()
  var resizerCenter = getRectCenter(resizerRect)

  var vector = subtractPoints(
    resizerCenter,
    getRectTopLeft(rect0)
  )
  var point1 = addPoints(
    getRectTopLeft(rect1),
    vector
  )
  var deferred = $.Deferred()

  resizerEl.simulate('drag', {
    point: resizerCenter,
    end: point1,
    debug: debug
  })

  currentCalendar.on('eventResizeStop', function() {
    setTimeout(function() {
      deferred.resolve(false) // won't do anything if already eventResize
    }, 0) // will happen after eventResize's timeout
  })

  currentCalendar.on('eventMutation', function(arg) { // always called after eventDragStop, if success
    deferred.resolve(arg) // will happen first
  })

  return deferred.promise()
}
