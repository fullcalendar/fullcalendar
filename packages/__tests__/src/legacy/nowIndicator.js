import { getBoundingRect } from '../lib/dom-geom'
import { isElWithinRtl } from '../lib/dom-misc'
import { getTimeGridLine } from '../lib/time-grid'

describe('now indicator', function() {
  var options

  beforeEach(function() {
    options = {
      now: '2015-12-26T06:00:00',
      scrollTime: '00:00'
    }
  })

  describe('when in month view', function() {
    beforeEach(function() {
      options.defaultView = 'dayGridMonth'
    })

    it('doesn\'t render even when activated', function() {
      initCalendar(options)
      expect(isNowIndicatorRendered()).toBe(false)
    })
  })

  describe('when in week view', function() {
    beforeEach(function() {
      options.defaultView = 'timeGridWeek'
    })

    it('doesn\'t render by default', function() {
      initCalendar(options)
      expect(isNowIndicatorRendered()).toBe(false)
    })

    describe('when activated', function() {
      beforeEach(function() {
        options.nowIndicator = true
      });

      [ 'ltr', 'rtl' ].forEach(function(dir) {

        describe('when ' + dir, function() {
          beforeEach(function() {
            options.dir = dir
          })

          it('doesn\'t render when out of view', function() {
            options.defaultDate = '2015-12-27' // sun of next week
            initCalendar(options)
            expect(isNowIndicatorRendered()).toBe(false)
          })

          it('renders on correct time', function() {
            initCalendar(options)
            isNowIndicatorRenderedAt('2015-12-26T06:00:00Z')
          })

          it('renders on correct time2', function() {
            options.now = '2015-12-20T02:30:00'
            initCalendar(options)
            isNowIndicatorRenderedAt('2015-12-20T02:30:00Z')
          })
        })
      })
    })
  })

  function isNowIndicatorRendered() {
    return $('.fc-now-indicator').length > 0
  }

  function isNowIndicatorRenderedAt(date) {
    var line = getTimeGridLine(date)
    var lineEl = $('.fc-now-indicator-line')
    var arrowEl = $('.fc-now-indicator-arrow')

    expect(lineEl.length).toBe(1)
    expect(arrowEl.length).toBe(1)

    var lineElRect = getBoundingRect(lineEl)
    var arrowElRect = getBoundingRect(arrowEl)

    expect(Math.abs(
      (lineElRect.top + lineElRect.bottom) / 2 -
      line.top
    )).toBeLessThan(2)
    expect(Math.abs(
      (arrowElRect.top + arrowElRect.bottom) / 2 -
      line.top
    )).toBeLessThan(2)

    var timeGridRect = getBoundingRect('.fc-time-grid')
    if (isElWithinRtl(arrowEl)) {
      expect(Math.abs(
        arrowElRect.right - timeGridRect.right
      )).toBeLessThan(2)
    } else {
      expect(Math.abs(
        arrowElRect.left - timeGridRect.left
      )).toBeLessThan(2)
    }
  }
})
