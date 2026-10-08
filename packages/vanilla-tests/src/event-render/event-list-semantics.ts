import { waitTimeout } from '../lib/misc'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { ListViewWrapper } from '../lib/wrappers/ListViewWrapper'

// each event element is wrapped by an unstyled list item, directly within a list
function expectInList(eventEl: Element) {
  let itemEl = eventEl.parentElement
  expect(itemEl.getAttribute('role')).toBe('listitem')
  expect(itemEl.parentElement.getAttribute('role')).toBe('list')
}

describe('event list semantics', () => {
  describe('in dayGrid', () => {
    pushOptions({
      initialView: 'dayGridMonth',
      initialDate: '2023-04-01',
    })

    it('renders events as list items within a list', async () => {
      let calendar = initCalendar({
        events: [
          { title: 'a', start: '2023-04-03' },
          { title: 'b', start: '2023-04-03' },
          { title: 'c', start: '2023-04-04', end: '2023-04-06' },
        ],
      })
      await waitTimeout()
      let dayGrid = new DayGridViewWrapper(calendar).dayGrid
      let eventEls = dayGrid.getEventEls()

      expect(eventEls.length).toBe(3)
      eventEls.forEach(expectInList)
    })

    it('does not render a list in a day without events', async () => {
      let calendar = initCalendar({
        events: [
          { title: 'a', start: '2023-04-03' },
        ],
      })
      await waitTimeout()
      let dayGrid = new DayGridViewWrapper(calendar).dayGrid

      expect(dayGrid.getDayEl('2023-04-03').querySelector('[role=list]')).toBeTruthy()
      expect(dayGrid.getDayEl('2023-04-04').querySelector('[role=list]')).toBe(null)
    })

    it('keeps the more-link outside the list, and lists popover events', async () => {
      let calendar = initCalendar({
        dayMaxEventRows: 2,
        events: [
          { title: 'a', start: '2023-04-03' },
          { title: 'b', start: '2023-04-03' },
          { title: 'c', start: '2023-04-03' },
          { title: 'd', start: '2023-04-03' },
        ],
      })
      await waitTimeout()
      let dayGrid = new DayGridViewWrapper(calendar).dayGrid
      let moreEl = dayGrid.getMoreEl()

      expect(moreEl.closest('[role=list]')).toBe(null)

      dayGrid.openMorePopover()
      await waitTimeout()
      let popoverEventEls = dayGrid.getMorePopoverEventEls()

      expect(popoverEventEls.length).toBe(4)
      popoverEventEls.forEach(expectInList)
    })
  })

  describe('in timeGrid', () => {
    pushOptions({
      initialView: 'timeGridWeek',
      initialDate: '2023-04-03',
      scrollTime: 0,
    })

    it('renders timed and all-day events as list items within lists', async () => {
      let calendar = initCalendar({
        events: [
          { title: 'a', start: '2023-04-03T01:00:00' },
          { title: 'b', start: '2023-04-03T03:00:00' },
          { title: 'c', start: '2023-04-04', allDay: true },
        ],
      })
      await waitTimeout()
      let viewWrapper = new TimeGridViewWrapper(calendar)
      let timedEventEls = viewWrapper.timeGrid.getEventEls()
      let allDayEventEls = viewWrapper.dayGrid.getEventEls()

      expect(timedEventEls.length).toBe(2)
      expect(allDayEventEls.length).toBe(1)
      timedEventEls.forEach(expectInList)
      allDayEventEls.forEach(expectInList)
    })

    it('renders the more-link as a list item, and lists popover events', async () => {
      let calendar = initCalendar({
        eventMaxStack: 1,
        events: [
          { title: 'a', start: '2023-04-03T01:00:00', end: '2023-04-03T02:00:00' },
          { title: 'b', start: '2023-04-03T01:00:00', end: '2023-04-03T02:00:00' },
          { title: 'c', start: '2023-04-03T01:00:00', end: '2023-04-03T02:00:00' },
        ],
      })
      await waitTimeout()
      let timeGrid = new TimeGridViewWrapper(calendar).timeGrid
      let moreEls = timeGrid.getMoreEls()

      expect(moreEls.length).toBe(1)
      let moreItemEl = moreEls[0].closest('[role=listitem]')
      expect(moreItemEl).toBeTruthy()
      expect(moreItemEl.parentElement.getAttribute('role')).toBe('list')

      timeGrid.openMorePopover()
      await waitTimeout()
      let popoverEventEls = timeGrid.getMorePopoverEventEls()

      expect(popoverEventEls.length).toBe(2)
      popoverEventEls.forEach(expectInList)
    })
  })

  describe('in list view', () => {
    pushOptions({
      initialView: 'listWeek',
      initialDate: '2023-04-03',
    })

    it('wraps events in list items, preserving link and button roles', async () => {
      let calendar = initCalendar({
        eventClick() {},
        events: [
          { title: 'link', start: '2023-04-03T01:00:00', url: 'https://fullcalendar.io/' },
          { title: 'button', start: '2023-04-03T02:00:00' },
          { title: 'static', start: '2023-04-03T03:00:00', interactive: false },
        ],
      })
      await waitTimeout()
      let eventEls = new ListViewWrapper(calendar).getEventEls()

      expect(eventEls.length).toBe(3)
      eventEls.forEach(expectInList)

      expect(eventEls[0].tagName).toBe('A')
      expect(eventEls[0].getAttribute('role')).toBe(null)
      expect(eventEls[1].getAttribute('role')).toBe('button')
      expect(eventEls[2].getAttribute('role')).toBe(null)
    })
  })
})
