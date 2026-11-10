import { describe, expect, it } from 'vitest'
import ptBrLocale from 'fullcalendar/locales/pt-br'
import { initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

describe('allDaySlot', () => {
  it.each([
    [{}, 7], // the default: true
    [{ allDaySlot: true }, 7],
    [{ allDaySlot: false }, 0],
  ])('with %j, renders %i all-day cells', async (options, count) => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', ...options })
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayCell').length).toBe(count)
    expect(queryParts(calendar.el, 'allDayHeader').length).toBe(count ? 1 : 0)
  })
})

describe('allDayText', () => {
  it.each([
    ['by default', {}, 'All-day'],
    ['for a locale', { locale: ptBrLocale }, 'Dia\ninteiro'],
    ['when set', { allDayText: 'axis-phosy' }, 'axis-phosy'],
  ])('labels the all-day row %s', async (_desc, options, text) => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', ...options })
    await waitForSettle()

    expect(queryPart(calendar.el, 'allDayHeader')!.textContent).toBe(text)
  })
})
