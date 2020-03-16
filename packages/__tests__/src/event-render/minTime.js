import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('slotMinTime', function() { // TODO: rename file
  pushOptions({
    defaultView: 'timeGridWeek',
    defaultDate: '2017-03-22',
    scrollTime: '00:00'
  })

  describe('event rendering', function() {

    describe('when event is within negative slotMinTime', function() {
      pushOptions({
        slotMinTime: { hours: -2 },
        events: [
          { start: '2017-03-22T22:00:00', end: '2017-03-23T00:00:00' }
        ]
      })

      it('renders two event elements in the correct places', function() {
        let calendar = initCalendar()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let res = timeGridWrapper.checkEventRendering(
          '2017-03-22T22:00:00Z',
          '2017-03-23T00:00:00Z'
        )
        expect(res.length).toBe(2)
        expect(res.isMatch).toBe(true)
      })
    })
  })

  it('can be changed dynamically', function() {
    let calendar = initCalendar()
    currentCalendar.setOption('slotMinTime', '09:00')

    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    expect(timeGridWrapper.getTimeAxisInfo()[0].text).toBe('9am')
  })
})
