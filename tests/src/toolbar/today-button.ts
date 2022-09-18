/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- other range intersection tests handled by next-button
*/

import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('today button', () => {
  pushOptions({
    initialView: 'dayGridMonth',
    now: '2017-06-30',
  })

  describe('when now is in current month', () => {
    pushOptions({
      initialDate: '2017-06-01',
    })
    it('is disabled', () => {
      expectEnabled(initCalendar(), false)
    })
  })

  describe('when now is not current month, but still visible', () => {
    pushOptions({
      initialDate: '2017-07-01',
    })
    it('is enabled', () => {
      expectEnabled(initCalendar(), true)
    })
  })

  describe('when now is out of view', () => {
    pushOptions({
      initialDate: '2017-08-01',
    })

    describe('when no specified validRange', () => {
      it('is enabled', () => {
        expectEnabled(initCalendar(), true)
      })
    })

    describe('when now\'s month is entirely before validRange', () => {
      pushOptions({
        validRange: { start: '2017-07-02' }, // previous day is visible in the June
      })
      it('is disabled', () => {
        expectEnabled(initCalendar(), false)
      })
    })
  })

  function expectEnabled(calendar, bool) {
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getButtonEnabled('today')).toBe(bool)
  }
})
