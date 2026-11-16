import { describe, expect, it } from 'vitest'
import { CalendarOptions, WeekNumberCalculation } from 'fullcalendar'
import arLocale from 'fullcalendar/locales/ar'
import { initCalendar } from '../lib/calendar'
import { queryPart } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getVisibleText } from '../lib/text'

async function getWeekNumberText(options: CalendarOptions): Promise<string> {
  const calendar = initCalendar({ initialView: 'timeGridDay', weekNumbers: true, ...options })
  await waitForSettle()
  return getVisibleText(queryPart(calendar.el, 'weekNumberHeader')!)
}

describe('weekNumberCalculation', () => {
  it.each<[WeekNumberCalculation, string, string]>([
    ['local', '2013-11-23', 'W 47'], // a Saturday
    ['local', '2013-11-17', 'W 47'], // a Sunday, where local and ISO differ
    ['ISO', '2013-11-17', 'W 46'],
  ])('%s numbers %s as %s', async (weekNumberCalculation, initialDate, text) => {
    expect(await getWeekNumberText({ initialDate, weekNumberCalculation })).toBe(text)
  })

  it('local uses the locale\'s week rules', async () => {
    expect(await getWeekNumberText({
      initialDate: '2013-11-23', // a Saturday, which starts ar's weeks
      weekNumberCalculation: 'local',
      locale: arLocale,
    })).toBe('48 أسبوع')
  })

  it('can be a function', async () => {
    expect(await getWeekNumberText({ initialDate: '2013-11-17', weekNumberCalculation: () => 4 })).toBe('W 4')
  })
})
