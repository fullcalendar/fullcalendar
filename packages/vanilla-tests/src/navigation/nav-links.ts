import { describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getActiveRange } from '../lib/view-dates'

/*
Nav links: clickable dates and week numbers that go to a day or week view.
*/
describe('navLinks', () => {
  const options = {
    now: '2016-08-20',
    navLinks: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek', // decides which view nav links go to
    },
  }

  // the nav link inside the dated element (day cell, day header or list-day header)
  function getDateNavLink(calendar: Calendar, date: string): HTMLElement {
    const navLinkEls = queryParts(calendar.el, 'navLink').filter((el) => (
      el.closest('[data-date]')?.getAttribute('data-date') === date
    ))
    if (!navLinkEls.length) {
      throw new Error(`No nav link for ${date}`)
    }
    return navLinkEls[0]
  }

  async function clickEl(el: HTMLElement): Promise<void> {
    await userEvent.click(el)
    await waitForSettle()
  }

  describe('in month view', () => {
    const monthOptions = { ...options, initialView: 'dayGridMonth' }

    it.each<[string, CalendarOptions, string]>([
      ['by default, the toolbar\'s day view', {}, 'timeGridDay'],
      ['"day", the toolbar\'s day view', { navLinkDayClick: 'day' }, 'timeGridDay'],
      ['a view name', { navLinkDayClick: 'dayGridDay' }, 'dayGridDay'],
      // https://github.com/fullcalendar/fullcalendar/issues/4619
      ['by default with no toolbar, a day view', { headerToolbar: false }, 'dayGridDay'],
    ])('a day\'s link goes to %s', async (_desc, extraOptions, expectedView) => {
      const dateClick = vi.fn()
      const calendar = initCalendar({ ...monthOptions, ...extraOptions, dateClick })
      await waitForSettle()

      await clickEl(getDateNavLink(calendar, '2016-08-09'))

      expect(calendar.view.type).toBe(expectedView)
      expect(getActiveRange(calendar)).toEqual(['2016-08-09', '2016-08-10'])
      expect(dateClick).not.toHaveBeenCalled()
    })

    // https://github.com/fullcalendar/fullcalendar/issues/3869
    it('go to a different day after coming back', async () => {
      const calendar = initCalendar(monthOptions)
      await waitForSettle()

      await clickEl(getDateNavLink(calendar, '2016-08-09'))
      expect(getActiveRange(calendar)).toEqual(['2016-08-09', '2016-08-10'])

      calendar.changeView('dayGridMonth')
      await waitForSettle()

      await clickEl(getDateNavLink(calendar, '2016-08-10'))
      expect(calendar.view.type).toBe('timeGridDay')
      expect(getActiveRange(calendar)).toEqual(['2016-08-10', '2016-08-11'])
    })

    it('can run a custom handler for days instead', async () => {
      const navLinkDayClick = vi.fn()
      const calendar = initCalendar({ ...monthOptions, navLinkDayClick })
      await waitForSettle()

      await clickEl(getDateNavLink(calendar, '2016-08-09'))

      expect(navLinkDayClick).toHaveBeenCalledTimes(1)
      const [date, ev] = navLinkDayClick.mock.calls[0]
      expect(date.toISOString()).toBe('2016-08-09T00:00:00.000Z')
      expect(ev.type).toBe('click')
      expect(calendar.view.type).toBe('dayGridMonth') // didn't navigate
    })

    it('a week number\'s link goes to the week view', async () => {
      const dateClick = vi.fn()
      const calendar = initCalendar({ ...monthOptions, weekNumbers: true, dateClick })
      await waitForSettle()

      const weekNumberEls = queryParts(calendar.el, 'inlineWeekNumber')
      expect(weekNumberEls).toHaveLength(6)
      await clickEl(weekNumberEls[1])

      expect(calendar.view.type).toBe('timeGridWeek')
      expect(getActiveRange(calendar)).toEqual(['2016-08-07', '2016-08-14'])
      expect(dateClick).not.toHaveBeenCalled()
    })

    it('has no links in the day-of-week headers', async () => {
      const calendar = initCalendar(monthOptions)
      await waitForSettle()

      const headerEls = queryParts(calendar.el, 'dayHeader')
      expect(headerEls).toHaveLength(7)
      expect(headerEls.flatMap((el) => queryParts(el, 'navLink'))).toHaveLength(0)
      expect(queryParts(calendar.el, 'navLink').length).toBeGreaterThan(0) // the cells' links
    })
  })

  it('in week view, a day header\'s link goes to the day view', async () => {
    const dateClick = vi.fn()
    const calendar = initCalendar({ ...options, initialView: 'timeGridWeek', dateClick })
    await waitForSettle()

    await clickEl(getDateNavLink(calendar, '2016-08-15'))

    expect(calendar.view.type).toBe('timeGridDay')
    expect(getActiveRange(calendar)).toEqual(['2016-08-15', '2016-08-16'])
    expect(dateClick).not.toHaveBeenCalled()
  })

  it('in list view, a day header\'s link goes to the day view', async () => {
    const calendar = initCalendar({
      ...options,
      initialView: 'listWeek',
      events: [{ title: 'event 1', start: '2016-08-20' }],
    })
    await waitForSettle()

    await clickEl(getDateNavLink(calendar, '2016-08-20'))

    expect(calendar.view.type).toBe('timeGridDay')
    expect(getActiveRange(calendar)).toEqual(['2016-08-20', '2016-08-21'])
  })

  describe('in day view', () => {
    const dayOptions = { ...options, initialView: 'timeGridDay' }

    it('the week number\'s link goes to the week view', async () => {
      const dateClick = vi.fn()
      const calendar = initCalendar({ ...dayOptions, weekNumbers: true, dateClick })
      await waitForSettle()

      const navLinkEls = queryParts(calendar.el, 'navLink').filter((el) => el.closest('.test-part-weekNumberHeader'))
      expect(navLinkEls).toHaveLength(1)
      await clickEl(navLinkEls[0])

      expect(calendar.view.type).toBe('timeGridWeek')
      expect(getActiveRange(calendar)).toEqual(['2016-08-14', '2016-08-21'])
      expect(dateClick).not.toHaveBeenCalled()
    })

    it('the day header has no link', async () => {
      const calendar = initCalendar(dayOptions)
      await waitForSettle()

      const headerEls = queryParts(calendar.el, 'dayHeader')
      expect(headerEls).toHaveLength(1)
      expect(queryParts(headerEls[0], 'navLink')).toHaveLength(0)
    })
  })
})
