/*
SEE ALSO:
- next (does core of date switching)
*/

import { expectActiveRange } from './ViewDateUtils'

describe('prev', function() {
  pushOptions({
    defaultDate: '2017-06-08'
  })

  describe('when in a week view', function() {
    pushOptions({
      defaultView: 'agendaWeek'
    })

    it('moves back by one week', function() {
      initCalendar()
      currentCalendar.prev()
      expectActiveRange('2017-05-28', '2017-06-04')
    })

    describe('when two week dateIncrement', function() {
      pushOptions({
        dateIncrement: { weeks: 2 }
      })

      it('moves back by two weeks', function() {
        initCalendar()
        currentCalendar.prev()
        expectActiveRange('2017-05-21', '2017-05-28')
      })
    })
  })
})
