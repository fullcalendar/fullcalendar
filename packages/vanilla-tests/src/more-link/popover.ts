import { describe, expect, it, vi } from 'vitest'
import { CalendarOptions, EventInput, EventSourceFuncInfo } from 'fullcalendar'
import frLocale from 'fullcalendar/locales/fr'
import { strictModeFactor } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getEventEls, queryPart } from '../lib/models/events'
import { getBgEventEls, getEventTitles, getVisibleEventEls } from '../lib/models/event-content'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

const testEvents: EventInput[] = [
  { id: '1', title: 'event1', start: '2014-07-28', end: '2014-07-30' },
  { id: '2', title: 'event2', start: '2014-07-29', end: '2014-07-31' },
  { id: '3', title: 'event3', start: '2014-07-29' },
  { id: '4', title: 'event4', start: '2014-07-29' },
]

const options = {
  initialView: 'dayGridMonth',
  initialDate: '2014-08-01',
  dayMaxEventRows: 3,
  events: testEvents,
}

function getPopoverEl(): HTMLElement | null {
  return queryPart(document, 'popover')
}

function getPopoverTitle(popoverEl: HTMLElement): string {
  return queryPart(queryPart(popoverEl, 'dayHeader')!, 'dayHeaderInner')!.textContent!
}

async function clickEl(el: Element): Promise<void> {
  await pointer.click(getRectCenter(el.getBoundingClientRect()))
  await waitForSettle()
}

