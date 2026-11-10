import { describe, expect, it } from 'vitest'
import { CalendarOptions, ViewOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'

/*
Options in `views`, keyed by a view name, a view type (dayGrid, timeGrid), or a unit (week, day).
They're probed through titleFormat, whose result shows in the toolbar title.
*/
describe('view-specific options', () => {
  const VIEW_NAMES = ['dayGridMonth', 'dayGridWeek', 'dayGridDay', 'timeGridWeek', 'timeGridDay']

  async function getTitlesByView(options: CalendarOptions, viewNames = VIEW_NAMES): Promise<Record<string, string>> {
    const calendar = initCalendar({
      initialView: viewNames[0],
      titleFormat: () => 'default',
      ...options,
    })
    const titles: Record<string, string> = {}

    for (const viewName of viewNames) {
      calendar.changeView(viewName)
      await waitForSettle()
      titles[viewName] = ToolbarModel.header(calendar.el)!.getTitleText()
    }

    return titles
  }

  it.each([
    ['a view name (dayGridMonth)', 'dayGridMonth', ['dayGridMonth']],
    ['a view name (timeGridWeek)', 'timeGridWeek', ['timeGridWeek']],
    ['dayGrid views', 'dayGrid', ['dayGridMonth', 'dayGridWeek', 'dayGridDay']],
    ['timeGrid views', 'timeGrid', ['timeGridWeek', 'timeGridDay']],
    ['week views', 'week', ['dayGridWeek', 'timeGridWeek']],
    ['day views', 'day', ['dayGridDay', 'timeGridDay']],
  ])('can target %s', async (_desc, viewKey, expectedSpecialViews) => {
    const titles = await getTitlesByView({
      views: {
        [viewKey]: { titleFormat: () => 'special' },
      },
    })

    expect(titles).toEqual(Object.fromEntries(VIEW_NAMES.map((viewName) => [
      viewName,
      expectedSpecialViews.includes(viewName) ? 'special' : 'default',
    ])))
  })

  it('apply to plugin views that extend a view type', async () => {
    const titles = await getTitlesByView({
      plugins: [{
        name: 'super-basic-plugin',
        views: {
          superBasic: { type: 'dayGrid', content: 'hello world' },
        },
      }],
      views: {
        dayGrid: { titleFormat: () => 'special' },
      },
    }, ['superBasic', 'dayGridMonth', 'timeGridDay'])

    expect(titles).toEqual({
      superBasic: 'special',
      dayGridMonth: 'special',
      timeGridDay: 'default',
    })
  })

  describe('for custom views', () => {
    it.each<[string, Record<string, ViewOptions>, CalendarOptions, string]>([
      ['use their own options', {
        custom: { type: 'dayGrid', duration: { days: 4 }, titleFormat: () => 'custom' },
      }, {}, 'custom'],
      ['inherit options from their type', {
        dayGrid: { titleFormat: () => 'dayGrid' },
        custom: { type: 'dayGrid', duration: { days: 4 } },
      }, {}, 'dayGrid'],
      ['override options from their type', {
        dayGrid: { titleFormat: () => 'dayGrid' },
        custom: { type: 'dayGrid', duration: { days: 4 }, titleFormat: () => 'custom' },
      }, {}, 'custom'],
      ['inherit "week" options when a week long', {
        week: { titleFormat: () => 'week' },
        custom: { type: 'dayGrid', duration: { weeks: 1 } },
      }, {}, 'week'],
      ['prefer their type\'s options over "week" options', {
        week: { titleFormat: () => 'week' },
        dayGrid: { titleFormat: () => 'dayGrid' },
        custom: { type: 'dayGrid', duration: { weeks: 1 } },
      }, {}, 'dayGrid'],
      ['don\'t inherit "week" options when longer than a week', {
        week: { titleFormat: () => 'week' },
        custom: { type: 'dayGrid', duration: { weeks: 2 } },
      }, { titleFormat: () => 'default' }, 'default'],
    ])('%s', async (_desc, views, extraOptions, expectedTitle) => {
      const titles = await getTitlesByView({ views, ...extraOptions }, ['custom'])
      expect(titles.custom).toBe(expectedTitle)
    })
  })
})
