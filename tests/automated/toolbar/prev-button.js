/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- other range intersection tests handled by next-button
*/

import { expectButtonEnabled } from './ToolbarUtils'

describe('prev button', function() {
  pushOptions({
    defaultView: 'agendaWeek',
    defaultDate: '2017-06-08'
  })

  describe('when there is no specified validRange', function() {
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('prev', true)
    })
  })

  describe('when prev date range is completely before validRange', function() {
    pushOptions({
      validRange: { start: '2018-06-12' },
      dateIncrement: { years: 1 } // prev range is 2016-06-05 - 2016-06-12
    })
    it('is disabled', function() {
      initCalendar()
      expectButtonEnabled('prev', false)
    })
  })

  describe('when month view', function() {
    pushOptions({
      defaultView: 'month',
      defaultDate: '2017-03-01',
      validRange: { start: '2017-02-07' },
      dateIncrement: { years: 1 } // prev range is 2016-06-05 - 2016-06-12
    })

    it('when prev date range is partially before validRange', function() {
      initCalendar()
      expectButtonEnabled('prev', false)
    })
  })

  describe('when day before current day is a hidden day', function() {
    pushOptions({
      defaultDate: '2017-03-27',
      defaultView: 'basicDay',
      weekends: false,
      dateIncrement: { years: 1 } // prev range is 2016-06-05 - 2016-06-12
    })
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('prev', true)
    })
  })

  describe('when defaultDate is constrained backward to validRange and prev week is valid', function() {
    pushOptions({
      defaultDate: '2017-07-17',
      defaultView: 'agendaWeek',
      validRange: { start: '2017-03-20', end: '2017-03-30' }
    })
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('prev', true)
    })
  })
})
