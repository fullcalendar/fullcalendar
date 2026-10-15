import { getBoundingRect } from '../lib/dom-geom.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('now indicator', () => {
  pushOptions({
    now: '2015-12-26T06:00:00',
    scrollTime: '00:00',
    initialView: 'timeGridWeek',
  })

  it('doesn\'t render by default', () => {
    let calendar = initCalendar()
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    expect(timeGridWrapper.hasNowIndicator()).toBe(false)
  })

  describe('when activated', () => {
    pushOptions({
      nowIndicator: true,
    })

    describeOptions('direction', {
      'when LTR': 'ltr',
      'when RTL': 'rtl',
    }, () => {
      it('doesn\'t render when out of view', () => {
        let calendar = initCalendar({
          initialDate: '2015-12-27', // sun of next week
        })
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        expect(timeGridWrapper.hasNowIndicator()).toBe(false)
      })

      it('renders on correct time', () => {
        let calendar = initCalendar()
        isNowIndicatorRenderedAt(calendar, '2015-12-26T06:00:00Z')
      })

      it('renders on correct time2', () => {
        let calendar = initCalendar({
          now: '2015-12-20T02:30:00',
        })
        isNowIndicatorRenderedAt(calendar, '2015-12-20T02:30:00Z')
      })
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6394
  describe('when slotMaxTime extends past midnight', () => {
    pushOptions({
      nowIndicator: true,
      initialView: 'timeGridDay',
      initialDate: '2015-12-26',
      slotMaxTime: '30:00',
    })

    it('renders after midnight, within the previous day', () => {
      let calendar = initCalendar({
        now: '2015-12-27T02:30:00',
      })

      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      let lineEl = timeGridWrapper.getNowIndicatorLineEl()
      let arrowEl = timeGridWrapper.getNowIndicatorArrowEl()
      expect(lineEl).toBeTruthy()
      expect(arrowEl).toBeTruthy()

      // slots past midnight repeat their data-time (26:30 is "02:30:00"), so locate by index.
      // 30-minute slots from 00:00, so 26:30 is the 53rd slot
      let expectedTop = $(timeGridWrapper.getSlotLaneEls()[53]).offset().top + 1 // + top border
      let lineRect = getBoundingRect(lineEl)
      let arrowRect = getBoundingRect(arrowEl)
      expect(Math.abs((lineRect.top + lineRect.bottom) / 2 - expectedTop)).toBeLessThan(3)
      expect(Math.abs((arrowRect.top + arrowRect.bottom) / 2 - expectedTop)).toBeLessThan(3)
    })

    it('doesn\'t render when past the extended end', () => {
      let calendar = initCalendar({
        now: '2015-12-27T07:00:00',
      })

      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      expect(timeGridWrapper.hasNowIndicator()).toBe(false)
    })
  })

  function isNowIndicatorRenderedAt(calendar, date) {
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let line = timeGridWrapper.getLine(date)
    let lineEl = timeGridWrapper.getNowIndicatorLineEl()
    let arrowEl = timeGridWrapper.getNowIndicatorArrowEl()

    expect(lineEl).toBeTruthy()
    expect(arrowEl).toBeTruthy()

    let lineElRect = getBoundingRect(lineEl)
    let arrowElRect = getBoundingRect(arrowEl)

    expect(Math.abs(
      (lineElRect.top + lineElRect.bottom) / 2 -
      line.top,
    )).toBeLessThan(2)
    expect(Math.abs(
      (arrowElRect.top + arrowElRect.bottom) / 2 -
      line.top,
    )).toBeLessThan(2)

    let timeGridRect = getBoundingRect(timeGridWrapper.el)

    if (calendar.getOption('direction') === 'rtl') {
      expect(Math.abs(
        arrowElRect.right - timeGridRect.right,
      )).toBeLessThan(2)
    } else {
      expect(Math.abs(
        arrowElRect.left - timeGridRect.left,
      )).toBeLessThan(2)
    }
  }
})
