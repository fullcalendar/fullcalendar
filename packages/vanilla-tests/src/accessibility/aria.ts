import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'
import { getScreenReaderEls } from '../lib/text'

/*
ARIA roles and labels of the views and the toolbar.
SEE ALSO: day-headers/a11y.ts, day-cells/a11y.ts, event-render/a11y.ts (texts and event lists),
time-slots/labels.ts (the timed row header), toolbar/rendering.ts (aria-labelledby on the view)
*/

function queryRole(root: ParentNode, role: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(`[role="${role}"]`))
}

function getLabelText(el: HTMLElement): string {
  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    return document.getElementById(labelledBy)!.textContent!
  }
  return el.getAttribute('aria-label')!
}

function getTodayEls(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[aria-current="date"]'))
}

describe('view semantics', () => {
  const initialDate = '2023-04-12'

  // the element holding the view's days: a table, or a list for list and multiMonth views
  function getLabeledEl(calendar: Calendar): HTMLElement {
    const viewEl = queryPart(calendar.el, 'view')!
    return viewEl.matches('[role]') ? viewEl : viewEl.querySelector<HTMLElement>('[role]')!
  }

  it.each([
    ['dayGridMonth', 'table'],
    ['timeGridWeek', 'table'],
    ['listWeek', 'list'],
    ['multiMonthYear', 'list'],
  ])('labels the %s %s with the title, from the toolbar or else directly', async (initialView, role) => {
    const events = [{ start: '2023-04-12T10:00:00' }] // list views need an event to render a list
    const withTitle = initCalendar({ initialView, initialDate, events })
    const withoutTitle = initCalendar({ initialView, initialDate, events, headerToolbar: { left: 'prev,next' } })
    await waitForSettle()

    const titledEl = getLabeledEl(withTitle)
    const titleEl = queryPart(withTitle.el, 'toolbarTitle')!
    expect(titledEl.getAttribute('role')).toBe(role)
    expect(titledEl.getAttribute('aria-labelledby')).toBe(titleEl.id)
    expect(titleEl.textContent).toBe(withTitle.view.title)

    const untitledEl = getLabeledEl(withoutTitle)
    expect(queryPart(withoutTitle.el, 'toolbarTitle')).toBeNull()
    expect(untitledEl.getAttribute('role')).toBe(role)
    expect(untitledEl.hasAttribute('aria-labelledby')).toBe(false)
    expect(untitledEl.getAttribute('aria-label')).toBe(withoutTitle.view.title)
    expect(withoutTitle.view.title).toBe(withTitle.view.title)
  })

  describe('dayGridMonth', () => {
    it('is a table of week rows with a column header per weekday', async () => {
      const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate, now: initialDate })
      await waitForSettle()
      const tableEl = queryPart(calendar.el, 'view')!

      expect(tableEl.getAttribute('role')).toBe('table')
      expect(tableEl.getAttribute('aria-rowcount')).toBe('7') // the header row and 6 weeks
      expect(tableEl.getAttribute('aria-colcount')).toBe('7')

      const rowEls = queryRole(tableEl, 'row')
      expect(rowEls).toHaveLength(7)
      expect(queryRole(rowEls[0], 'columnheader')).toHaveLength(7)
      expect(rowEls.slice(1).map((el) => el.getAttribute('aria-label'))).toEqual([
        'Week 13', 'Week 14', 'Week 15', 'Week 16', 'Week 17', 'Week 18',
      ])
      for (const rowEl of rowEls.slice(1)) {
        expect(queryRole(rowEl, 'cell')).toHaveLength(7)
      }

      expect(getTodayEls(tableEl).map((el) => el.getAttribute('data-date'))).toEqual(['2023-04-12'])
      expect(getTodayEls(tableEl)[0].getAttribute('role')).toBe('cell')
    })

    it('marks days outside validRange as disabled cells', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate,
        validRange: { start: '2023-04-10' },
      })
      await waitForSettle()

      const cellEls = queryRole(calendar.el, 'cell')
      const disabledEls = cellEls.filter((el) => el.getAttribute('aria-disabled') === 'true')
      expect(cellEls).toHaveLength(42)
      expect(disabledEls).toHaveLength(15) // March 26 to April 9
      for (const el of disabledEls) {
        expect(el.hasAttribute('data-date')).toBe(false)
        expect(el.textContent).toBe('')
      }
      expect(cellEls[15].getAttribute('data-date')).toBe('2023-04-10')
      expect(cellEls[15].hasAttribute('aria-disabled')).toBe(false)
    })
  })

  describe('timeGridWeek', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate,
      now: initialDate,
    }

    it('is a table with an all-day row and a timed row, each with a row header', async () => {
      const calendar = initCalendar(options)
      await waitForSettle()
      const tableEl = queryPart(calendar.el, 'view')!

      expect(tableEl.getAttribute('role')).toBe('table')

      const [headerRowEl, allDayRowEl, timedRowEl, ...otherRowEls] = queryRole(tableEl, 'row')
      expect(otherRowEls).toEqual([])

      // an empty cell above the row headers, then the days
      expect(queryRole(headerRowEl, 'cell')).toHaveLength(1)
      expect(queryRole(headerRowEl, 'columnheader').map((el) => el.getAttribute('data-date'))).toEqual([
        '2023-04-09', '2023-04-10', '2023-04-11', '2023-04-12', '2023-04-13', '2023-04-14', '2023-04-15',
      ])

      const allDayHeaderEl = queryRole(allDayRowEl, 'rowheader')
      expect(allDayHeaderEl).toHaveLength(1)
      expect(allDayHeaderEl[0].textContent).toBe('All-day')
      expect(queryRole(allDayRowEl, 'cell')).toHaveLength(7)

      const timedHeaderEls = queryRole(timedRowEl, 'rowheader')
      expect(timedHeaderEls).toHaveLength(1)
      expect(getScreenReaderEls(timedHeaderEls[0]).map((el) => el.textContent)).toEqual(['Timed'])
      const laneEls = queryRole(timedRowEl, 'cell')
      expect(laneEls).toEqual(queryParts(calendar.el, 'dayLane'))
      expect(laneEls).toHaveLength(7)

      expect(getTodayEls(tableEl).map((el) => el.getAttribute('role'))).toEqual(['columnheader', 'cell', 'cell'])
    })

    // the slot labels and lines are visual. the timed row header reads "Timed" instead
    it('hides the slot labels and lines from screen readers', async () => {
      const calendar = initCalendar(options)
      await waitForSettle()

      const slotHeaderEls = queryParts(calendar.el, 'slotHeader')
      const slotLaneEls = queryParts(calendar.el, 'slotLane')
      expect(slotHeaderEls.length).toBeGreaterThan(0)
      expect(slotLaneEls.length).toBe(slotHeaderEls.length)

      for (const el of [...slotHeaderEls, ...slotLaneEls]) {
        expect(el.closest('[aria-hidden="true"]')).not.toBeNull()
      }
      expect(queryPart(calendar.el, 'dayLane')!.closest('[aria-hidden="true"]')).toBeNull()
    })

    // https://github.com/fullcalendar/fullcalendar/issues/8124
    // every row has the row header column (or the corner cell above it), plus a column per day
    it.each([
      ['', {}, 8],
      [' in timeGridDay', { initialView: 'timeGridDay' }, 2],
      [' without weekends', { weekends: false }, 6],
      [' with only the timed row', { dayHeaders: false, allDaySlot: false }, 8],
      [' with the week number in the corner, in RTL', { weekNumbers: true, direction: 'rtl' as const }, 8],
    ])('counts the row header column in aria-colcount%s', async (_desc, moreOptions, colCount) => {
      const calendar = initCalendar({ ...options, ...moreOptions })
      await waitForSettle()
      const tableEl = queryPart(calendar.el, 'view')!

      expect(tableEl.getAttribute('aria-colcount')).toBe(String(colCount))
      const rowEls = queryRole(tableEl, 'row')
      expect(rowEls.length).toBeGreaterThan(0)
      for (const rowEl of rowEls) {
        const cellEls = [...queryRole(rowEl, 'rowheader'), ...queryRole(rowEl, 'columnheader'), ...queryRole(rowEl, 'cell')]
        expect(cellEls.reduce((total, el) => total + Number(el.getAttribute('aria-colspan') || 1), 0)).toBe(colCount)
      }
    })

    it('marks days outside validRange as disabled cells', async () => {
      const calendar = initCalendar({ ...options, validRange: { start: '2023-04-12' } })
      await waitForSettle()

      const laneEls = queryParts(calendar.el, 'dayLane')
      expect(laneEls).toHaveLength(7)
      expect(laneEls.map((el) => el.getAttribute('role'))).toEqual(Array(7).fill('cell'))
      expect(laneEls.map((el) => el.getAttribute('aria-disabled'))).toEqual([
        'true', 'true', 'true', null, null, null, null,
      ])
    })
  })

  describe('list view', () => {
    const options = {
      initialView: 'listWeek',
      initialDate,
      now: initialDate,
    }

    it('is a list of days, each a list of events', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { title: 'a', start: '2023-04-10T10:00:00' },
          { title: 'b', start: '2023-04-12T10:00:00' },
          { title: 'c', start: '2023-04-12T11:00:00' },
        ],
      })
      await waitForSettle()

      const daysEl = queryPart(calendar.el, 'listDays')!
      expect(daysEl.getAttribute('role')).toBe('list')

      const dayEls = queryParts(calendar.el, 'listDay')
      expect(dayEls.map((el) => el.getAttribute('role'))).toEqual(['listitem', 'listitem'])
      expect(dayEls.map((el) => el.parentElement)).toEqual([daysEl, daysEl])
      expect(dayEls.map((el) => el.getAttribute('aria-label'))).toEqual(['April 10, 2023', 'April 12, 2023'])

      const dayBodyEls = queryParts(calendar.el, 'listDayBody')
      expect(dayBodyEls.map((el) => el.getAttribute('role'))).toEqual(['list', 'list'])
      expect(dayBodyEls.map((el) => el.getAttribute('aria-label'))).toEqual(['Events', 'Events'])
      expect(dayBodyEls.map((el) => queryRole(el, 'listitem').length)).toEqual([1, 2])

      const todayEls = getTodayEls(calendar.el)
      expect(todayEls).toEqual([queryParts(dayEls[1], 'listDayHeader')[0]])
    })

    it('labels the event lists with eventsHint', async () => {
      const calendar = initCalendar({
        ...options,
        eventsHint: 'Appointments',
        events: [{ start: '2023-04-12T10:00:00' }],
      })
      await waitForSettle()

      expect(queryPart(calendar.el, 'listDayBody')!.getAttribute('aria-label')).toBe('Appointments')
    })

    // a polite live region, so the message is announced when navigating to an empty range
    it('announces the no-events message as a status', async () => {
      const calendar = initCalendar(options)
      await waitForSettle()

      const noEventsEl = queryPart(calendar.el, 'noEvents')!
      expect(noEventsEl.getAttribute('role')).toBe('status')
      expect(noEventsEl.textContent).toBe('No events to display')
      expect(queryPart(calendar.el, 'listDays')).toBeNull()
    })
  })

  it('renders multiMonth as a list of month tables, each labeled by its month title', async () => {
    const calendar = initCalendar({ initialView: 'multiMonthYear', initialDate })
    await waitForSettle()

    const monthEls = queryParts(calendar.el, 'singleMonth')
    expect(monthEls).toHaveLength(12)
    expect(monthEls.map((el) => el.getAttribute('role'))).toEqual(Array(12).fill('table'))
    expect(monthEls.map(getLabelText)).toEqual([
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ])

    const listEl = monthEls[0].parentElement!.parentElement!
    expect(listEl.getAttribute('role')).toBe('list')
    expect(monthEls.map((el) => el.parentElement!.getAttribute('role'))).toEqual(Array(12).fill('listitem'))
    expect(queryRole(monthEls[3], 'columnheader')).toHaveLength(7)
  })
})

