import { expectActiveRange } from './ViewDateUtils'

/*
SEE ALSO: next/prev
*/
describe('dateAlignment', function() {
  pushOptions({
    defaultView: 'agenda',
    dateAlignment: 'week',
    defaultDate: '2017-06-15'
  })

  describe('when 3 day duration', function() {
    pushOptions({
      duration: { days: 3 }
    })

    it('aligns with the week', function() {
      initCalendar()
      expectActiveRange('2017-06-11', '2017-06-14')
    })
  })

  describe('when 5 day count', function() {
    pushOptions({
      dayCount: 5,
      weekends: false
    })

    it('aligns with first visible day of the week', function() {
      initCalendar()
      expectActiveRange('2017-06-12', '2017-06-17')
    })
  })
})
