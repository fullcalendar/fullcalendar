import { checkEventRendering } from './TimeGridEventRenderUtils'

describe('event rendering with maxTime', function() {
  pushOptions({
    defaultView: 'agendaWeek',
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
        '2017-03-22T00:00:00',
        '2017-03-22T02:00:00'
      )
      expect(res.length).toBe(2)
      expect(res.isMatch).toBe(true)
    })
  })
})
