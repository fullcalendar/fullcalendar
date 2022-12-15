import { expectActiveRange, expectRenderRange } from '../lib/ViewDateUtils.js'
import { parseUtcDate } from '../lib/date-parsing.js'

describe('validRange', () => {
  pushOptions({
    timeZone: 'UTC',
    initialDate: '2017-06-08',
  })

  describe('when one week view', () => { // a view that has date-alignment by default
    pushOptions({
      initialView: 'timeGridWeek', // default range = 2017-06-04 - 2017-06-11
    })

    describe('when default range is partially before validRange', () => {
      pushOptions({
        validRange: { start: '2017-06-06' },
      })

      it('allows full renderRange but restricts activeRange', () => {
        initCalendar()
        expectRenderRange('2017-06-04', '2017-06-11')
        expectActiveRange('2017-06-06', '2017-06-11')
      })
    })

    describe('when default range is partially after validRange', () => {
      pushOptions({
        validRange: { end: '2017-06-05' },
      })

      it('allows full renderRange but restricts activeRange', () => {
        initCalendar()
        expectRenderRange('2017-06-04', '2017-06-11')
        expectActiveRange('2017-06-04', '2017-06-05')
      })
    })

    describe('when default range is completely before validRange', () => {
      pushOptions({
        validRange: { start: '2017-06-14' }, // a Wednesday
      })

      it('initializes at earliest partially visible week', () => {
        initCalendar()
        expectRenderRange('2017-06-11', '2017-06-18')
        expectActiveRange('2017-06-14', '2017-06-18')
      })
    })

    describe('when default range is completely before validRange', () => {
      pushOptions({
        validRange: { end: '2017-05-24' }, // a Wednesday
      })

      it('initializes at latest partially visible week', () => {
        initCalendar()
        expectRenderRange('2017-05-21', '2017-05-28')
        expectActiveRange('2017-05-21', '2017-05-24')
      })
    })

    describe('when validRange is a function', () => {
      let nowInput = '2017-06-09T06:00:00'

      it('receives the nowDate, timezoneless', () => {
        let validRangeSpy = spyOnCalendarCallback('validRange', (date) => {
          expect(date instanceof Date).toBe(true)
          expect(date).toEqualDate(nowInput + 'Z')
        })

        initCalendar({
          now: nowInput,
        })

        expect(validRangeSpy).toHaveBeenCalled()
      })

      it('can return a range object with strings', () => {
        let validRangeSpy = spyOnCalendarCallback('validRange', () => ({ start: '2017-06-06' }))

        initCalendar()

        expect(validRangeSpy).toHaveBeenCalled()
        expectRenderRange('2017-06-04', '2017-06-11')
        expectActiveRange('2017-06-06', '2017-06-11')
      })

      it('can return a range object with Date objects', () => {
        let validRangeSpy = spyOnCalendarCallback('validRange', () => ({ start: parseUtcDate('2017-06-06') }))

        initCalendar()

        expect(validRangeSpy).toHaveBeenCalled()
        expectRenderRange('2017-06-04', '2017-06-11')
        expectActiveRange('2017-06-06', '2017-06-11')
      })
    })
  })

  describe('when a three-day view', () => { // a view with no alignment
    pushOptions({
      initialView: 'timeGrid',
      duration: { days: 3 },
    })

    describe('when default range is completely before of validRange', () => {
      pushOptions({
        validRange: { start: '2017-06-14' },
      })
      it('renders earliest three valid days', () => {
        initCalendar()
        expectRenderRange('2017-06-14', '2017-06-17')
        expectActiveRange('2017-06-14', '2017-06-17')
      })
    })

    describe('when default range is completely after validRange', () => {
      pushOptions({
        validRange: { end: '2017-05-31' },
      })
      it('renders latest possible valid day and two invalid days', () => {
        initCalendar()
        expectRenderRange('2017-05-30', '2017-06-02')
        expectActiveRange('2017-05-30', '2017-05-31')
      })
    })
  })

  describe('when hiddenDays causes no days to be active', () => {
    pushOptions({
      initialView: 'timeGridWeek',
      initialDate: '2017-10-04',
      hiddenDays: [6], // Sunday, last day within natural week range
      validRange: {
        start: '2036-05-03',
        end: '2036-06-01',
      },
    })

    it('pushes view to nearest valid range', () => {
      initCalendar()
      expectRenderRange('2036-05-04', '2036-05-10')
      expectActiveRange('2036-05-04', '2036-05-10')
    })
  })
})
