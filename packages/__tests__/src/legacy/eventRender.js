import CalendarWrapper from '../lib/wrappers/CalendarWrapper'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'
import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'

describe('eventRender', function() {
  pushOptions({
    defaultDate: '2014-11-12',
    scrollTime: '00:00:00',
    events: [ {
      title: 'my event',
      start: '2014-11-12T09:00:00'
    } ]
  })

  describeOptions('defaultView', {
    'when in day-grid': 'dayGridMonth',
    'when in time-grid': 'timeGridWeek'
  }, function() {

    describe('with foreground event', function() {
      it('receives correct args AND can modify the element', function() {
        var options = {
          eventRender: function(arg) {
            expect(typeof arg.event).toBe('object')
            expect(arg.event.rendering).toBe('')
            expect(arg.event.start).toBeDefined()
            expect(arg.el instanceof HTMLElement).toBe(true)
            expect(typeof arg.view).toBe('object')
            expect(arg.isMirror).toBe(false)
            $(arg.el).css('font-size', '20px')
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let calendarWrapper = new CalendarWrapper(calendar)
        let eventEl = calendarWrapper.getFirstEventEl()

        expect($(eventEl).css('font-size')).toBe('20px')
        expect(options.eventRender).toHaveBeenCalled()
      })
    })
  })

  describe('when in month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth',
      events: [ {
        title: 'my event',
        start: '2014-11-12'
      } ]
    })

    describe('with a foreground event', function() {

      it('can return a new element', function() {
        let options = {
          eventRender() {
            return $(`<div class="sup ${CalendarWrapper.EVENT_CLASSNAME}" style="background-color:green">sup g</div>`)[0]
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let eventEl = dayGridWrapper.getFirstEventEl()

        expect(eventEl).toHaveClass('sup')
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('can return false and cancel rendering', function() {
        let options = {
          eventRender() {
            return false
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let eventEls = dayGridWrapper.getEventEls()

        expect(eventEls.length).toBe(0)
        expect(options.eventRender).toHaveBeenCalled()
      })
    })

    describe('with an all-day background event', function() {
      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12',
          rendering: 'background'
        } ]
      })

      it('receives correct args AND can modify the element', function() {
        let options = {
          eventRender(arg) {
            expect(typeof arg.event).toBe('object')
            expect(arg.event.rendering).toBe('background')
            expect(arg.event.start).toBeDefined()
            expect(arg.el instanceof HTMLElement).toBe(true)
            expect(typeof arg.view).toBe('object')
            $(arg.el).css('font-size', '20px')
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let bgEventEls = dayGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(1)
        expect($(bgEventEls).css('font-size')).toBe('20px')
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('can return a new element', function() {
        let options = {
          eventRender() {
            return $(`<td class="sup ${CalendarWrapper.BG_EVENT_CLASSNAME}" style="background-color:green">sup g</td>`)[0]
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let bgEventEls = dayGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(1)
        expect(bgEventEls[0]).toHaveClass('sup')
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('won\'t rendering when returning a new element of the wrong type', function() {
        let options = {
          eventRender() {
            return $(`<div class="sup ${CalendarWrapper.BG_EVENT_CLASSNAME}" style="background-color:green">sup g</div>`)[0]
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let bgEventEls = dayGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(0)
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('can return false and cancel rendering', function() {
        let options = {
          eventRender: function(arg) {
            return false
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let bgEventEls = dayGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(0)
        expect(options.eventRender).toHaveBeenCalled()
      })
    })

    describe('with a timed background event', function() { // not exactly related to eventRender!
      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12T01:00:00',
          rendering: 'background'
        } ]
      })

      it('won\'t render or call eventRender', function() {
        let options = {
          eventRender() {}
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let bgEventEls = dayGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(0)
        expect(options.eventRender).not.toHaveBeenCalled()
      })
    })
  })

  describe('when in week view', function() {
    pushOptions({
      defaultView: 'timeGridWeek'
    })

    describe('with a foreground event', function() {
      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12T01:00:00'
        } ]
      })

      it('can return a new element', function() {
        let options = {
          eventRender() {
            return $(`<div class="${CalendarWrapper.EVENT_CLASSNAME} sup" style="background-color:green">sup g</div>`)[0]
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let eventEls = timeGridWrapper.getEventEls()

        expect(eventEls.length).toBe(1)
        expect(eventEls[0]).toHaveClass('sup')
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('can return false and cancel rendering', function() {
        let options = {
          eventRender() {
            return false
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let eventEls = timeGridWrapper.getEventEls()

        expect(eventEls.length).toBe(0)
        expect(options.eventRender).toHaveBeenCalled()
      })
    })

    describe('with a timed background event', function() {
      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12T01:00:00',
          rendering: 'background'
        } ]
      })

      it('receives correct args AND can modify the element', function() {
        let options = {
          eventRender: function(arg) {
            expect(typeof arg.event).toBe('object')
            expect(arg.event.rendering).toBe('background')
            expect(arg.event.start).toBeDefined()
            expect(arg.el instanceof HTMLElement).toBe(true)
            expect(typeof arg.view).toBe('object')
            $(arg.el).css('font-size', '20px')
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let bgEventEls = timeGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(1)
        expect($(bgEventEls[0]).css('font-size')).toBe('20px')
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('can return a new element', function() {
        let options = {
          eventRender: function() {
            return $(`<div class="sup ${CalendarWrapper.BG_EVENT_CLASSNAME}" style="background-color:green">sup g</div>`)[0]
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let bgEventEls = timeGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(1)
        expect(bgEventEls[0]).toHaveClass('sup')
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('won\'t rendering when returning a new element of the wrong type', function() {
        let options = {
          eventRender() {
            return $(`<p class="sup ${CalendarWrapper.BG_EVENT_CLASSNAME}" style="background-color:green">sup g</p>`)[0]
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let bgEventEls = timeGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(0)
        expect(options.eventRender).toHaveBeenCalled()
      })

      it('can return false and cancel rendering', function() {
        let options = {
          eventRender() {
            return false
          }
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
        let bgEventEls = timeGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(0)
        expect(options.eventRender).toHaveBeenCalled()
      })
    })

    describe('with an all-day background event', function() { // not exactly related to eventRender!
      pushOptions({
        events: [ {
          title: 'my event',
          start: '2014-11-12',
          rendering: 'background'
        } ]
      })

      it('will render in all-day AND timed slots', function() {
        let options = {
          eventRender: function() {}
        }
        spyOn(options, 'eventRender').and.callThrough()
        let calendar = initCalendar(options)
        let viewWrapper = new TimeGridViewWrapper(calendar)

        expect(viewWrapper.dayGrid.getBgEventEls().length).toBe(1)
        expect(viewWrapper.timeGrid.getBgEventEls().length).toBe(1)
        expect(options.eventRender).toHaveBeenCalled()
      })
    })
  })
})
