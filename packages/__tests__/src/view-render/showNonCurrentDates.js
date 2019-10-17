import { expectDayRange } from './ViewRenderUtils'


describe('showNonCurrentDates', function() {
  pushOptions({
    showNonCurrentDates: false
  })

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth',
      defaultDate: '2017-06-01'
    })

    it('does not render other months\' dates', function() {
      initCalendar()
      expectDayRange('2017-06-01', '2017-07-01')
    })
  })

  describe('when in week view', function() {
    pushOptions({
      defaultView: 'timeGridWeek',
      defaultDate: '2017-06-01'
    })

    it('has no effect', function() {
      initCalendar()
      expectDayRange('2017-05-28', '2017-06-04')
    })
  })

  it('works when disabling weekends and switching views', function() {
    initCalendar({
      weekends: false,
      defaultView: 'dayGridMonth',
      defaultDate: '2019-06-07' // only shows problem when start date is a weekend!
    })
    currentCalendar.next()
    currentCalendar.setOption('weekends', true)
    // no errors thrown, yay
  })

  it('works when switching views with same formal duration but different rendered duration', function() {
    initCalendar({
      defaultView: 'listMonth', // something other than than dayGridMonth
      defaultDate: '2019-01-01'
    })
    currentCalendar.changeView('dayGridMonth')
    expectDayRange('2019-01-01', '2019-02-01')
  })

})
