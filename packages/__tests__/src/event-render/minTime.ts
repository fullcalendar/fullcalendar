import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('slotMinTime', () => { // TODO: rename file
  pushOptions({
    initialView: 'timeGridWeek',
    initialDate: '2017-03-22',
    scrollTime: '00:00',
  })

  describe('event rendering', () => {
    describe('when event is within negative slotMinTime', () => {
      pushOptions({
        slotMinTime: { hours: -2 },
        events: [
          { start: '2017-03-22T22:00:00', end: '2017-03-23T00:00:00' },
        ],
      })

      it('renders two event elements in the correct places', () => {
        let calendar = initCalendar()
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let res = timeGridWrapper.checkEventRendering(
          '2017-03-22T22:00:00Z',
          '2017-03-23T00:00:00Z',
        )
        expect(res.length).toBe(2)
        expect(res.isMatch).toBe(true)
      })
    })
  })

  it('can be changed dynamically', () => {
    let calendar = initCalendar()
    currentCalendar.setOption('slotMinTime', '09:00')

    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    expect(timeGridWrapper.getTimeAxisInfo()[0].text).toBe('9am')
  })
})
