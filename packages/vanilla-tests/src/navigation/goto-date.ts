import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { ToolbarModel } from '../lib/models/toolbar'
import { enUsSep } from '../lib/intl'
import { waitForSettle } from '../lib/settle'
import { getActiveRange, getCurrentRange } from '../lib/view-dates'

describe('initialDate and getDate', () => {
  it.each([
    ['dayGridMonth', '2011-03-10', ['2011-02-27', '2011-04-10']],
    ['dayGridWeek', '2011-03-10', ['2011-03-06', '2011-03-13']],
    ['timeGridWeek', new Date('2011-03-10T00:00:00Z'), ['2011-03-06', '2011-03-13']],
    ['timeGridDay', '2011-03-10', ['2011-03-10', '2011-03-11']],
  ])('in %s, starts at the given date %j', async (initialView, initialDate, expectedRange) => {
    const calendar = initCalendar({ initialView, initialDate })
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(expectedRange)

    const date = calendar.getDate()
    expect(date).toBeInstanceOf(Date)
    expect(date.toISOString()).toBe('2011-03-10T00:00:00.000Z')
  })
})

describe('gotoDate', () => {
  it.each([
    ['dayGridMonth', '2015-04-01', ['2015-03-29', '2015-05-10'], 'April 2015'],
    ['dayGridWeek', '2015-04-01', ['2015-03-29', '2015-04-05'], `Mar${enUsSep}Apr 2015`],
    ['timeGridWeek', '2015-04-01T12:00:00', ['2015-03-29', '2015-04-05'], `Mar${enUsSep}Apr 2015`],
    ['timeGridWeek', new Date('2015-04-01T00:00:00Z'), ['2015-03-29', '2015-04-05'], `Mar${enUsSep}Apr 2015`],
    ['dayGridDay', '2015-04-01', ['2015-04-01', '2015-04-02'], 'April 1, 2015'],
  ])('in %s, moves to the given date %j', async (initialView, date, expectedRange, expectedTitle) => {
    const calendar = initCalendar({ initialView, initialDate: '2014-06-01' })
    await waitForSettle()

    calendar.gotoDate(date)
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(expectedRange)
    expect(ToolbarModel.header(calendar.el)!.getTitleText()).toBe(expectedTitle)
  })

  it('updates the date even when the range doesn\'t change', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2018-12-25' })
    await waitForSettle()

    calendar.gotoDate('2018-12-30')
    await waitForSettle()

    expect(calendar.getDate().toISOString()).toBe('2018-12-30T00:00:00.000Z')
    expect(getCurrentRange(calendar)).toEqual(['2018-12-01', '2019-01-01'])
  })

  it.each([
    ['a date in another month', '2017-06-01', ['2017-06-01', '2017-07-01']],
    ['a date in the same month', '2017-03-01', ['2017-03-01', '2017-04-01']],
  ])('works right after init while events are loading, given %s', async (_desc, date, expectedRange) => {
    const fetches: Promise<void>[] = []
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2017-03-30',
      events(_info, successCallback) {
        fetches.push(new Promise((resolve) => {
          setTimeout(() => {
            successCallback([{ id: 'a', start: date, title: 'event' }])
            resolve()
          }, 0)
        }))
      },
    })

    calendar.gotoDate(date)
    await Promise.all(fetches)
    await waitForSettle()

    expect(getCurrentRange(calendar)).toEqual(expectedRange)
    expect(new DayGridModel(calendar.el).getEventEls('a')).toHaveLength(1)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4929
  it('moves the range by a day when dateAlignment is a day', async () => {
    const calendar = initCalendar({
      initialDate: '2019-04-09',
      initialView: 'dayGridFourDays',
      views: {
        dayGridFourDays: {
          type: 'dayGrid',
          duration: { days: 4 },
          dateAlignment: 'day',
        },
      },
    })
    await waitForSettle()

    calendar.gotoDate('2019-04-10')
    await waitForSettle()

    expect(getActiveRange(calendar)).toEqual(['2019-04-10', '2019-04-14'])
  })
})
