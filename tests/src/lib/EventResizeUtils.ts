import { getRectCenter, subtractPoints, addPoints } from './geom.js'
import { CalendarWrapper } from './wrappers/CalendarWrapper.js'

export function resize(point0, point1, fromStart?, debug?) {
  let eventEl = new CalendarWrapper(currentCalendar).getFirstEventEl()

  let $resizerEl = $(eventEl).find(
    '.' + (fromStart ? CalendarWrapper.EVENT_START_RESIZER_CLASSNAME : CalendarWrapper.EVENT_END_RESIZER_CLASSNAME),
  ).css('display', 'block') // usually only displays on hover. force display

  let resizerRect = $resizerEl[0].getBoundingClientRect()
  let resizerCenter = getRectCenter(resizerRect)

  let vector = subtractPoints(
    resizerCenter,
    point0,
  )
  let endPoint = addPoints(
    point1,
    vector,
  )
  let deferred = $.Deferred()

  $resizerEl.simulate('drag', {
    point: resizerCenter,
    end: endPoint,
    debug,
  })

  currentCalendar.on('eventResize', (arg) => {
    deferred.resolve(arg)
  })

  currentCalendar.on('_noEventResize', () => {
    deferred.resolve(false)
  })

  return deferred.promise()
}
