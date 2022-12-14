import { expectDayRange } from '../lib/ViewRenderUtils.js'

describe('validRange rendering', () => {
  describe('with hardcoded start constraint', () => {
    describe('when month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
        initialDate: '2017-06-01',
        validRange: { start: '2017-06-07' },
      })

      it('does not render days before', () => {
        initCalendar()
        expectDayRange('2017-06-07', '2017-07-09')
      })
    })

    describe('when in week view', () => {
      pushOptions({
        initialView: 'timeGridWeek',
        initialDate: '2017-06-08',
        validRange: { start: '2017-06-06' },
      })

      it('does not render days before', () => {
        initCalendar()
        expectDayRange('2017-06-06', '2017-06-11')
      })
    })
  })

  describe('with hardcoded end constraint', () => {
    describe('when month view', () => {
      pushOptions({
        initialView: 'dayGridMonth',
        initialDate: '2017-06-01',
        validRange: { end: '2017-06-07' },
      })

      it('does not render days on or after', () => {
        initCalendar()
        expectDayRange('2017-05-28', '2017-06-07')
      })
    })

    describe('when in week view', () => {
      pushOptions({
        initialView: 'timeGridWeek',
        initialDate: '2017-06-08',
        validRange: { end: '2017-06-06' },
      })

      it('does not render days on or after', () => {
        initCalendar()
        expectDayRange('2017-06-04', '2017-06-06')
      })
    })
  })
})
