import CalendarWrapper from '../lib/wrappers/CalendarWrapper'
import DayGridViewWrapper from '../lib/wrappers/DayGridViewWrapper'

describe('eventDidMount+eventContent', function() { // TODO: rename file
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
        let options = {
          eventContent(arg) {
            expect(typeof arg.event).toBe('object')
            expect(arg.event.rendering).toBe('')
            expect(arg.event.start).toBeDefined()
            expect(typeof arg.view).toBe('object')
            expect(arg.isMirror).toBe(false)
          },
          eventDidMount(arg) {
            $(arg.el).css('font-size', '20px')
          }
        }
        spyOn(options, 'eventContent').and.callThrough()
        spyOn(options, 'eventDidMount').and.callThrough()

        let calendar = initCalendar(options)
        let calendarWrapper = new CalendarWrapper(calendar)
        let eventEl = calendarWrapper.getFirstEventEl()

        expect(options.eventContent).toHaveBeenCalled()
        expect(options.eventDidMount).toHaveBeenCalled()
        expect($(eventEl).css('font-size')).toBe('20px')
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
          eventContent() {
            let domNodes = $(`<div class="sup" style="background-color:green">sup g</div>`).get()
            return { domNodes }
          }
        }
        spyOn(options, 'eventContent').and.callThrough()

        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let eventEl = dayGridWrapper.getFirstEventEl()

        expect(eventEl.querySelector('.sup')).toBeTruthy()
        expect(options.eventContent).toHaveBeenCalled()
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
          eventContent(arg) {
            expect(typeof arg.event).toBe('object')
            expect(arg.event.rendering).toBe('background')
            expect(arg.event.start).toBeDefined()
            expect(typeof arg.view).toBe('object')
          },
          eventDidMount(arg) {
            $(arg.el).css('font-size', '20px')
          }
        }
        spyOn(options, 'eventContent').and.callThrough()
        spyOn(options, 'eventDidMount').and.callThrough()

        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let bgEventEls = dayGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(1)
        expect(options.eventContent).toHaveBeenCalled()
        expect(options.eventDidMount).toHaveBeenCalled()
        expect($(bgEventEls).css('font-size')).toBe('20px')
      })
    })
  })
})