describe('toolbar semantics', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2023-04-12',
  }

  it.each([
    ['by default', {}, '2'],
    ['with headingLevel', { headingLevel: 3 }, '3'],
  ])('renders the title as a heading, %s at level %s', async (_desc, extraOptions, level) => {
    const calendar = initCalendar({ ...options, ...extraOptions })
    await waitForSettle()

    const titleEl = queryPart(calendar.el, 'toolbarTitle')!
    expect(titleEl.getAttribute('role')).toBe('heading')
    expect(titleEl.getAttribute('aria-level')).toBe(level)
    expect(titleEl.textContent).toBe('April 2023')
  })

  it('renders a group of view buttons as tabs, marking the current view selected', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: { right: 'dayGridMonth,timeGridWeek,listWeek' },
    })
    await waitForSettle()
    const toolbar = ToolbarModel.header(calendar.el)!

    const groupEl = queryPart(toolbar.el, 'buttonGroup')!
    expect(groupEl.getAttribute('role')).toBe('tablist')
    expect(groupEl.getAttribute('aria-label')).toBe('Change view')

    const buttonEls = toolbar.getButtons()
    expect(buttonEls.map((el) => el.parentElement)).toEqual([groupEl, groupEl, groupEl])
    expect(buttonEls.map((el) => el.getAttribute('role'))).toEqual(['tab', 'tab', 'tab'])
    expect(buttonEls.map((el) => el.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false'])
    expect(buttonEls.map((el) => el.hasAttribute('aria-pressed'))).toEqual([false, false, false])
  })

  it('labels the view tabs with viewChangeHint', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: { right: 'dayGridMonth,timeGridWeek' },
      viewChangeHint: 'Switch the view',
    })
    await waitForSettle()

    expect(queryPart(calendar.el, 'buttonGroup')!.getAttribute('aria-label')).toBe('Switch the view')
  })

  // not tabs when grouped with other buttons: a view button is then a toggle button
  it('marks a view button grouped with other buttons as pressed instead', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: { right: 'today,dayGridMonth,timeGridWeek' },
    })
    await waitForSettle()
    const toolbar = ToolbarModel.header(calendar.el)!

    const groupEl = queryPart(toolbar.el, 'buttonGroup')!
    expect(groupEl.hasAttribute('role')).toBe(false)
    expect(groupEl.hasAttribute('aria-label')).toBe(false)

    const monthEl = toolbar.getButton('Month view')
    const weekEl = toolbar.getButton('Week view')
    expect([monthEl, weekEl].map((el) => el.getAttribute('role'))).toEqual([null, null])
    expect([monthEl, weekEl].map((el) => el.getAttribute('aria-pressed'))).toEqual(['true', 'false'])
    expect([monthEl, weekEl].map((el) => el.hasAttribute('aria-selected'))).toEqual([false, false])
  })

  /*
  Only view buttons have a pressed or selected state. Prev, next and today aren't toggles, alone or
  grouped with view buttons. https://github.com/fullcalendar/fullcalendar/issues/8042
  */
  it('doesn\'t mark prev, next and today as toggle buttons', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: { left: 'prev,next today', right: 'today,dayGridMonth' },
    })
    await waitForSettle()

    const buttonEls = ToolbarModel.header(calendar.el)!.getButtons()
      .filter((el) => !el.textContent!.includes('Month'))
    expect(buttonEls).toHaveLength(4)
    expect(buttonEls.map((el) => el.hasAttribute('aria-pressed'))).toEqual([false, false, false, false])
  })

  // a tab must be owned by a tablist, so a view button alone in its group is a toggle button instead
  it('marks a lone view button as pressed, not as a tab', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: { left: 'prev,next', right: 'dayGridMonth' },
    })
    await waitForSettle()

    const buttonEl = ToolbarModel.header(calendar.el)!.getButton('Month view')
    expect(buttonEl.hasAttribute('role')).toBe(false)
    expect(buttonEl.hasAttribute('aria-selected')).toBe(false)
    expect(buttonEl.getAttribute('aria-pressed')).toBe('true')
    expect(calendar.el.querySelector('[role="tablist"]')).toBeNull()
  })

  it('labels icon buttons with their hint, hiding the icon', async () => {
    const calendar = initCalendar({
      ...options,
      headerToolbar: { left: 'prev,next' },
    })
    await waitForSettle()
    const toolbar = ToolbarModel.header(calendar.el)!

    for (const label of ['Previous Month', 'Next Month']) {
      const buttonEl = toolbar.getButton(label)
      expect(buttonEl.tagName).toBe('BUTTON')
      expect(buttonEl.textContent).toBe('')
      expect(buttonEl.children).toHaveLength(1)
      expect(buttonEl.children[0].getAttribute('aria-hidden')).toBe('true')
    }
  })
})
