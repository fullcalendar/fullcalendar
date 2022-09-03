/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- visibleRange, dateAlignment, dateIncrement
*/

import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('next button', () => {
  pushOptions({
    initialView: 'timeGridWeek',
    initialDate: '2017-06-08',
  })

  describe('when there is no validRange', () => {
    it('is enabled', () => {
      expectEnabled(initCalendar(), true)
    })
  })

  describe('when next date range is completely within validRange', () => {
    pushOptions({
      validRange: { end: '2018-06-10' },
      dateIncrement: { years: 1 }, // next range is 2018-06-03 - 2018-06-10
    })
    it('is enabled', () => {
      expectEnabled(initCalendar(), true)
    })
  })

  describe('when next date range is partially outside validRange', () => {
    pushOptions({
      validRange: { end: '2018-06-05' },
      dateIncrement: { years: 1 }, // next range is 2018-06-03 - 2018-06-10
    })
    it('is enabled', () => {
      expectEnabled(initCalendar(), true)
    })
  })

  describe('when next date range is completely beyond validRange', () => {
    pushOptions({
      validRange: { end: '2018-06-03' },
      dateIncrement: { years: 1 }, // next range is 2018-06-03 - 2018-06-10
    })
    it('is disabled', () => {
      expectEnabled(initCalendar(), false)
    })
  })

  describe('when day after current day is a hidden day', () => {
    pushOptions({
      initialDate: '2017-03-31',
      initialView: 'dayGridDay',
      weekends: false,
      dateIncrement: { years: 1 }, // next range is 2018-06-03 - 2018-06-10
    })
    it('is enabled', () => {
      expectEnabled(initCalendar(), true)
    })
  })

  describe('when initialDate is constrained forward to validRange and next week is valid', () => {
    pushOptions({
      initialDate: '2017-07-17',
      initialView: 'timeGridWeek',
      validRange: { start: '2036-05-03', end: '2036-06-01' },
    })
    it('is enabled', () => {
      expectEnabled(initCalendar(), true)
    })
  })

  function expectEnabled(calendar, bool) {
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getButtonEnabled('next')).toBe(bool)
  }
})
