import { checkEventRendering } from './TimeGridEventRenderUtils'

describe('event rendering with minTime', function() {
  pushOptions({
    defaultView: 'agendaWeek',
    defaultDate: '2017-03-22',
    scrollTime: '00:00'
  })

  describe('when event is within negative minTime', function() {
    pushOptions({
      minTime: { hours: -2 },
      events: [
        { start: '2017-03-22T22:00:00', end: '2017-03-23T00:00:00' }
      ]
    })

    it('renders two event elements in the correct places', function() {
      initCalendar()
      var res = checkEventRendering(
        '2017-03-22T22:00:00',
        '2017-03-23T00:00:00'
      )
      expect(res.length).toBe(2)
      expect(res.isMatch).toBe(true)
    })
  })
})
