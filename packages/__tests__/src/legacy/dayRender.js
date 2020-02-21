import { formatIsoDay } from '../lib/datelib-utils'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'

describe('dayRender', function() {

  it('is triggered upon initialization of a view, with correct parameters', function() {
    var options = {
      defaultView: 'dayGridMonth',
      fixedWeekCount: true,
      defaultDate: '2014-05-01',
      dayRender: function(arg) {
        expect(arg.date instanceof Date).toEqual(true)
        expect(formatIsoDay(arg.date)).toEqual(arg.el.getAttribute('data-date'))
        expect(arg.el instanceof HTMLElement).toBe(true)
      }
    }

    spyOn(options, 'dayRender').and.callThrough()
    initCalendar(options)
    expect(options.dayRender.calls.count()).toEqual(42)
  })

  it('is called when date range is changed', function() {
    var options = {
      defaultView: 'dayGridWeek',
      defaultDate: '2014-05-01',
      dayRender: function(arg) { }
    }

    spyOn(options, 'dayRender').and.callThrough()
    initCalendar(options)
    options.dayRender.calls.reset()
    currentCalendar.gotoDate('2014-05-04') // a day in the next week
    expect(options.dayRender.calls.count()).toEqual(7)
  })

  it('won\'t be called when date is navigated but remains in the current visible range', function() {
    var options = {
      defaultView: 'dayGridWeek',
      defaultDate: '2014-05-01',
      dayRender: function(arg) { }
    }

    spyOn(options, 'dayRender').and.callThrough()
    initCalendar(options)
    options.dayRender.calls.reset()
    currentCalendar.gotoDate('2014-05-02') // a day in the same week
    expect(options.dayRender.calls.count()).toEqual(0)
  })

  it('allows you to modify the element', function() {
    var options = {
      defaultView: 'dayGridMonth',
      fixedWeekCount: true,
      defaultDate: '2014-05-01',
      dayRender: function(arg) {
        if (formatIsoDay(arg.date) === '2014-05-01') {
          arg.el.classList.add('mycustomclass')
        }
      }
    }

    let calendar = initCalendar(options)
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let dayEl = dayGridWrapper.getDayEl('2014-05-01')
    expect(dayEl).toHaveClass('mycustomclass')
  })

  it('gets called for TimeGrid views', function() {
    var callCnt = 0
    var options = {
      defaultView: 'timeGridWeek',
      defaultDate: '2014-05-01',
      allDaySlot: false, // turn off. fires its own dayRender
      dayRender(arg) {
        expect(arg.date instanceof Date).toBe(true)
        expect(arg.el instanceof HTMLElement).toBe(true)
        expect(typeof arg.view).toBe('object')
        callCnt++
      }
    }

    initCalendar(options)
    expect(callCnt).toBe(7)
  })

})