describe('more-link popover', () => {
  describe('position', () => {
    it.each<{ view: string, direction: 'ltr' | 'rtl' }>([
      { view: 'dayGridMonth', direction: 'ltr' },
      { view: 'dayGridWeek', direction: 'ltr' },
      { view: 'timeGridWeek', direction: 'ltr' },
      { view: 'dayGridMonth', direction: 'rtl' },
    ])('aligns with the cell\'s starting edge in $view ($direction)', async ({ view, direction }) => {
      const calendar = initCalendar({ ...options, initialView: view, direction })
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      const popoverRect = (await dayGrid.openMorePopover('2014-07-29')).getBoundingClientRect()
      const cellRect = dayGrid.getDayCell('2014-07-29').getBoundingClientRect()

      if (direction === 'ltr') {
        expect(Math.abs(popoverRect.left - cellRect.left)).toBeLessThan(2)
      } else {
        expect(Math.abs(popoverRect.right - cellRect.right)).toBeLessThan(2)
      }
    })

    it('aligns with the top of the cell in dayGridMonth', async () => {
      const calendar = initCalendar(options)
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      const popoverRect = (await dayGrid.openMorePopover('2014-07-29')).getBoundingClientRect()
      expect(Math.abs(popoverRect.top - dayGrid.getDayCell('2014-07-29').getBoundingClientRect().top)).toBeLessThan(2)
    })

    it.each([
      { view: 'dayGridWeek' },
      { view: 'timeGridWeek' },
    ])('aligns with the top of the header in $view', async ({ view }) => {
      const calendar = initCalendar({ ...options, initialView: view })
      await waitForSettle()

      const popoverRect = (await new DayGridModel(calendar.el).openMorePopover('2014-07-29')).getBoundingClientRect()
      const headerRect = queryPart(calendar.el, 'tableHeader')!.getBoundingClientRect()
      expect(Math.abs(popoverRect.top - headerRect.top)).toBeLessThan(3)
    })
  })

  describe('content', () => {
    it('lists the day\'s events, without background events', async () => {
      const calendar = initCalendar({
        ...options,
        events: [...testEvents, { start: '2014-07-29', display: 'background' }],
      })
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2014-07-29')
      expect(getEventTitles(getEventEls(popoverEl))).toEqual(['event1', 'event2', 'event3', 'event4'])
      expect(getBgEventEls(popoverEl).length).toBe(0)
      expect(getBgEventEls(calendar.el).length).toBe(1)
    })

    it('lists events that have invalid end times', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'event1', start: '2014-07-29', end: '2014-07-29' },
          { title: 'event2', start: '2014-07-29', end: '2014-07-28' },
          { title: 'event3', start: '2014-07-29T00:00:00', end: '2014-07-29T00:00:00' },
          { title: 'event4', start: '2014-07-29T00:00:00', end: '2014-07-28T23:00:00' },
        ],
      })
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2014-07-29')
      expect(getEventEls(popoverEl).length).toBe(4)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/2385
    it('orders events by time, regardless of id', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2012-03-22',
        events: [
          { id: '39957', title: 'event01', start: '2012-03-22T11:00:00', end: '2012-03-22T11:30:00' },
          { id: '40607', title: 'event02', start: '2012-03-22T16:15:00', end: '2012-03-22T16:30:00' },
          { id: '40760', title: 'event03', start: '2012-03-22T16:00:00', end: '2012-03-22T16:15:00' },
          { id: '41284', title: 'event04', start: '2012-03-22T19:00:00', end: '2012-03-22T19:15:00' },
          { id: '41645', title: 'event05', start: '2012-03-22T11:30:00', end: '2012-03-22T12:00:00' },
          { id: '41679', title: 'event07', start: '2012-03-22T12:00:00', end: '2012-03-22T12:15:00' },
          { id: '42246', title: 'event08', start: '2012-03-22T16:45:00', end: '2012-03-22T17:00:00' },
        ],
      })
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2012-03-22')
      expect(getEventTitles(getEventEls(popoverEl))).toEqual([
        'event01', 'event05', 'event07', 'event03', 'event02', 'event08', 'event04',
      ])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/3856
    it('lists a multi-day event once, as continuing on both sides', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2017-10-04',
        eventClass: (data) => [data.isStart && 'test-start', data.isEnd && 'test-end'].filter(Boolean).join(' '),
        events: [
          { id: 'long', start: '2017-10-03', end: '2017-10-20' },
          { id: 'meeting', start: '2017-10-04T10:00:00', end: '2017-10-04T12:00:00' },
          { id: 'lunch1', start: '2017-10-04T12:00:00' },
          { id: 'lunch2', start: '2017-10-04T14:00:00' },
        ],
      })
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2017-10-04')
      const edges = getEventEls(popoverEl).map((el) => [
        el.classList.contains('test-start'),
        el.classList.contains('test-end'),
      ])
      expect(edges).toEqual([
        [false, false],
        [true, true],
        [true, true],
        [true, true],
      ])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4331
    // (the legacy spec opened a more-link on the 19th, which current placement no longer needs)
    it('handles an event hidden on one day but visible on the next', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2018-10-01',
        events: [
          { title: 'e1', start: '2018-10-18' },
          { title: 'e2', start: '2018-10-18' },
          { title: 'e3', start: '2018-10-18T11:00:00' },
          { title: 'e4', start: '2018-10-18T12:00:00', end: '2018-10-19T12:00:00' },
          { title: 'e5', start: '2018-10-19' },
        ],
      })
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      expect(getEventTitles(getVisibleEventEls(dayGrid.getDayCell('2018-10-19')))).toEqual(['e4', 'e5'])

      const popoverEl = await dayGrid.openMorePopover('2018-10-18')
      expect(getEventTitles(getEventEls(popoverEl))).toEqual(['e1', 'e2', 'e3', 'e4'])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/6397
    it('doesn\'t list events twice when ordered by start', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2021-07-07',
        eventOrder: 'start',
        dayMaxEventRows: 4,
        events: [
          { title: 'Ariana Florescu', start: '2021-07-02', end: '2021-07-03' },
          { title: 'Alan Leaclaire', start: '2021-07-02', end: '2021-07-10' },
          { title: 'Divya Sundavaridevelu', start: '2021-07-05', end: '2021-07-06' },
          { title: 'Phyllis Benoussan', start: '2021-07-05', end: '2021-07-06' },
          { title: 'Allison Olsen', start: '2021-07-05', end: '2021-07-10' },
          { title: 'Justin Sinnaeve', start: '2021-07-05', end: '2021-07-10' },
          { title: 'Sylwia Pitel', start: '2021-07-07', end: '2021-07-08' },
          { title: 'Derrick Leach', start: '2021-07-07', end: '2021-07-10' },
          { title: 'Sebastien Pillon', start: '2021-07-08', end: '2021-07-13' },
          { title: 'Nishat Ayub', start: '2021-07-08', end: '2021-07-10' },
          { title: 'Ognjen Stoisavljevic', start: '2021-07-09', end: '2021-07-10' },
          { title: 'Slobodan Stojanovic', start: '2021-07-09', end: '2021-07-10' },
          { title: 'Phyllis Benoussan', start: '2021-07-09', end: '2021-07-10' },
        ],
      })
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2021-07-09')
      expect(getEventEls(popoverEl).length).toBe(9)
    })

    it('shows the latest events after a refetch', async () => {
      let fetchCnt = 0
      const calendar = initCalendar({
        ...options,
        events(_info: EventSourceFuncInfo, success: (events: EventInput[]) => void) {
          fetchCnt += 1
          success(fetchCnt === 1 ? testEvents : [...testEvents.slice(0, -1), { ...testEvents[3], title: 'cool' }])
        },
      })
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2014-07-29')
      expect(getEventTitles(getEventEls(popoverEl))).toEqual(['event1', 'event2', 'event3', 'event4'])

      calendar.refetchEvents()
      await waitForSettle()
      expect(getEventTitles(getEventEls(getPopoverEl()!)).sort()).toEqual(['cool', 'event1', 'event2', 'event3'])
    })
  })

  describe('title', () => {
    it.each<{ desc: string, extraOptions: CalendarOptions, title: string }>([
      { desc: 'defaults to a long date', extraOptions: {}, title: 'July 29, 2014' },
      { desc: 'uses popoverFormat', extraOptions: { popoverFormat: { month: 'long', day: 'numeric' } }, title: 'July 29' },
      { desc: 'defaults to the locale\'s format', extraOptions: { locale: frLocale }, title: '29 juillet 2014' },
      { desc: 'uses popoverFormat with a locale', extraOptions: { locale: frLocale, popoverFormat: { year: 'numeric' } }, title: '2014' },
    ])('$desc', async ({ extraOptions, title }) => {
      const calendar = initCalendar({ ...options, ...extraOptions })
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2014-07-29')
      expect(getPopoverTitle(popoverEl)).toBe(title)
    })
  })

  describe('closing', () => {
    it('stays open when clicking inside it', async () => {
      const calendar = initCalendar(options)
      await waitForSettle()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2014-07-29')
      await clickEl(queryPart(popoverEl, 'dayHeaderInner')!)

      expect(getPopoverEl()).toBe(popoverEl)
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4584
    it('doesn\'t fire dateClick when clicking inside it', async () => {
      const dateClick = vi.fn()
      const calendar = initCalendar({ ...options, dateClick })
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      const popoverEl = await dayGrid.openMorePopover('2014-07-29')
      await clickEl(queryPart(popoverEl, 'dayHeaderInner')!)
      expect(dateClick).not.toHaveBeenCalled()

      await clickEl(queryPart(popoverEl, 'popoverClose')!)
      await dayGrid.clickDate('2014-08-12') // same mechanics, on a day cell
      expect(dateClick).toHaveBeenCalledOnce()
    })

    it.each([
      { desc: 'its close button', clickClose: (popoverEl: HTMLElement) => clickEl(queryPart(popoverEl, 'popoverClose')!) },
      { desc: 'outside of it', clickClose: async () => {
        await pointer.click({ x: 5, y: 5 }) // the page margin, above the calendar
        await waitForSettle()
      } },
    ])('closes when clicking $desc, unmounting its events', async ({ clickClose }) => {
      const eventDidMount = vi.fn()
      const eventContent = vi.fn(() => true)
      const eventWillUnmount = vi.fn()
      const calendar = initCalendar({ ...options, eventDidMount, eventContent, eventWillUnmount })
      await waitForSettle()
      vi.clearAllMocks()

      const popoverEl = await new DayGridModel(calendar.el).openMorePopover('2014-07-29')
      const popoverEventCnt = getEventEls(popoverEl).length
      expect(popoverEventCnt).toBe(4)
      expect(eventDidMount).toHaveBeenCalledTimes(popoverEventCnt * strictModeFactor)
      expect(eventContent).toHaveBeenCalledTimes(popoverEventCnt * strictModeFactor)
      expect(eventWillUnmount).toHaveBeenCalledTimes(popoverEventCnt * (strictModeFactor - 1))
      vi.clearAllMocks()

      await clickClose(popoverEl)

      expect(getPopoverEl()).toBeNull()
      expect(eventDidMount).not.toHaveBeenCalled()
      expect(eventContent).not.toHaveBeenCalled()
      expect(eventWillUnmount.mock.calls.map((args) => args[0].event.title).sort())
        .toEqual(['event1', 'event2', 'event3', 'event4'])
    })
  })
})
