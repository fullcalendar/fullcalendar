import { addDays } from '@fullcalendar/core'
import { parseUtcDate } from '../lib/date-parsing'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('current date', function() {
  const TITLE_FORMAT = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    separator: ' - ',
    isEndExclusive: true
  }

  pushOptions({
    titleFormat: TITLE_FORMAT,
    titleRangeSeparator: ' - ',
    initialDate: '2014-06-01',
    timeZone: 'UTC'
  })

  describe('initialDate & getDate', function() { // keep getDate
    describeWhenInMonth(function() {
      it('should initialize at the date', function() {
        let calendar = initCalendar({
          initialDate: '2011-03-10'
        })
        expectViewDates(calendar, '2011-02-27', '2011-04-10', '2011-03-01', '2011-04-01')
        let currentDate = calendar.getDate()
        expect(currentDate instanceof Date).toEqual(true) // test the type, but only here
        expect(currentDate).toEqualDate('2011-03-10')
      })
    })
    describeWhenInWeek(function() {
      it('should initialize at the date, given a date string', function() {
        let calendar = initCalendar({
          initialDate: '2011-03-10'
        })
        expectViewDates(calendar, '2011-03-06', '2011-03-13')
        expect(calendar.getDate()).toEqualDate('2011-03-10')
      })
      it('should initialize at the date, given a Date object', function() {
        let calendar = initCalendar({
          initialDate: parseUtcDate('2011-03-10')
        })
        expectViewDates(calendar, '2011-03-06', '2011-03-13')
        expect(calendar.getDate()).toEqualDate('2011-03-10')
      })
    })
    describeWhenInDay(function() {
      it('should initialize at the date', function() {
        let calendar = initCalendar({
          initialDate: '2011-03-10'
        })
        expectViewDates(calendar, '2011-03-10')
        expect(calendar.getDate()).toEqualDate('2011-03-10')
      })
    })
  })

  describe('gotoDate', function() {
    describeWhenInMonth(function() {
      it('should go to a date when given a date string', function() {
        let calendar = initCalendar()
        calendar.gotoDate('2015-04-01')
        expectViewDates(calendar, '2015-03-29', '2015-05-10', '2015-04-01', '2015-05-01')
      })
    })
    describeWhenInWeek(function() {
      it('should go to a date when given a date string', function() {
        let calendar = initCalendar()
        calendar.gotoDate('2015-04-01')
        expectViewDates(calendar, '2015-03-29', '2015-04-05')
      })
      it('should go to a date when given a date string with a time', function() {
        let calendar = initCalendar()
        calendar.gotoDate('2015-04-01T12:00:00')
        expectViewDates(calendar, '2015-03-29', '2015-04-05')
      })
      it('should go to a date when given a Date object', function() {
        let calendar = initCalendar()
        calendar.gotoDate(parseUtcDate('2015-04-01'))
        expectViewDates(calendar, '2015-03-29', '2015-04-05')
      })
    })
    describeWhenInDay(function() {
      it('should go to a date when given a date string', function() {
        let calendar = initCalendar()
        calendar.gotoDate('2015-04-01')
        expectViewDates(calendar, '2015-04-01')
      })
    })
  })

  describe('incrementDate', function() {
    describeWhenInMonth(function() {
      it('should increment the date when given a Duration object', function() {
        let calendar = initCalendar()
        calendar.incrementDate({ months: -1 })
        expectViewDates(calendar, '2014-04-27', '2014-06-08', '2014-05-01', '2014-06-01')
      })
    })
    describeWhenInWeek(function() {
      it('should increment the date when given a Duration object', function() {
        let calendar = initCalendar()
        calendar.incrementDate({ weeks: -2 })
        expectViewDates(calendar, '2014-05-18', '2014-05-25')
      })
    })
    describeWhenInDay(function() {
      it('should increment the date when given a Duration object', function() {
        let calendar = initCalendar()
        calendar.incrementDate({ days: 2 })
        expectViewDates(calendar, '2014-06-03')
      })
      it('should increment the date when given a Duration string', function() {
        let calendar = initCalendar()
        calendar.incrementDate('2.00:00:00')
        expectViewDates(calendar, '2014-06-03')
      })
      it('should increment the date when given a Duration string with a time', function() {
        let calendar = initCalendar()
        calendar.incrementDate('2.05:30:00')
        expectViewDates(calendar, '2014-06-03')
      })
    })
  })

  describe('prevYear', function() {
    describeWhenInMonth(function() {
      it('should move the calendar back a year', function() {
        let calendar = initCalendar()
        calendar.prevYear()
        expectViewDates(calendar, '2013-05-26', '2013-07-07', '2013-06-01', '2013-07-01')
      })
    })
    describeWhenInWeek(function() {
      it('should move the calendar back a year', function() {
        let calendar = initCalendar()
        calendar.prevYear()
        expectViewDates(calendar, '2013-05-26', '2013-06-02')
      })
    })
    describeWhenInDay(function() {
      it('should move the calendar back a year', function() {
        let calendar = initCalendar()
        calendar.prevYear()
        expectViewDates(calendar, '2013-06-01')
      })
    })
  })

  describe('nextYear', function() {
    describeWhenInMonth(function() {
      it('should move the calendar forward a year', function() {
        let calendar = initCalendar()
        calendar.nextYear()
        expectViewDates(calendar, '2015-05-31', '2015-07-12', '2015-06-01', '2015-07-01')
      })
    })
    describeWhenInWeek(function() {
      it('should move the calendar forward a year', function() {
        let calendar = initCalendar()
        calendar.nextYear()
        expectViewDates(calendar, '2015-05-31', '2015-06-07')
      })
    })
    describeWhenInDay(function() {
      it('should move the calendar forward a year', function() {
        let calendar = initCalendar()
        calendar.nextYear()
        expectViewDates(calendar, '2015-06-01')
      })
    })
  })

  describe('when current date is a hidden day', function() {
    describeWhenInMonth(function() {
      it('should display the current month even if first day of month', function() {
        let calendar = initCalendar({
          now: '2014-06-01', // a Sunday
          initialDate: '2014-06-01', // a Sunday
          weekends: false
        })
        let view = calendar.view
        expect(view.activeStart).toEqualDate('2014-06-02')
        expect(view.activeEnd).toEqualDate('2014-07-12')
        expect(view.currentStart).toEqualDate('2014-06-01')
        expect(view.currentEnd).toEqualDate('2014-07-01')
      })
      it('should display the current month', function() {
        let calendar = initCalendar({
          now: '2014-05-04', // a Sunday
          initialDate: '2014-05-04', // a Sunday
          weekends: false
        })
        let view = calendar.view
        expect(view.activeStart).toEqualDate('2014-04-28')
        expect(view.activeEnd).toEqualDate('2014-06-07')
        expect(view.currentStart).toEqualDate('2014-05-01')
        expect(view.currentEnd).toEqualDate('2014-06-01')
      })
      describe('when navigating back a month', function() {
        it('should not skip months', function() {
          let calendar = initCalendar({
            initialDate: '2014-07-07',
            weekends: false
          })
          let view = calendar.view
          expect(view.currentStart).toEqualDate('2014-07-01')
          expect(view.currentEnd).toEqualDate('2014-08-01')
          calendar.prev() // will move to Jun 1, which is a Sunday
          view = calendar.view
          expect(view.currentStart).toEqualDate('2014-06-01')
          expect(view.currentEnd).toEqualDate('2014-07-01')
        })
      })
    })
    describeWhenInDay(function() {
      it('should display the next visible day', function() {
        let calendar = initCalendar({
          now: '2014-06-01', // a Sunday
          initialDate: '2014-06-01', // a Sunday
          weekends: false
        })
        let view = calendar.view
        expect(view.activeStart).toEqualDate('2014-06-02')
        expect(view.activeEnd).toEqualDate('2014-06-03')
        expect(view.currentStart).toEqualDate('2014-06-02')
        expect(view.currentEnd).toEqualDate('2014-06-03')
      })
    })
  })


  // UTILS
  // -----

  function describeWhenInMonth(func) {
    describeWhenIn('dayGridMonth', func)
  }

  function describeWhenInWeek(func) {
    describeWhenIn('dayGridWeek', func)
    describeWhenIn('timeGridWeek', func)
  }

  function describeWhenInDay(func) {
    describeWhenIn('dayGridDay', func)
    describeWhenIn('timeGridDay', func)
  }

  function describeWhenIn(viewName, func) {
    describe('when in ' + viewName, function() {
      pushOptions({initialView: viewName})
      func()
    })
  }

  function expectViewDates(calendar, start, end?, titleStart?, titleEnd?) {
    let view = calendar.view
    let calculatedEnd
    let title

    if (typeof start === 'string') {
      start = new Date(start)
    }
    if (typeof end === 'string') {
      end = new Date(end)
    }
    if (typeof titleStart === 'string') {
      titleStart = new Date(titleStart)
    }
    if (typeof titleEnd === 'string') {
      titleEnd = new Date(titleEnd)
    }

    calculatedEnd = end || addDays(start, 1)

    expect(start).toEqualDate(view.activeStart)
    expect(calculatedEnd).toEqualDate(view.activeEnd)

    titleStart = titleStart || start
    titleEnd = titleEnd || calculatedEnd

    if (titleEnd) {
      title = calendar.formatRange(
        titleStart,
        titleEnd,
        TITLE_FORMAT
      )
    } else {
      title = calendar.formatDate(titleStart, TITLE_FORMAT)
    }

    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper.getTitleText()).toBe(title)
  }

})
