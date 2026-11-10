import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { appendTestElement, createCalendarElement, initCalendar } from '../lib/calendar'
import { getEventEls, getEventIdOfEl, queryPart, queryParts } from '../lib/models/events'
import { getMoreLinkEls } from '../lib/models/event-content'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'
import { getActiveRange } from '../lib/view-dates'
import { getParts } from '../lib/parts'

/*
Keyboard access. Interactive things that aren't natively focusable (events with eventClick, nav links,
more-links) get tabindex=0 and activate on Enter and Space, like buttons.
*/

/*
Renders the calendar after a focusable button, so Tab from that button reaches the calendar's first
tabbable element.
*/
async function initAfterButton(options: CalendarOptions): Promise<{ calendar: Calendar, buttonEl: HTMLButtonElement }> {
  const buttonEl = appendTestElement(document.createElement('button'))
  buttonEl.textContent = 'before the calendar'
  const calendar = initCalendar(options, createCalendarElement())
  await waitForSettle()
  return { calendar, buttonEl }
}

async function press(keys: string): Promise<void> {
  await userEvent.keyboard(keys)
  await waitForSettle()
}

async function tab(shift = false): Promise<void> {
  await userEvent.tab({ shift })
  await waitForSettle()
}

describe('keyboard access to events', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2023-04-01',
    headerToolbar: false as const,
  }

  it.each([
    ['with an eventClick handler', { eventClick() {} }, {}, true],
    ['with no eventClick handler', {}, {}, false],
    ['with eventInteractive', { eventInteractive: true }, {}, true],
    ['with the event\'s interactive:false', { eventClick() {} }, { interactive: false }, false],
    ['with the event\'s interactive:true', {}, { interactive: true }, true],
  ])('%s, is a focusable button: %s', async (_desc, calendarOptions, eventProps, isButton) => {
    const calendar = initCalendar({
      ...options,
      ...calendarOptions,
      events: [{ id: 'a', start: '2023-04-03', ...eventProps }],
    })
    await waitForSettle()

    const [eventEl] = getEventEls(calendar.el, 'a')
    expect(eventEl.tagName).toBe('DIV')
    expect(eventEl.tabIndex).toBe(isButton ? 0 : -1)
    expect(eventEl.getAttribute('role')).toBe(isButton ? 'button' : null)
  })

  it('tabs through interactive events only, in order', async () => {
    const { calendar, buttonEl } = await initAfterButton({
      ...options,
      eventClick() {},
      events: [
        { id: 'a', title: 'a', start: '2023-04-03' },
        { id: 'b', title: 'b', start: '2023-04-03', interactive: false },
        { id: 'c', title: 'c', start: '2023-04-04' },
      ],
    })
    expect(getEventEls(calendar.el, 'b')).toHaveLength(1) // rendered, but skipped

    buttonEl.focus()
    await tab()
    expect(getEventIdOfEl(document.activeElement as HTMLElement)).toBe('a')

    await tab()
    expect(getEventIdOfEl(document.activeElement as HTMLElement)).toBe('c')

    await tab(true)
    expect(getEventIdOfEl(document.activeElement as HTMLElement)).toBe('a')
  })

  it.each([
    ['Enter', '{Enter}', 'Enter'],
    ['Space', ' ', ' '],
  ])('fires eventClick on %s', async (_desc, keys, expectedKey) => {
    const eventClick = vi.fn()
    const calendar = initCalendar({
      ...options,
      eventClick,
      events: [{ id: 'a', start: '2023-04-03' }],
    })
    await waitForSettle()

    const [eventEl] = getEventEls(calendar.el, 'a')
    eventEl.focus()
    await press(keys)

    expect(eventClick).toHaveBeenCalledOnce()
    const [arg] = eventClick.mock.calls[0]
    expect(arg.event.id).toBe('a')
    expect(arg.el).toBe(eventEl)
    expect(arg.jsEvent.type).toBe('keydown')
    expect(arg.jsEvent.key).toBe(expectedKey)
    expect(arg.view.type).toBe('dayGridMonth')
  })

  it('doesn\'t fire eventClick on other keys', async () => {
    const eventClick = vi.fn()
    const calendar = initCalendar({
      ...options,
      eventClick,
      events: [{ id: 'a', start: '2023-04-03' }],
    })
    await waitForSettle()

    const [eventEl] = getEventEls(calendar.el, 'a')
    eventEl.focus()
    await press('a')
    await press('{Escape}')
    expect(eventClick).not.toHaveBeenCalled()

    await press('{Enter}') // same mechanics
    expect(eventClick).toHaveBeenCalledOnce()
  })

  it('activates an event with a url as a native link, firing eventClick once', async () => {
    const eventClick = vi.fn((info) => {
      info.jsEvent.preventDefault() // don't navigate the test page
    })
    const { calendar, buttonEl } = await initAfterButton({
      ...options,
      eventClick,
      events: [{ id: 'a', start: '2023-04-03', url: '#a11y-event' }],
    })

    buttonEl.focus()
    await tab()
    const [eventEl] = getEventEls(calendar.el, 'a')
    expect(document.activeElement).toBe(eventEl)
    expect(eventEl.tagName).toBe('A')
    expect(eventEl.getAttribute('role')).toBeNull()

    await press('{Enter}')

    expect(eventClick).toHaveBeenCalledOnce()
    expect(eventClick.mock.calls[0][0].jsEvent.type).toBe('click') // the browser's activation click
    expect(window.location.hash).toBe('')
  })

  it('fires eventClick on Enter in list view', async () => {
    const eventClick = vi.fn()
    const calendar = initCalendar({
      initialView: 'listWeek',
      initialDate: '2023-04-03',
      headerToolbar: false,
      eventClick,
      events: [{ id: 'a', start: '2023-04-03T10:00:00' }],
    })
    await waitForSettle()

    const [eventEl] = getEventEls(calendar.el, 'a')
    expect(eventEl.tabIndex).toBe(0)
    eventEl.focus()
    await press('{Enter}')

    expect(eventClick).toHaveBeenCalledOnce()
    expect(eventClick.mock.calls[0][0].event.id).toBe('a')
  })
})

