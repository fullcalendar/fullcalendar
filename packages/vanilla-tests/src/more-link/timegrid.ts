import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { TimeGridModel } from '../lib/models/time-grid'
import { getEventEls, queryPart } from '../lib/models/events'
import {
  getContainingDate,
  getCoveredDates,
  getEventTitles,
  getMoreLinkEls,
  getSlotTop,
  getVisibleEventEls,
} from '../lib/models/event-content'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

async function openPopover(moreLinkEl: HTMLElement): Promise<HTMLElement> {
  await pointer.click(getRectCenter(moreLinkEl.getBoundingClientRect()))
  await waitForSettle()
  return queryPart(document, 'popover')!
}

describe('more-links in timeGrid', () => {
  describe('in the all-day row', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate: '2014-08-01',
    }

    it('limits events with dayMaxEventRows', async () => {
      const calendar = initCalendar({
        ...options,
        dayMaxEventRows: 3,
        events: Array.from({ length: 4 }, () => ({ start: '2014-07-29' })),
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(getVisibleEventEls(calendar.el).length).toBe(2)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+2 more'])
      expect(getCoveredDates(moreLinkEls[0])).toEqual(['2014-07-29'])
    })

    it('renders a more-link on each day under hidden multi-day events', async () => {
      const calendar = initCalendar({
        ...options,
        dayMaxEventRows: 3,
        events: Array.from({ length: 4 }, () => ({ start: '2014-07-29', end: '2014-07-31' })),
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+2 more', '+2 more'])
      expect(moreLinkEls.map(getCoveredDates)).toEqual([['2014-07-29'], ['2014-07-30']])
    })

    it('behaves as if the limit is 5 with dayMaxEvents:true', async () => {
      const calendar = initCalendar({
        ...options,
        dayMaxEvents: true,
        events: Array.from({ length: 7 }, () => ({ start: '2014-07-29' })),
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el).length).toBe(4)
      expect(getMoreLinkEls(calendar.el).map((el) => el.textContent)).toEqual(['+3 more'])
    })
  })

  describe('eventMaxStack', () => {
    const options = {
      initialView: 'timeGridDay',
      initialDate: '2021-05-07',
      scrollTime: 0,
      eventMaxStack: 2,
    }

    it('puts events beyond the stack limit in a popover', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { id: '1', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
          { id: '2', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
          { id: '3', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' }, // hidden
        ],
      })
      await waitForSettle()

      expect(getVisibleEventEls(calendar.el).length).toBe(2)
      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.map((el) => el.textContent)).toEqual(['+1'])
      expect(getContainingDate(moreLinkEls[0])).toBe('2021-05-07')

      const popoverEl = await openPopover(moreLinkEls[0])
      expect(getEventEls(popoverEl).length).toBe(1)
    })

    it('lets events be dragged out of the popover', async () => {
      const calendar = initCalendar({
        ...options,
        editable: true,
        dragScroll: false,
        events: [
          { id: '1', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
          { id: '2', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
          { id: '3', start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' }, // hidden
        ],
      })
      await waitForSettle()

      const popoverEl = await openPopover(getMoreLinkEls(calendar.el)[0])
      const [eventEl] = getEventEls(popoverEl, '3')
      await pointer.press(getRectCenter(eventEl.getBoundingClientRect()), async () => {
        await pointer.move(new TimeGridModel(calendar.el).pointForDateTime('2021-05-07T02:00'))
        await waitForSettle()
      })
      await waitForSettle()

      expect(calendar.getEventById('3')!.startStr).toBe('2021-05-07T02:00:00Z')
    })

    it('renders separate more-links for separate stacks', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
          { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' },
          { start: '2021-05-07T00:00:00', end: '2021-05-07T01:00:00' }, // hidden
          { start: '2021-05-07T01:00:00', end: '2021-05-07T02:00:00' },
          { start: '2021-05-07T01:00:00', end: '2021-05-07T02:00:00' },
          { start: '2021-05-07T01:00:00', end: '2021-05-07T02:00:00' }, // hidden
        ],
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.length).toBe(2)
      expect(Math.abs(moreLinkEls[0].getBoundingClientRect().top - getSlotTop(calendar.el, '00:00:00'))).toBeLessThan(3)
      expect(Math.abs(moreLinkEls[1].getBoundingClientRect().top - getSlotTop(calendar.el, '01:00:00'))).toBeLessThan(3)
    })

    it('puts overlapping hidden events in one popover, in eventOrder', async () => {
      const calendar = initCalendar({
        ...options,
        eventOrder: 'title',
        events: [
          { title: '1', start: '2021-05-07T00:00:00', end: '2021-05-07T02:00:00' },
          { title: '2', start: '2021-05-07T00:00:00', end: '2021-05-07T02:00:00' },
          { title: '3', start: '2021-05-07T01:00:00', end: '2021-05-07T03:00:00' }, // hidden
          { title: '4', start: '2021-05-07T00:30:00', end: '2021-05-07T02:30:00' }, // hidden
        ],
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.length).toBe(1)
      // starts where the earliest hidden event does
      expect(Math.abs(moreLinkEls[0].getBoundingClientRect().top - getSlotTop(calendar.el, '00:30:00'))).toBeLessThan(3)

      const popoverEl = await openPopover(moreLinkEls[0])
      expect(getEventTitles(getEventEls(popoverEl))).toEqual(['3', '4'])
    })
  })
})
