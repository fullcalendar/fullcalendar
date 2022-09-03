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
      initCalendar()
      expectDayRange('2017-06-01', '2017-07-01')
    })
  })

  describe('when in week view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
      initialDate: '2017-06-01',
    })

    it('has no effect', () => {
      initCalendar()
      expectDayRange('2017-05-28', '2017-06-04')
    })
  })

  it('works when disabling weekends and switching views', () => {
    initCalendar({
      weekends: false,
      initialView: 'dayGridMonth',
      initialDate: '2019-06-07', // only shows problem when start date is a weekend!
    })
    currentCalendar.next()
    currentCalendar.setOption('weekends', true)
    // no errors thrown, yay
  })

  it('works when switching views with same formal duration but different rendered duration', () => {
    initCalendar({
      initialView: 'listMonth', // something other than than dayGridMonth
      initialDate: '2019-01-01',
    })
    currentCalendar.changeView('dayGridMonth')
    expectDayRange('2019-01-01', '2019-02-01')
  })
})
