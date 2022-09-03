import { getRectCenter, intersectRects } from './geom'
import { CalendarWrapper } from './wrappers/CalendarWrapper'

/*
TODO: Don't rely on legacy simulateDrag
Given the rectangles of the origin and destination
slot or day area.
*/
export function drag(rect0, rect1, debug?) {
  let eventEl = new CalendarWrapper(currentCalendar).getFirstEventEl()

  let eventRect = eventEl.getBoundingClientRect()
  let point0 = getRectCenter(
    intersectRects(eventRect, rect0),
  )
  let point1 = getRectCenter(rect1)
  let deferred = $.Deferred()

  $(eventEl).simulate('drag', {
    point: point0,
    end: point1,
    debug,
  })

  currentCalendar.on('eventDrop', (arg) => {
    deferred.resolve(arg)
  })

  currentCalendar.on('_noEventDrop', () => {
    deferred.resolve(false)
  })

  return deferred.promise()
}

// makes the setTimeout's work.
// also makes the tests faster.
pushOptions({
  dragRevertDuration: 0,
})
