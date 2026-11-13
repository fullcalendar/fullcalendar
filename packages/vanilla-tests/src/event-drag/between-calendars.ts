import { describe, expect, it, vi } from 'vitest'
import { DropInfo, EventLeaveInfo, EventReceiveInfo } from 'fullcalendar'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

describe('dragging events between calendars', () => {
  function createSideBySideEls(): [HTMLElement, HTMLElement] {
    const els = [createCalendarElement(), createCalendarElement()] as [HTMLElement, HTMLElement]
    for (const el of els) {
      el.style.width = '50%'
      el.style.cssFloat = 'left'
    }
    return els
  }

  const options = {
    initialDate: '2019-01-01',
    editable: true,
    dragScroll: false,
  }

  it('fires eventLeave, drop, then eventReceive, and moves the event', async () => {
    const calls: string[] = []
    const eventLeave = vi.fn((_info: EventLeaveInfo) => { calls.push('eventLeave') })
    const drop = vi.fn((_info: DropInfo) => { calls.push('drop') })
    const eventReceive = vi.fn((_info: EventReceiveInfo) => { calls.push('eventReceive') })
    const eventAllow = vi.fn(() => true)
    const [el0, el1] = createSideBySideEls()
    const calendar0 = initCalendar({
      ...options,
      initialView: 'dayGridMonth',
      events: [{ id: 'a', start: '2019-01-01' }],
      eventLeave,
    }, el0)
    const calendar1 = initCalendar({
      ...options,
      initialView: 'dayGridMonth',
      droppable: true,
      drop,
      eventAllow,
      eventReceive,
    }, el1)
    await waitForSettle()

    const dayGrid0 = new DayGridModel(calendar0.el)
    const dayGrid1 = new DayGridModel(calendar1.el)
    const eventEl = dayGrid0.getEventEls('a')[0]
    await dayGrid0.dragEvent('a', '2019-01-01', () => dayGrid1.pointForDate('2019-01-05'))

    expect(calls).toEqual(['eventLeave', 'drop', 'eventReceive'])
    expect(eventAllow).toHaveBeenCalled()

    const leaveInfo = eventLeave.mock.calls[0][0]
    expect(leaveInfo.draggedEl).toBe(eventEl)
    expect(leaveInfo.event.id).toBe('a')

    const dropInfo = drop.mock.calls[0][0]
    expect(dropInfo.draggedEl).toBe(eventEl)
    expect(dropInfo.dateStr).toBe('2019-01-05')
    expect(dropInfo.allDay).toBe(true)

    const receiveInfo = eventReceive.mock.calls[0][0]
    expect(receiveInfo.draggedEl).toBe(eventEl)
    expect(receiveInfo.event.startStr).toBe('2019-01-05')

    expect(calendar0.getEventById('a')).toBeNull()
    expect(calendar1.getEventById('a')!.startStr).toBe('2019-01-05')
  })

  it('moves an event between timeGrid views', async () => {
    const [el0, el1] = createSideBySideEls()
    const calendar0 = initCalendar({
      ...options,
      initialView: 'timeGridDay',
      scrollTime: '00:00',
      events: [{ id: 'a', start: '2019-01-01T00:00:00' }],
    }, el0)
    const calendar1 = initCalendar({
      ...options,
      initialView: 'timeGridDay',
      scrollTime: '00:00',
      droppable: true,
    }, el1)
    await waitForSettle()

    const timeGrid1 = new TimeGridModel(calendar1.el)
    await new TimeGridModel(calendar0.el).dragEvent('a', '2019-01-01T00:00', () => timeGrid1.pointForDateTime('2019-01-01T05:00'))

    expect(calendar0.getEventById('a')).toBeNull()
    expect(calendar1.getEventById('a')!.startStr).toBe('2019-01-01T05:00:00Z')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/8126
  it('works between timeGrid views when dropped at the same time', (done) => {
    let triggerNames = []

    calendar0 = new Calendar(el0, {
      plugins: [classicThemePlugin, themeForTestsPlugin, interactionPlugin, timeGridPlugin],
      scrollTime: '00:00',
      timeZone: 'UTC',
      initialDate: DEFAULT_DATE,
      initialView: 'timeGridDay',
      editable: true,
      events: [
        { start: '2019-01-01T02:00:00', id: 'a' },
      ],
      eventLeave() {
        triggerNames.push('eventLeave')
      },
    })

    calendar1 = new Calendar(el1, {
      plugins: [classicThemePlugin, themeForTestsPlugin, interactionPlugin, timeGridPlugin],
      scrollTime: '00:00',
      timeZone: 'UTC',
      initialDate: DEFAULT_DATE,
      initialView: 'timeGridDay',
      editable: true,
      droppable: true,
      eventReceive(info) {
        triggerNames.push('eventReceive')
        expect(info.event.start).toEqualDate('2019-01-01T02:00:00Z')
      },
    })

    calendar0.render()
    calendar1.render()
    waitTimeout().then(() => {
      let eventEl = new CalendarWrapper(calendar0).getEventEls()[0]
      let eventRect = eventEl.getBoundingClientRect()
      let destColRect = new TimeGridViewWrapper(calendar1).timeGrid.getDayEls('2019-01-01')[0].getBoundingClientRect()

      // move only horizontally, so the drop lands on the same time slot in the other calendar
      $(eventEl).simulate('drag', {
        localPoint: { left: '50%', top: 5 },
        end: {
          left: (destColRect.left + destColRect.right) / 2,
          top: eventRect.top + 5,
        },
        callback() {
          expect(triggerNames).toEqual(['eventLeave', 'eventReceive'])
          expect(calendar0.getEvents().length).toBe(0)
          expect(calendar1.getEvents().length).toBe(1)
          done()
        },
      })
    })
  })
})
