import { describe, expect, it } from 'vitest'
import { CalendarOptions } from 'fullcalendar'
import deLocale from 'fullcalendar/locales/de'
import enGbLocale from 'fullcalendar/locales/en-gb'
import esLocale from 'fullcalendar/locales/es'
import frLocale from 'fullcalendar/locales/fr'
import koLocale from 'fullcalendar/locales/ko'
import nlLocale from 'fullcalendar/locales/nl'
import zhCnLocale from 'fullcalendar/locales/zh-cn'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getVisibleText } from '../lib/text'

async function getFirstHeaderText(options: CalendarOptions): Promise<string> {
  const calendar = initCalendar(options)
  await waitForSettle()
  return getVisibleText(queryParts(calendar.el, 'dayHeader')[0])
}

describe('dayHeaderFormat', () => {
  const initialDate = '2014-05-11' // a Sunday

  it.each([
    ['dayGridMonth', 'Sun'],
    ['dayGridWeek', 'Sun 11'],
    ['timeGridWeek', 'Sun 11'],
  ])('defaults in %s to %j', async (initialView, expected) => {
    expect(await getFirstHeaderText({ initialView, initialDate })).toBe(expected)
  })

  it.each([
    ['dayGridMonth', 'Sunday'],
    ['timeGridDay', 'Sunday, May 11'],
    ['dayGridWeek', 'Sunday, 5/11'],
  ])('can be set per view (%s)', async (initialView, expected) => {
    const views = {
      month: { dayHeaderFormat: { weekday: 'long' } },
      day: { dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' } },
      dayGridWeek: { dayHeaderFormat: { weekday: 'long', month: 'numeric', day: 'numeric' } },
    } as const

    expect(await getFirstHeaderText({ initialView, initialDate, views })).toBe(expected)
  })

  // fr and en-gb weeks start on Monday
  it.each([
    ['fr', 'dayGridMonth', 'lun.'],
    ['fr', 'timeGridWeek', 'lun. 5'],
    ['en-gb', 'dayGridMonth', 'Mon'],
    ['en-gb', 'timeGridWeek', 'Mon 5'],
    ['ko', 'dayGridMonth', '일'],
    ['ko', 'timeGridWeek', '11일 (일)'],
  ])('defaults to the %s locale\'s format in %s', async (localeCode, initialView, expected) => {
    const locale = { fr: frLocale, 'en-gb': enGbLocale, ko: koLocale }[localeCode]
    expect(await getFirstHeaderText({ initialView, initialDate, locale })).toBe(expected)
  })

  it.each([
    [{ years: 2 }, 'Sun'],
    [{ months: 2 }, 'Sun'],
    [{ weeks: 2 }, 'Sun'],
    [{ days: 2 }, 'Thu 25'],
  ])('in a custom dayGrid view with duration %j, defaults to %j', async (duration, expected) => {
    expect(await getFirstHeaderText({
      views: {
        custom: { type: 'dayGrid', duration },
      },
      initialView: 'custom',
      initialDate: '2014-12-25',
    })).toBe(expected)
  })
})

describe('day names in dayGridDay', () => {
  it('names each day of the week', async () => {
    const texts: string[] = []

    for (const day of ['17', '18', '19', '20', '21', '22', '23']) {
      texts.push(await getFirstHeaderText({ initialView: 'dayGridDay', initialDate: `2019-03-${day}` }))
    }

    expect(texts).toEqual([
      'Sunday 17', 'Monday 18', 'Tuesday 19', 'Wednesday 20', 'Thursday 21', 'Friday 22', 'Saturday 23',
    ])
  })

  it.each([
    ['es', esLocale, 'domingo 17'],
    ['fr', frLocale, 'dimanche 17'],
    ['de', deLocale, 'Sonntag 17'],
    ['zh-cn', zhCnLocale, '17日星期日'],
    ['nl', nlLocale, 'zondag 17'],
  ])('translates them for the %s locale', async (_name, locale, expected) => {
    expect(await getFirstHeaderText({ initialView: 'dayGridDay', initialDate: '2019-03-17', locale })).toBe(expected)
  })
})
