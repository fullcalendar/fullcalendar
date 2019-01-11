import { getRectCenter, subtractPoints, addPoints } from '../lib/geom'
import * as EventRenderUtils from '../event-render/EventRenderUtils'


export function resize(point0, point1, fromStart, debug) {
  var eventEl = EventRenderUtils.getSingleEl()

  eventEl.simulate('mouseover') // so that resize handle is revealed

  var resizerEl = eventEl.find(fromStart ? '.fc-start-resizer' : '.fc-end-resizer')
  var resizerRect = resizerEl[0].getBoundingClientRect()
  var resizerCenter = getRectCenter(resizerRect)

  var vector = subtractPoints(
    resizerCenter,
    point0
  )
  var endPoint = addPoints(
    point1,
    vector
  )
  var deferred = $.Deferred()

  resizerEl.simulate('drag', {
    point: resizerCenter,
    end: endPoint,
    debug: debug
  })

  currentCalendar.on('eventResize', function(arg) {
    deferred.resolve(arg)
  })

  currentCalendar.on('_noEventResize', function() {
    deferred.resolve(false)
  })

  return deferred.promise()
}
