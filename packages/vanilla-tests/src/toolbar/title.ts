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
