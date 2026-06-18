import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('eventDidMount+eventContent', () => { // TODO: rename file
  pushOptions({
    initialDate: '2014-11-12',
    scrollTime: '00:00:00',
    events: [{
      title: 'my event',
      start: '2014-11-12T09:00:00',
    }],
  })

  describeOptions('initialView', {
    'when in day-grid': 'dayGridMonth',
    'when in time-grid': 'timeGridWeek',
  }, () => {
    describe('with foreground event', () => {
      it('receives correct args AND can modify the element', () => {
        let options = {
          eventContent(info) {
            expect(typeof info.event).toBe('object')
            expect(info.event.display).toBe('auto')
            expect(info.event.start).toBeDefined()
            expect(typeof info.view).toBe('object')
            expect(info.isMirror).toBe(false)
          },
          eventDidMount(info) {
            $(info.el).css('font-size', '20px')
          },
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

  describe('when in month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
      events: [{
        title: 'my event',
        start: '2014-11-12',
      }],
    })

    describe('with a foreground event', () => {
      it('can return a new element', () => {
        let options = {
          eventContent() {
            let domNodes = $('<div class="sup" style="background-color:green">sup g</div>').get()
            return { domNodes }
          },
        }
        spyOn(options, 'eventContent').and.callThrough()

        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let eventEl = dayGridWrapper.getFirstEventEl()

        expect(eventEl.querySelector('.sup')).toBeTruthy()
        expect(options.eventContent).toHaveBeenCalled()
      })
    })

    describe('with an all-day background event', () => {
      pushOptions({
        events: [{
          title: 'my event',
          start: '2014-11-12',
          display: 'background',
        }],
      })

      it('receives correct args AND can modify the element', () => {
        let options = {
          backgroundEventContent(info) {
            expect(typeof info.event).toBe('object')
            expect(info.event.display).toBe('background')
            expect(info.event.start).toBeDefined()
            expect(typeof info.view).toBe('object')
          },
          backgroundEventDidMount(info) {
            $(info.el).css('font-size', '20px')
          },
        }
        spyOn(options, 'backgroundEventContent').and.callThrough()
        spyOn(options, 'backgroundEventDidMount').and.callThrough()

        let calendar = initCalendar(options)
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        let bgEventEls = dayGridWrapper.getBgEventEls()

        expect(bgEventEls.length).toBe(1)
        expect(options.backgroundEventContent).toHaveBeenCalled()
        expect(options.backgroundEventDidMount).toHaveBeenCalled()
        expect($(bgEventEls).css('font-size')).toBe('20px')
      })
    })
  })
})
