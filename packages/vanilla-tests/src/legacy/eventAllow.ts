import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { waitEventDrag } from '../lib/wrappers/interaction-util'
import { waitTimeout } from '../lib/misc'

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

  it('disallows dragging when returning false', async () => { // and given correct params
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
    await waitTimeout()
    let calendarWrapper = new CalendarWrapper(calendar)
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

    let dragging = timeGridWrapper.dragEventToDate(
      calendarWrapper.getFirstEventEl(),
      '2016-09-04T03:00:00',
    )
    let info = await waitEventDrag(calendar, dragging)
    expect(info).toBeFalsy() // drop failure?
    expect(options.eventAllow).toHaveBeenCalled()
  })

  it('allows dragging when returning true', async () => {
    let options = {
      eventAllow() {
        return true
      },
    }
    spyOn(options, 'eventAllow').and.callThrough()

    let calendar = initCalendar(options)
    await waitTimeout()
    let calendarWrapper = new CalendarWrapper(calendar)
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid

    let dragging = timeGridWrapper.dragEventToDate(
      calendarWrapper.getFirstEventEl(),
      '2016-09-04T03:00:00Z',
    )
    let info = await waitEventDrag(calendar, dragging)
    expect(info.event.start).toEqualDate('2016-09-04T03:00:00Z')
    expect(options.eventAllow).toHaveBeenCalled()
  })
})
