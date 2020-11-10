import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('rerendering a calendar', () => {
  it('keeps sizing', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2019-08-08',
      dayMaxEventRows: 3,
      events: [
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
      ],
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    expect(dayGridWrapper.getMoreEls().length).toBe(1)

    calendar.render()
    expect(dayGridWrapper.getMoreEls().length).toBe(1) // good way to test that sizing is maintained
  })
})
