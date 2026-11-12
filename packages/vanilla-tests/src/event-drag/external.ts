import { describe, expect, it, onTestFinished, vi } from 'vitest'
import { AllowFunc, DropInfo, EventReceiveInfo } from 'fullcalendar'
import { Draggable } from 'fullcalendar/interaction'
import { initCalendar, createCalendarElement } from '../lib/calendar'
import { createExternalEl, dragExternalEl } from '../lib/external'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

function makeDraggable(el: HTMLElement, eventData?: object): void {
  const draggable = new Draggable(el, eventData ? { eventData } : {})
  onTestFinished(() => draggable.destroy())
}

describe('dragging external elements onto the calendar', () => {
  describe('in dayGrid', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-11-13',
      droppable: true,
    }

    it('fires drop, then eventReceive for the created event', async () => {
      const calls: string[] = []
      const drop = vi.fn((_info: DropInfo) => { calls.push('drop') })
      const eventReceive = vi.fn((_info: EventReceiveInfo) => { calls.push('eventReceive') })
      const calendar = initCalendar({ ...options, drop, eventReceive })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, { title: 'hey' })
      await dragExternalEl(externalEl, () => new DayGridModel(calendar.el).pointForDate('2014-11-13'))

      expect(calls).toEqual(['drop', 'eventReceive'])

      const dropInfo = drop.mock.calls[0][0]
      expect(dropInfo.dateStr).toBe('2014-11-13')
      expect(dropInfo.allDay).toBe(true)
      expect(dropInfo.draggedEl).toBe(externalEl)
      // https://github.com/fullcalendar/fullcalendar/issues/2926
      expect(dropInfo.jsEvent.type).toBe('mouseup')

      const receiveInfo = eventReceive.mock.calls[0][0]
      expect(receiveInfo.draggedEl).toBe(externalEl)
      expect(receiveInfo.event.title).toBe('hey')
      expect(receiveInfo.event.startStr).toBe('2014-11-13')
      expect(calendar.getEvents()).toHaveLength(1)
    })

    it('applies the event data\'s startTime on the dropped day', async () => {
      const drop = vi.fn()
      const calendar = initCalendar({ ...options, drop })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, { startTime: '05:00' })
      await dragExternalEl(externalEl, () => new DayGridModel(calendar.el).pointForDate('2014-11-13'))

      expect(calendar.getEvents()[0].startStr).toBe('2014-11-13T05:00:00Z')

      // https://github.com/fullcalendar/fullcalendar/issues/2955: drop reports the day, not the startTime
      expect(drop).toHaveBeenCalledOnce()
      expect(drop.mock.calls[0][0].dateStr).toBe('2014-11-13')
      expect(drop.mock.calls[0][0].allDay).toBe(true)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4597
    it('gives the event an end when forceEventDuration:true', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2019-04-01',
        forceEventDuration: true,
        defaultAllDayEventDuration: { days: 2 },
      })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, {})
      await dragExternalEl(externalEl, () => new DayGridModel(calendar.el).pointForDate('2019-04-02'))

      expect(calendar.getEvents()[0].endStr).toBe('2019-04-04')
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4575
    it('gives eventAllow the dragged event, with no start or end', async () => {
      const eventAllow = vi.fn<AllowFunc>(() => true)
      const calendar = initCalendar({ ...options, initialDate: '2019-04-01', eventAllow })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, { id: 'a', title: 'hey' })
      await dragExternalEl(externalEl, () => new DayGridModel(calendar.el).pointForDate('2019-04-02'))

      expect(eventAllow).toHaveBeenCalled()
      const draggedEvent = eventAllow.mock.calls[0][1]
      expect(draggedEvent.id).toBe('a')
      expect(draggedEvent.title).toBe('hey')
      expect(draggedEvent.start).toBeNull()
      expect(draggedEvent.end).toBeNull()
    })

    it('fires drop but creates no event when the event data has create:false', async () => {
      const drop = vi.fn()
      const eventReceive = vi.fn()
      const calendar = initCalendar({ ...options, drop, eventReceive })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, { create: false })
      await dragExternalEl(externalEl, () => new DayGridModel(calendar.el).pointForDate('2014-11-13'))

      expect(drop).toHaveBeenCalledOnce()
      expect(eventReceive).not.toHaveBeenCalled()
      expect(calendar.getEvents()).toHaveLength(0)
    })

    describe('dropAccept', () => {
      it.each([
        ['a matching selector', '.accepted', true],
        ['a non-matching selector', '.other', false],
        ['a function returning true', (el: HTMLElement) => el.classList.contains('accepted'), true],
        ['a function returning false', (el: HTMLElement) => el.classList.contains('other'), false],
      ])('with %s', async (_desc, dropAccept, isAccepted) => {
        const drop = vi.fn()
        const calendar = initCalendar({ ...options, dropAccept, drop })
        await waitForSettle()

        const externalEl = createExternalEl({ class: 'accepted' })
        makeDraggable(externalEl)
        await dragExternalEl(externalEl, () => new DayGridModel(calendar.el).pointForDate('2014-11-13'))

        expect(drop).toHaveBeenCalledTimes(isAccepted ? 1 : 0)
      })
    })

    // https://github.com/fullcalendar/fullcalendar/issues/2433
    it('still accepts drops after another calendar navigates', async () => {
      const drop = vi.fn()
      const calendar = initCalendar({ ...options, drop })
      const otherCalendar = initCalendar({ ...options, initialView: 'dayGridWeek', height: 200 }, createCalendarElement())
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl)
      otherCalendar.next()
      await waitForSettle()
      await dragExternalEl(externalEl, () => new DayGridModel(calendar.el).pointForDate('2014-11-13'))

      expect(drop).toHaveBeenCalledOnce()
    })
  })

  describe('in timeGrid', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate: '2014-11-13',
      scrollTime: '00:00:00',
      dragScroll: false,
      droppable: true,
    }

    it('drops at the time under the pointer', async () => {
      const drop = vi.fn()
      const calendar = initCalendar({ ...options, drop })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, { title: 'hey' })
      await dragExternalEl(externalEl, () => new TimeGridModel(calendar.el).pointForDateTime('2014-11-13T02:00'))

      const dropInfo = drop.mock.calls[0][0]
      expect(dropInfo.dateStr).toBe('2014-11-13T02:00:00Z')
      expect(dropInfo.allDay).toBe(false)
      expect(calendar.getEvents()[0].startStr).toBe('2014-11-13T02:00:00Z')
    })

    // https://github.com/fullcalendar/fullcalendar/issues/2225
    it('drops at the time under the pointer with timeZone:local', async () => {
      const drop = vi.fn()
      const calendar = initCalendar({ ...options, timeZone: 'local', drop })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl)
      await dragExternalEl(externalEl, () => new TimeGridModel(calendar.el).pointForDateTime('2014-11-13T02:00'))

      const date: Date = drop.mock.calls[0][0].date
      expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2014, 10, 13, 2])
    })

    it.each([
      ['defaultTimedEventDuration, with forceEventDuration', { defaultTimedEventDuration: '02:30', forceEventDuration: true }, {}, '2014-11-13T04:30:00Z'],
      ['the event data\'s duration', {}, { duration: '05:00' }, '2014-11-13T07:00:00Z'],
    ])('gives the event its duration from %s', async (_desc, moreOptions, eventData, expectedEnd) => {
      const calendar = initCalendar({ ...options, ...moreOptions })
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, eventData)
      await dragExternalEl(externalEl, () => new TimeGridModel(calendar.el).pointForDateTime('2014-11-13T02:00'))

      expect(calendar.getEvents()[0].endStr).toBe(expectedEnd)
    })

    it('ignores the event data\'s startTime when dropped on a time slot', async () => {
      const calendar = initCalendar(options)
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, { startTime: '05:00' })
      await dragExternalEl(externalEl, () => new TimeGridModel(calendar.el).pointForDateTime('2014-11-13T02:00'))

      expect(calendar.getEvents()[0].startStr).toBe('2014-11-13T02:00:00Z')
    })

    it('keeps an event with stick:true when navigating away and back', async () => {
      const calendar = initCalendar(options)
      await waitForSettle()

      const externalEl = createExternalEl()
      makeDraggable(externalEl, { stick: true })
      await dragExternalEl(externalEl, () => new TimeGridModel(calendar.el).pointForDateTime('2014-11-13T02:00'))

      expect(getEventEls(calendar.el)).toHaveLength(1)
      calendar.next()
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(0)
      calendar.prev()
      await waitForSettle()
      expect(getEventEls(calendar.el)).toHaveLength(1)
    })
  })
})
