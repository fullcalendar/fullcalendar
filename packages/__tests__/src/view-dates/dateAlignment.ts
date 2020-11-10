import { expectActiveRange } from '../lib/ViewDateUtils'

/*
SEE ALSO: next/prev
*/
describe('dateAlignment', () => {
  describe('when week alignment', () => {
    pushOptions({
      initialView: 'timeGrid',
      dateAlignment: 'week',
      initialDate: '2017-06-15',
    })

    describe('when 3 day duration', () => {
      pushOptions({
        duration: { days: 3 },
      })

      it('aligns with the week', () => {
        initCalendar()
        expectActiveRange('2017-06-11', '2017-06-14')
      })
    })

    describe('when 5 day count', () => {
      pushOptions({
        dayCount: 5,
        weekends: false,
      })

      it('aligns with first visible day of the week', () => {
        initCalendar()
        expectActiveRange('2017-06-12', '2017-06-17')
      })
    })
  })

  // test in Safari!
  // https://github.com/fullcalendar/fullcalendar/issues/4363
  describe('when year alignment', () => {
    pushOptions({
      initialView: 'dayGrid',
      duration: { months: 1 },
      dateAlignment: 'year',
      initialDate: '2017-06-15',
    })

    it('aligns with first day of year', () => {
      initCalendar()
      expectActiveRange('2017-01-01', '2017-02-05')
    })
  })
})
