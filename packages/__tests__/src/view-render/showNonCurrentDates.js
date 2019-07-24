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
})
