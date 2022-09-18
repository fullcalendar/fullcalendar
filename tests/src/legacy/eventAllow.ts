import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { waitEventDrag } from '../lib/wrappers/interaction-util.js'

describe('eventAllow', () => {
  pushOptions({
    now: '2016-09-04',
    initialView: 'timeGridWeek',
    scrollTime: '00:00',
    editable: true,
    events: [
      {
        title: 'event 1',
        start: '2016-09-04T01:00',
      },
    ],
  })

  it('disallows dragging when returning false', (done) => { // and given correct params
    let options = {
      eventAllow(dropInfo, event) {
        expect(typeof dropInfo).toBe('object')
        expect(dropInfo.start instanceof Date).toBe(true)
        expect(dropInfo.end instanceof Date).toBe(true)
        expect(typeof event).toBe('object')
        expect(event.title).toBe('event 1')
        return false
      },
    }
    spyOn(options, 'eventAllow').and.callThrough()

    let calendar = initCalendar(options)
    let calendarWrapper = new CalendarWrapper(calendar)
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

    let dragging = timeGridWrapper.dragEventToDate(
      calendarWrapper.getFirstEventEl(),
      '2016-09-04T03:00:00',
    )

    waitEventDrag(calendar, dragging).then((modifiedEvent) => {
      expect(modifiedEvent).toBeFalsy() // drop failure?
      expect(options.eventAllow).toHaveBeenCalled()
      done()
    })
  })

  it('allows dragging when returning true', (done) => {
    let options = {
      eventAllow() {
        return true
      },
    }
    spyOn(options, 'eventAllow').and.callThrough()

    let calendar = initCalendar(options)
    let calendarWrapper = new CalendarWrapper(calendar)
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

    let dragging = timeGridWrapper.dragEventToDate(
      calendarWrapper.getFirstEventEl(),
      '2016-09-04T03:00:00Z',
    )

    waitEventDrag(calendar, dragging).then((modifiedEvent) => {
      expect(modifiedEvent.start).toEqualDate('2016-09-04T03:00:00Z')
      expect(options.eventAllow).toHaveBeenCalled()
      done()
    })
  })
})
