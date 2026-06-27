import { expectDayRange } from '../lib/ViewRenderUtils'

describe('showNonCurrentDates', () => {
  pushOptions({
    showNonCurrentDates: false,
  })

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
      initialDate: '2017-06-01',
    })

    it('does not render other months\' dates', () => {
      let calendar = initCalendar()
      expectDayRange(calendar, '2017-06-01', '2017-07-01')
    })
  })

  describe('when in week view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
      initialDate: '2017-06-01',
    })

    it('has no effect', () => {
      let calendar = initCalendar()
      expectDayRange(calendar, '2017-05-28', '2017-06-04')
    })
  })

  it('works when disabling weekends and switching views', () => {
    let calendar = initCalendar({
      weekends: false,
      initialView: 'dayGridMonth',
      initialDate: '2019-06-07', // only shows problem when start date is a weekend!
    })
    calendar.next()
    calendar.setOption('weekends', true)
    // no errors thrown, yay
  })

  it('works when switching views with same formal duration but different rendered duration', () => {
    let calendar = initCalendar({
      initialView: 'listMonth', // something other than than dayGridMonth
      initialDate: '2019-01-01',
    })
    calendar.changeView('dayGridMonth')
    expectDayRange(calendar, '2019-01-01', '2019-02-01')
  })
})
