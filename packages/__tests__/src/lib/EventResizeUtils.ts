import { getRectCenter, subtractPoints, addPoints } from './geom'
import { CalendarWrapper } from './wrappers/CalendarWrapper'


export function resize(point0, point1, fromStart?, debug?) {
  var eventEl = new CalendarWrapper(currentCalendar).getFirstEventEl()

  var $resizerEl = $(eventEl).find(
    '.' + (fromStart ? CalendarWrapper.EVENT_START_RESIZER_CLASSNAME : CalendarWrapper.EVENT_END_RESIZER_CLASSNAME)
  ).css('display', 'block') // usually only displays on hover. force display

  var resizerRect = $resizerEl[0].getBoundingClientRect()
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

  $resizerEl.simulate('drag', {
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
