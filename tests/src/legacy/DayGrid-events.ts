import { directionallyTestSeg } from '../lib/DayGridEventRenderUtils.js'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('DayGrid event rendering', () => {
  pushOptions({
    initialDate: '2014-08-01', // 2014-07-27 - 2014-10-07 (excl)
    initialView: 'dayGridMonth',
  })

  describe('when LTR', () => {
    initMonthTesting('ltr')
  })
  describe('when RTL', () => {
    initMonthTesting('rtl')
  })

  function initMonthTesting(direction) {
    it('correctly renders an event starting before view\'s start', () => {
      let options = {
        events: [
          { start: '2014-07-26', end: '2014-07-30' },
        ],
      }
      let testSegOptions = {
        firstCol: 0,
        lastCol: 2,
        isStart: false,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event starting at view\'s start', () => {
      let options = {
        events: [
          { start: '2014-07-27', end: '2014-07-29' },
        ],
      }
      let testSegOptions = {
        firstCol: 0,
        lastCol: 1,
        isStart: true,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event starting after view\'s start', () => {
      let options = {
        events: [
          { start: '2014-08-01', end: '2014-08-02' },
        ],
      }
      let testSegOptions = {
        firstCol: 5,
        lastCol: 5,
        isStart: true,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event starting on a hidden day at week start', () => {
      let options = {
        weekends: false,
        events: [
          { start: '2014-07-27', end: '2014-07-30' },
        ],
      }
      let testSegOptions = {
        firstCol: 0,
        lastCol: 1,
        isStart: false,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event starting on a hidden day in middle of week', () => {
      let options = {
        hiddenDays: [2], // hide Tues
        events: [
          { start: '2014-07-29', end: '2014-08-01' },
        ],
      }
      let testSegOptions = {
        firstCol: 2,
        lastCol: 3,
        isStart: false,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event ending before view\'s end', () => {
      let options = {
        events: [
          { start: '2014-09-02', end: '2014-09-05' },
        ],
      }
      let testSegOptions = {
        row: 5,
        firstCol: 2,
        lastCol: 4,
        isStart: true,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event ending at view\'s end', () => {
      let options = {
        events: [
          { start: '2014-09-04', end: '2014-09-07' },
        ],
      }
      let testSegOptions = {
        row: 5,
        firstCol: 4,
        lastCol: 6,
        isStart: true,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event ending after view\'s end', () => {
      let options = {
        events: [
          { start: '2014-09-04', end: '2014-09-08' },
        ],
      }
      let testSegOptions = {
        row: 5,
        firstCol: 4,
        lastCol: 6,
        isStart: true,
        isEnd: false,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event ending at a week\'s end', () => {
      let options = {
        events: [
          { start: '2014-08-28', end: '2014-08-31' },
        ],
      }
      let testSegOptions = {
        row: 4,
        firstCol: 4,
        lastCol: 6,
        isStart: true,
        isEnd: true,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event ending on a hidden day at week end', () => {
      let options = {
        weekends: false,
        events: [
          { start: '2014-07-30', end: '2014-08-03' },
        ],
      }
      let testSegOptions = {
        firstCol: 2,
        lastCol: 4,
        isStart: true,
        isEnd: false,
      }
      testSeg(options, testSegOptions)
    })

    it('correctly renders an event ending on a hidden day in middle of week', () => {
      let options = {
        hiddenDays: [4], // Thurs
        events: [
          { start: '2014-07-28', end: '2014-08-01' },
        ],
      }
      let testSegOptions = {
        firstCol: 1,
        lastCol: 3,
        isStart: true,
        isEnd: false,
      }
      testSeg(options, testSegOptions)
    })

    function testSeg(calendarOptions, testSegOptions) {
      calendarOptions.direction = direction
      initCalendar(calendarOptions)
      directionallyTestSeg(testSegOptions)
    }
  }

  it('rendering of events across weeks stays consistent', () => {
    let calendar = initCalendar({
      events: [
        {
          title: 'event1',
          start: '2014-08-01',
          end: '2014-08-04',
          className: 'event1',
        },
        {
          title: 'event2',
          start: '2014-08-02',
          end: '2014-08-05',
          className: 'event2',
        },
      ],
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    let row0 = dayGridWrapper.getRowEl(0)
    let row0event1 = row0.querySelector('.event1')
    let row0event2 = row0.querySelector('.event2')
    let row1 = dayGridWrapper.getRowEl(1)
    let row1event1 = row1.querySelector('.event1')
    let row1event2 = row1.querySelector('.event2')

    expect($(row0event1).offset().top).toBeLessThan($(row0event2).offset().top)
    expect($(row1event1).offset().top).toBeLessThan($(row1event2).offset().top)
  })

  it('renders an event with no url with no <a> href', () => {
    let calendar = initCalendar({
      events: [{
        title: 'event1',
        start: '2014-08-01',
      }],
    })
    let eventEl = new CalendarWrapper(calendar).getFirstEventEl()
    expect(eventEl).not.toHaveAttr('href')
  })

  it('renders an event with a url with an <a> href', () => {
    let calendar = initCalendar({
      events: [{
        title: 'event1',
        start: '2014-08-01',
        url: 'http://google.com/',
      }],
    })
    let eventEl = new CalendarWrapper(calendar).getFirstEventEl()
    expect(eventEl).toHaveAttr('href')
  })
})
