import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('fixedWeekCount', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2014-07-01', // has 5 weeks
  })

  describe('when true', () => {
    pushOptions({
      fixedWeekCount: true,
    })

    it('renders a 5-week month with 6 rows', () => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      expect(dayGridWrapper.getRowEls().length).toBe(6)
    })
  })

  describe('when false', () => {
    pushOptions({
      fixedWeekCount: false,
    })

    it('renders a 5-week month with 5 rows', () => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
      expect(dayGridWrapper.getRowEls().length).toBe(5)
    })
  });

  [true, false].forEach((bool) => {
    describe('regardless of value (' + bool + ')', () => {
      pushOptions({
        fixedWeekCount: bool,
        initialDate: '2014-08-01', // has 6 weeks
      })

      it('should render a 6-week month consistently', () => {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getRowEls().length).toBe(6)
      })
    })
  })
})
