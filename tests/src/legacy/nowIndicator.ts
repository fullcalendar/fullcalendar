import { getBoundingRect } from '../lib/dom-geom'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

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
