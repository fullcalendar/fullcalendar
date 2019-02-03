/*
TODO:
- quick test for when button is clicked

SEE ALSO:
- other range intersection tests handled by next-button
*/

import { expectButtonEnabled } from './ToolbarUtils'

describe('today button', function() {
  pushOptions({
    defaultView: 'dayGridMonth',
    now: '2017-06-30'
  })

  describe('when now is in current month', function() {
    pushOptions({
      defaultDate: '2017-06-01'
    })
    it('is disabled', function() {
      initCalendar()
      expectButtonEnabled('today', false)
    })
  })

  describe('when now is not current month, but still visible', function() {
    pushOptions({
      defaultDate: '2017-07-01'
    })
    it('is enabled', function() {
      initCalendar()
      expectButtonEnabled('today', true)
    })
  })

  describe('when now is out of view', function() {
    pushOptions({
      defaultDate: '2017-08-01'
    })

    describe('when no specified validRange', function() {
      it('is enabled', function() {
        initCalendar()
        expectButtonEnabled('today', true)
      })
    })

    describe('when now\'s month is entirely before validRange', function() {
      pushOptions({
        validRange: { start: '2017-07-02' } // previous day is visible in the June
      })
      it('is disabled', function() {
        initCalendar()
        expectButtonEnabled('today', false)
      })
    })
  })
})