describe('keyboard access to nav links', () => {
  const options = {
    initialDate: '2023-04-12',
    navLinks: true,
    headerToolbar: {
      left: 'prev,next today',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek', // decides which views nav links go to
    },
  }

  function getNavLink(calendar: Calendar, closestSelector: string): HTMLElement {
    const navLinkEl = queryParts(calendar.el, 'navLink').find((el) => el.closest(closestSelector))
    if (!navLinkEl) {
      throw new Error(`No nav link within ${closestSelector}`)
    }
    return navLinkEl
  }

  it.each([
    ['a dayGridMonth day number', 'dayGridMonth', {}, '[data-date="2023-04-12"]', 'timeGridDay', ['2023-04-12', '2023-04-13']],
    ['a timeGridWeek day header', 'timeGridWeek', {}, '[data-date="2023-04-12"]', 'timeGridDay', ['2023-04-12', '2023-04-13']],
    ['a listWeek day header', 'listWeek', { events: [{ start: '2023-04-12T10:00:00' }] }, '[data-date="2023-04-12"]', 'timeGridDay', ['2023-04-12', '2023-04-13']],
    // (in a week view, the week number isn't a nav link)
    ['a timeGridDay week number', 'timeGridDay', { weekNumbers: true }, '.test-part-weekNumberHeader', 'timeGridWeek', ['2023-04-09', '2023-04-16']],
  ])('%s is a focusable link that navigates on Enter', async (_desc, initialView, extraOptions, closestSelector, expectedView, expectedRange) => {
    const calendar = initCalendar({ ...options, ...extraOptions, initialView })
    await waitForSettle()

    const navLinkEl = getNavLink(calendar, closestSelector)
    expect(navLinkEl.tabIndex).toBe(0)
    expect(navLinkEl.getAttribute('role')).toBe('link')

    navLinkEl.focus()
    await press('{Enter}')

    expect(calendar.view.type).toBe(expectedView)
    expect(getActiveRange(calendar)).toEqual(expectedRange)
  })

  it('navigates on Space', async () => {
    const calendar = initCalendar({ ...options, initialView: 'dayGridMonth' })
    await waitForSettle()

    getNavLink(calendar, '[data-date="2023-04-12"]').focus()
    await press(' ')

    expect(calendar.view.type).toBe('timeGridDay')
    expect(getActiveRange(calendar)).toEqual(['2023-04-12', '2023-04-13'])
  })

  it('passes the keyboard event to a custom navLinkDayClick', async () => {
    const navLinkDayClick = vi.fn()
    const calendar = initCalendar({ ...options, initialView: 'dayGridMonth', navLinkDayClick })
    await waitForSettle()

    getNavLink(calendar, '[data-date="2023-04-12"]').focus()
    await press('{Enter}')

    expect(navLinkDayClick).toHaveBeenCalledOnce()
    const [date, jsEvent] = navLinkDayClick.mock.calls[0]
    expect(date.toISOString()).toBe('2023-04-12T00:00:00.000Z')
    expect(jsEvent.type).toBe('keydown')
    expect(calendar.view.type).toBe('dayGridMonth')
  })

  // the header shows the weekday and the full date, both linking to the same day: one tab stop
  it('makes only the first of a list day header\'s two links tabbable', async () => {
    const calendar = initCalendar({ ...options, initialView: 'listWeek', events: [{ start: '2023-04-12T10:00:00' }] })
    await waitForSettle()

    const headerEl = queryParts(calendar.el, 'listDayHeader').find((el) => el.getAttribute('data-date') === '2023-04-12')!
    const navLinkEls = queryParts(headerEl, 'navLink')
    expect(navLinkEls.map((el) => el.getAttribute('aria-label'))).toEqual(['Go to Wednesday', 'Go to April 12, 2023'])
    expect(navLinkEls.map((el) => el.tabIndex)).toEqual([0, -1])
  })

  // the week number sits inside a row, where a link isn't allowed. the row's label reads the week
  it('keeps dayGrid inline week numbers out of the tab order and the a11y tree', async () => {
    const calendar = initCalendar({ ...options, initialView: 'dayGridMonth', weekNumbers: true })
    await waitForSettle()

    const weekNumberEl = queryParts(calendar.el, 'inlineWeekNumber')[0]
    const dayNavLinkEl = getNavLink(calendar, '[data-date="2023-04-12"]')
    expect(dayNavLinkEl.tabIndex).toBe(0) // day nav links in the same view are tabbable
    expect(getParts(weekNumberEl)).toContain('navLink')
    expect(weekNumberEl.tabIndex).toBe(-1)
    expect(weekNumberEl.getAttribute('role')).toBeNull()
    expect(weekNumberEl.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('keyboard access to more-links and their popover', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-08-01',
    headerToolbar: false as const,
    dayMaxEventRows: 2,
    eventClick() {},
    events: [
      { id: '1', title: 'event1', start: '2014-07-29' },
      { id: '2', title: 'event2', start: '2014-07-29' },
      { id: '3', title: 'event3', start: '2014-07-29' },
    ],
  }

  function getPopoverEl(): HTMLElement | null {
    return queryPart(document, 'popover')
  }

  async function openWithKeyboard(calendar: Calendar, keys = '{Enter}'): Promise<HTMLElement> {
    const [moreLinkEl] = getMoreLinkEls(calendar.el)
    moreLinkEl.focus()
    await press(keys)
    return moreLinkEl
  }

  it('is a focusable button that announces a dialog popup', async () => {
    const { calendar, buttonEl } = await initAfterButton(options)
    const [moreLinkEl] = getMoreLinkEls(calendar.el)

    buttonEl.focus()
    await tab() // event1
    await tab() // the more-link (event2 is hidden)
    expect(document.activeElement).toBe(moreLinkEl)
    expect(moreLinkEl.getAttribute('role')).toBe('button')
    expect(moreLinkEl.getAttribute('aria-haspopup')).toBe('dialog')
    expect(moreLinkEl.getAttribute('aria-expanded')).toBe('false')
    expect(moreLinkEl.hasAttribute('aria-controls')).toBe(false)
    expect(moreLinkEl.getAttribute('title')).toBe('Show 2 more events')
  })

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('opens the popover on %s and focuses its close button', async (_desc, keys) => {
    const calendar = initCalendar(options)
    await waitForSettle()
    expect(getPopoverEl()).toBeNull()

    const moreLinkEl = await openWithKeyboard(calendar, keys)

    const popoverEl = getPopoverEl()!
    expect(popoverEl).not.toBeNull()
    expect(moreLinkEl.getAttribute('aria-expanded')).toBe('true')
    expect(moreLinkEl.getAttribute('aria-controls')).toBe(popoverEl.id)
    expect(document.activeElement).toBe(queryPart(popoverEl, 'popoverClose'))
  })

  it('is a dialog labeled by its title, with a labeled close button', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()
    await openWithKeyboard(calendar)

    const popoverEl = getPopoverEl()!
    const closeEl = queryPart(popoverEl, 'popoverClose')!
    expect(popoverEl.getAttribute('role')).toBe('dialog')
    expect(document.getElementById(popoverEl.getAttribute('aria-labelledby')!)!.textContent).toBe('July 29, 2014')
    expect(closeEl.tagName).toBe('BUTTON')
    expect(closeEl.getAttribute('aria-label')).toBe('Close')
  })

  it.each([
    ['Escape', async () => {
      await press('{Escape}')
    }],
    ['Enter on the close button', async () => {
      await press('{Enter}') // the close button has focus
    }],
    ['tabbing past the last event', async () => {
      await tab() // event1
      await tab() // event2
      await tab() // event3
      expect(getPopoverEl()).not.toBeNull()
      await tab()
    }],
    ['shift-tabbing before the close button', async () => {
      await tab(true)
    }],
  ])('closes on %s and returns focus to the more-link', async (_desc, close) => {
    const calendar = initCalendar(options)
    await waitForSettle()
    const moreLinkEl = await openWithKeyboard(calendar)
    expect(getPopoverEl()).not.toBeNull()

    await close()

    expect(getPopoverEl()).toBeNull()
    expect(document.activeElement).toBe(moreLinkEl)
    expect(moreLinkEl.getAttribute('aria-expanded')).toBe('false')
    expect(moreLinkEl.hasAttribute('aria-controls')).toBe(false)
  })

  it('tabs through the popover\'s events, which fire eventClick on Enter', async () => {
    const eventClick = vi.fn()
    const calendar = initCalendar({ ...options, eventClick })
    await waitForSettle()
    await openWithKeyboard(calendar)
    const popoverEl = getPopoverEl()!

    const focusedIds: string[] = []
    for (let i = 0; i < 3; i++) {
      await tab()
      expect(popoverEl.contains(document.activeElement)).toBe(true)
      focusedIds.push(getEventIdOfEl(document.activeElement as HTMLElement))
    }
    expect(focusedIds).toEqual(['1', '2', '3'])

    await press('{Enter}')
    expect(eventClick).toHaveBeenCalledOnce()
    expect(eventClick.mock.calls[0][0].event.id).toBe('3')
  })

  it('opens on Enter in timeGrid', async () => {
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2014-08-01',
      headerToolbar: false,
      scrollTime: '01:00',
      eventMaxStack: 1,
      events: Array.from({ length: 3 }, () => ({ start: '2014-07-29T02:00:00', end: '2014-07-29T03:00:00' })),
    })
    await waitForSettle()

    const moreLinkEl = await openWithKeyboard(calendar)

    const popoverEl = getPopoverEl()!
    expect(popoverEl).not.toBeNull()
    expect(moreLinkEl.getAttribute('aria-controls')).toBe(popoverEl.id)
    expect(document.activeElement).toBe(queryPart(popoverEl, 'popoverClose'))

    await press('{Escape}')
    expect(getPopoverEl()).toBeNull()
    expect(document.activeElement).toBe(moreLinkEl)
  })
})

