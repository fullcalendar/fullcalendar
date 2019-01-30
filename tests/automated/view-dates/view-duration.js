import { expectActiveRange } from './ViewDateUtils'

describe('view duration', function() {
  pushOptions({
    defaultView: 'timeGrid',
    defaultDate: '2017-03-15'
  })

  describe('when specified as a week integer', function() {
    pushOptions({
      duration: { weeks: 1 }
    })
    it('aligns with start of week', function() {
      initCalendar()
      expectActiveRange('2017-03-12', '2017-03-19')
    })
  })

  describe('when specified as 7 days', function() {
    pushOptions({
      duration: { days: 7 }
    })
    it('aligns with start of week', function() {
      initCalendar()
      expectActiveRange('2017-03-15', '2017-03-22')
    })
  })
})
