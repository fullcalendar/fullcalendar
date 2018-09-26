import { getRectCenter, getRectTopLeft, subtractPoints, addPoints } from '../lib/geom'
import * as EventRenderUtils from '../event-render/EventRenderUtils'


export function resize(rect0, rect1, fromStart, debug) {
  var eventEl = EventRenderUtils.getSingleEl()

  eventEl.simulate('mouseover') // so that resize handle is revealed

  var resizerEl = eventEl.find(fromStart ? '.fc-start-resizer' : '.fc-end-resizer')
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

  currentCalendar.on('eventResize', function(arg) {
    deferred.resolve(arg)
  })

  currentCalendar.on('_noEventResize', function() {
    deferred.resolve(false)
  })

  return deferred.promise()
}