describe('keyboard access to toolbar buttons', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2023-04-12',
    now: '2023-04-12', // today's month is showing, so the today button is disabled
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
  }

  it('tabs through enabled buttons in order, skipping disabled ones', async () => {
    const { calendar, buttonEl } = await initAfterButton(options)
    const toolbar = ToolbarModel.header(calendar.el)!
    expect(toolbar.getButton('This Month').disabled).toBe(true)

    buttonEl.focus()
    await tab()
    expect(document.activeElement).toBe(toolbar.getButton('Previous Month'))
    await tab()
    expect(document.activeElement).toBe(toolbar.getButton('Next Month'))
    await tab()
    expect(document.activeElement).toBe(toolbar.getButton('Month view'))
    await tab()
    expect(document.activeElement).toBe(toolbar.getButton('Week view'))
  })

  it.each([
    ['Enter', '{Enter}'],
    ['Space', ' '],
  ])('activates a button on %s, keeping focus on it', async (_desc, keys) => {
    const calendar = initCalendar(options)
    await waitForSettle()
    const toolbar = ToolbarModel.header(calendar.el)!

    toolbar.getButton('Next Month').focus()
    await press(keys)

    expect(getActiveRange(calendar)).toEqual(['2023-04-30', '2023-06-11'])
    expect(document.activeElement).toBe(toolbar.getButton('Next Month'))
  })

  it('switches views from the keyboard, keeping focus on the view button', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()
    const toolbar = ToolbarModel.header(calendar.el)!

    toolbar.getButton('Week view').focus()
    await press('{Enter}')

    expect(calendar.view.type).toBe('timeGridWeek')
    expect(toolbar.getButton('Week view').getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(toolbar.getButton('Week view'))
  })
})
