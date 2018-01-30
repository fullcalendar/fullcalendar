import { getRectCenter, intersectRects } from '../lib/geom'
import * as EventRenderUtils from '../event-render/EventRenderUtils'

/*
TODO: Don't rely on legacy simulateDrag
Given the rectangles of the origin and destination
slot or day area.
*/
export function drag(rect0, rect1, debug) {
  var el = EventRenderUtils.getSingleEl()
  var elRect = el[0].getBoundingClientRect()
  var point0 = getRectCenter(
    intersectRects(elRect, rect0)
  )
  var point1 = getRectCenter(rect1)
  var deferred = $.Deferred()

  el.simulate('drag', {
    point: point0,
    end: point1,
    debug: debug
  })

  currentCalendar.on('eventDragStop', function() {
    setTimeout(function() {
      deferred.resolve({ isSuccess: false }) // won't do anything if already eventDrop
    }, 200) // will happen after eventDrop's timeout
  })

  currentCalendar.on('eventDrop', function(event) { // always called after eventDragStop, if success
    setTimeout(function() {
      deferred.resolve({ isSuccess: true, event: event })
    }, 100) // will happen first
  })

  return deferred.promise()
}

// makes the setTimeout's work.
// also makes the tests faster.
pushOptions({
  dragRevertDuration: 0
})
