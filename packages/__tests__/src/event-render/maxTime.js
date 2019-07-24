import { checkEventRendering } from './TimeGridEventRenderUtils'
import { directionallyTestSeg } from './DayGridEventRenderUtils'

describe('event rendering with maxTime', function() {
  pushOptions({
    defaultView: 'timeGridWeek',
    defaultDate: '2017-03-22',
    scrollTime: '00:00'
  })

  describe('when event is within extended maxTime', function() {
    pushOptions({
      maxTime: '26:00',
      events: [
        { start: '2017-03-22T00:00:00', end: '2017-03-22T02:00:00' }
      ]
    })

    it('renders two event elements in the correct places', function() {
      initCalendar()
      var res = checkEventRendering(
        '2017-03-22T00:00:00Z',
        '2017-03-22T02:00:00Z'
      )
      expect(res.length).toBe(2)
      expect(res.isMatch).toBe(true)
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4483
  it('displays events on the last day', function() {
    initCalendar({
      defaultView: 'dayGridWeek',
      maxTime: '20:00',
      events: [
        { start: '2017-03-19', end: '2017-03-26' }
      ]
    })

    directionallyTestSeg({
      firstCol: 0,
      lastCol: 6,
      isStart: true,
      isEnd: true
    }, 'ltr')
  })

})
