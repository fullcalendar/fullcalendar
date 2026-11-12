import { describe, expect, it, vi } from 'vitest'
import frLocale from 'fullcalendar/locales/fr'
import { initCalendar } from '../lib/calendar'
import { enUsSep } from '../lib/intl'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'

async function getTitleText(calendar: { el: HTMLElement }): Promise<string> {
  await waitForSettle()
  return ToolbarModel.header(calendar.el)!.getTitleText()
}

describe('calendar title', () => {
  it('updates when switching views', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', now: '2017-03-29' })
    expect(await getTitleText(calendar)).toBe('March 2017')

    calendar.changeView('timeGridWeek')
    expect(await getTitleText(calendar)).toBe(`Mar${enUsSep}Apr 2017`)

    calendar.changeView('dayGridMonth')
    expect(await getTitleText(calendar)).toBe('March 2017')
  })

  it('updates when navigating', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2017-03-29' })
    expect(await getTitleText(calendar)).toBe('March 2017')

    calendar.next()
    expect(await getTitleText(calendar)).toBe('April 2017')
  })

  it.each([
    [true, `Apr${enUsSep}May 2017`],
    [false, 'May 2017'],
  ])('includes hidden days only when shown (weekends: %s)', async (weekends, expected) => {
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2017-05-03', // the week starts on Sunday, April 30
      weekends,
    })
    expect(await getTitleText(calendar)).toBe(expected)
  })

  it('is available as view.title, including in viewDidMount', async () => {
    const titlesInViewDidMount: string[] = [] // read during the callback, not afterward
    const viewDidMount = vi.fn((info) => {
      titlesInViewDidMount.push(info.view.title)
    })
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2015-01-01', viewDidMount })
    await waitForSettle()

    expect(calendar.view.title).toBe('January 2015')
    expect(viewDidMount).toHaveBeenCalledTimes(1)
    expect(titlesInViewDidMount).toEqual(['January 2015'])
  })
})

describe('titleFormat', () => {
  it.each([
    ['dayGridMonth', 'June 2014'],
    ['dayGridWeek', 'June 2014'],
    ['timeGridWeek', 'June 2014'],
    ['dayGridDay', 'June 12, 2014'],
    ['timeGridDay', 'June 12, 2014'],
  ])('defaults in %s to "%s"', async (initialView, expected) => {
    const calendar = initCalendar({ initialView, initialDate: '2014-06-12' })
    expect(await getTitleText(calendar)).toBe(expected)
  })

  it.each([
    ['dayGridMonth', 'juin 2014'],
    ['timeGridWeek', 'juin 2014'],
    ['dayGridDay', '12 juin 2014'],
  ])('is translated by the locale in %s', async (initialView, expected) => {
    const calendar = initCalendar({ initialView, initialDate: '2014-06-12', locale: frLocale })
    expect(await getTitleText(calendar)).toBe(expected)
  })

  it.each([
    ['dayGridMonth', 'June 2014'],
    ['dayGridWeek', `Jun 8${enUsSep}14, 2014`],
    ['timeGridWeek', `June 8${enUsSep}14, 2014`],
    ['dayGridDay', 'Thursday, June 12, 2014'],
  ])('can be set per view, in %s', async (initialView, expected) => {
    const calendar = initCalendar({
      initialView,
      initialDate: '2014-06-12',
      titleFormat: () => 'default', // overridden by all of the views below
      views: {
        month: { titleFormat: { year: 'numeric', month: 'long' } },
        dayGridWeek: { titleFormat: { day: 'numeric', month: 'short', year: 'numeric' } },
        week: { titleFormat: { day: 'numeric', month: 'long', year: 'numeric' } },
        dayGridDay: { titleFormat: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } },
      },
    })
    expect(await getTitleText(calendar)).toBe(expected)
  })

  it.each([
    ['2 years', { years: 2 }, `2014${enUsSep}2015`],
    ['2 months', { months: 2 }, `Dec 2014${enUsSep}Jan 2015`],
    ['2 weeks', { weeks: 2 }, `Dec 2014${enUsSep}Jan 2015`],
    ['2 days', { days: 2 }, 'December 2014'],
  ])('for a custom %s view, defaults to a format for the duration', async (_desc, duration, expected) => {
    const calendar = initCalendar({
      views: {
        custom: { type: 'dayGrid', duration },
      },
      initialView: 'custom',
      initialDate: '2014-12-25',
    })
    expect(await getTitleText(calendar)).toBe(expected)
  })
})

describe('view.titleParts', () => {
  function projectParts(calendar: { view: { titleParts: { type: string, value: string, source: string }[] } }) {
    return calendar.view.titleParts.map((part) => [part.type, part.value, part.source])
  }

  it('holds the parts of a single-month title, all shared', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2025-05-12' })
    await waitForSettle()

    expect(calendar.view.title).toBe('May 2025')
    expect(projectParts(calendar)).toEqual([
      ['month', 'May', 'shared'],
      ['literal', ' ', 'shared'],
      ['year', '2025', 'shared'],
    ])
  })

  it('marks the start and end of a range across two months', async () => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', initialDate: '2025-04-30' })
    await waitForSettle()

    expect(calendar.view.title).toBe(`Apr${enUsSep}May 2025`)
    expect(projectParts(calendar)).toEqual([
      ['month', 'Apr', 'startRange'],
      ['literal', enUsSep, 'shared'],
      ['month', 'May', 'endRange'],
      ['literal', ' ', 'shared'],
      ['year', '2025', 'shared'],
    ])
  })

  it('marks the start and end of a range across two years', async () => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', initialDate: '2025-12-30' })
    await waitForSettle()

    expect(calendar.view.title).toBe(`Dec 2025${enUsSep}Jan 2026`)
    expect(projectParts(calendar).map(([type, , source]) => [type, source])).toEqual([
      ['month', 'startRange'],
      ['literal', 'startRange'],
      ['year', 'startRange'],
      ['literal', 'shared'],
      ['month', 'endRange'],
      ['literal', 'endRange'],
      ['year', 'endRange'],
    ])
  })

  it('follows the locale', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2025-05-12', locale: 'ja' })
    await waitForSettle()

    expect(calendar.view.titleParts.map((part) => part.type)).toEqual(['year', 'literal', 'month', 'literal'])
    expect(calendar.view.titleParts.map((part) => part.value).join('')).toBe(calendar.view.title)
  })

  it('is one literal part for a function titleFormat', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2025-05-12', titleFormat: () => 'Custom' })
    await waitForSettle()

    expect(projectParts(calendar)).toEqual([['literal', 'Custom', 'shared']])
  })

  it('updates when navigating', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2025-05-12' })
    await waitForSettle()

    calendar.next()
    await waitForSettle()

    expect(calendar.view.titleParts.map((part) => part.value).join('')).toBe('June 2025')
  })
})
