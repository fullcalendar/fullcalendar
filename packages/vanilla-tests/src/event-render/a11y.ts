import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getEventEls, queryPart } from '../lib/models/events'
import { getMoreLinkEls, getVisibleEventEls } from '../lib/models/event-content'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

// each event element is wrapped by a list item, directly within a list
function expectInList(eventEl: HTMLElement): void {
  const itemEl = eventEl.parentElement!
  expect(itemEl.getAttribute('role')).toBe('listitem')
  expect(itemEl.parentElement!.getAttribute('role')).toBe('list')
}

async function openPopover(moreLinkEl: HTMLElement): Promise<HTMLElement> {
  await pointer.click(getRectCenter(moreLinkEl.getBoundingClientRect()))
  await waitForSettle()
  return queryPart(document, 'popover')!
}

describe('event semantics', () => {
  describe('in dayGrid', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2023-04-01',
    }

    it('renders events as list items within a list', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'a', start: '2023-04-03' },
          { title: 'b', start: '2023-04-03' },
          { title: 'c', start: '2023-04-04', end: '2023-04-06' },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(3)
      eventEls.forEach(expectInList)
    })

    it('renders a list only in days with events', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ title: 'a', start: '2023-04-03' }],
      })
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      expect(dayGrid.getDayCell('2023-04-03').querySelector('[role=list]')).not.toBeNull()
      expect(dayGrid.getDayCell('2023-04-04').querySelector('[role=list]')).toBeNull()
    })

    it('keeps the more-link outside the list, and lists popover events', async () => {
      const calendar = initCalendar({
        ...options,
        dayMaxEventRows: 2,
        events: [
          { title: 'a', start: '2023-04-03' },
          { title: 'b', start: '2023-04-03' },
          { title: 'c', start: '2023-04-03' },
          { title: 'd', start: '2023-04-03' },
        ],
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.length).toBe(1)
      expect(moreLinkEls[0].closest('[role=list]')).toBeNull()

      const popoverEl = await openPopover(moreLinkEls[0])
      const popoverEventEls = getEventEls(popoverEl)
      expect(popoverEventEls.length).toBe(4)
      popoverEventEls.forEach(expectInList)
    })
  })

  describe('in timeGrid', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate: '2023-04-03',
      scrollTime: 0,
    }

    it('renders timed and all-day events as list items within lists', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'a', start: '2023-04-03T01:00:00' },
          { title: 'b', start: '2023-04-03T03:00:00' },
          { title: 'c', start: '2023-04-04', allDay: true },
        ],
      })
      await waitForSettle()

      const eventEls = getVisibleEventEls(calendar.el)
      expect(eventEls.length).toBe(3)
      eventEls.forEach(expectInList)
    })

    it('renders the more-link as a list item, and lists popover events', async () => {
      const calendar = initCalendar({
        ...options,
        eventMaxStack: 1,
        events: [
          { title: 'a', start: '2023-04-03T01:00:00', end: '2023-04-03T02:00:00' },
          { title: 'b', start: '2023-04-03T01:00:00', end: '2023-04-03T02:00:00' },
          { title: 'c', start: '2023-04-03T01:00:00', end: '2023-04-03T02:00:00' },
        ],
      })
      await waitForSettle()

      const moreLinkEls = getMoreLinkEls(calendar.el)
      expect(moreLinkEls.length).toBe(1)
      const moreItemEl = moreLinkEls[0].closest('[role=listitem]')!
      expect(moreItemEl).not.toBeNull()
      expect(moreItemEl.parentElement!.getAttribute('role')).toBe('list')

      const popoverEl = await openPopover(moreLinkEls[0])
      const popoverEventEls = getEventEls(popoverEl)
      expect(popoverEventEls.length).toBe(2)
      popoverEventEls.forEach(expectInList)
    })
  })

  it('wraps list-view events in list items, with link and button roles', async () => {
    const calendar = initCalendar({
      initialView: 'listWeek',
      initialDate: '2023-04-03',
      eventClick() {},
      events: [
        { title: 'link', start: '2023-04-03T01:00:00', url: 'https://fullcalendar.io/' },
        { title: 'button', start: '2023-04-03T02:00:00' },
        { title: 'static', start: '2023-04-03T03:00:00', interactive: false },
      ],
    })
    await waitForSettle()

    const eventEls = getVisibleEventEls(calendar.el)
    expect(eventEls.length).toBe(3)
    eventEls.forEach(expectInList)

    expect(eventEls[0].tagName).toBe('A')
    expect(eventEls[0].getAttribute('role')).toBeNull()
    expect(eventEls[1].getAttribute('role')).toBe('button')
    expect(eventEls[2].getAttribute('role')).toBeNull()
  })

  it.each([
    { view: 'dayGridMonth', start: '2014-08-01' },
    { view: 'timeGridWeek', start: '2014-08-01T02:00:00' },
  ])('renders an event with a url as a link in $view', async ({ view, start }) => {
    const calendar = initCalendar({
      initialView: view,
      initialDate: '2014-08-01',
      events: [
        { id: 'url', start, url: 'http://google.com/' },
        { id: 'no-url', start },
      ],
    })
    await waitForSettle()

    const [urlEl] = getEventEls(calendar.el, 'url')
    const [noUrlEl] = getEventEls(calendar.el, 'no-url')
    expect(urlEl.tagName).toBe('A')
    expect(urlEl.getAttribute('href')).toBe('http://google.com/')
    expect(noUrlEl.tagName).not.toBe('A')
    expect(noUrlEl.hasAttribute('href')).toBe(false)
  })
})
