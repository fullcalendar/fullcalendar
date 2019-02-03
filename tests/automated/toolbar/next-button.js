/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- visibleRange, dateAlignment, dateIncrement
*/

import { expectButtonEnabled } from './ToolbarUtils'

describe('next button', function() {
  pushOptions({
    defaultView: 'timeGridWeek',
    defaultDate: '2017-06-08'
  })

  describe('when there is no validRange', function() {
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('next', true)
    })
  })

  describe('when next date range is completely within validRange', function() {
    pushOptions({
      validRange: { end: '2018-06-10' },
      dateIncrement: { years: 1 } // next range is 2018-06-03 - 2018-06-10
    })
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('next', true)
    })
  })

  describe('when next date range is partially outside validRange', function() {
    pushOptions({
      validRange: { end: '2018-06-05' },
      dateIncrement: { years: 1 } // next range is 2018-06-03 - 2018-06-10
    })
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('next', true)
    })
  })

  describe('when next date range is completely beyond validRange', function() {
    pushOptions({
      validRange: { end: '2018-06-03' },
      dateIncrement: { years: 1 } // next range is 2018-06-03 - 2018-06-10
    })
    it('is disabled', function() {
      initCalendar()
      expectButtonEnabled('next', false)
    })
  })

  describe('when day after current day is a hidden day', function() {
    pushOptions({
      defaultDate: '2017-03-31',
      defaultView: 'dayGridDay',
      weekends: false,
      dateIncrement: { years: 1 } // next range is 2018-06-03 - 2018-06-10
    })
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('next', true)
    })
  })

  describe('when defaultDate is constrained forward to validRange and next week is valid', function() {
    pushOptions({
      defaultDate: '2017-07-17',
      defaultView: 'timeGridWeek',
      validRange: { start: '2036-05-03', end: '2036-06-01' }
    })
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('next', true)
    })
  })
})
