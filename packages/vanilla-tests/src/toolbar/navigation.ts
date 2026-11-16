import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'
import { getActiveRange } from '../lib/view-dates'

/*
Clicking the toolbar's buttons. The footer toolbar has its own rendering, so both are covered.
*/
describe.each([
  ['headerToolbar', ToolbarModel.header],
  ['footerToolbar', ToolbarModel.footer],
] as const)('%s navigation', (toolbarOption, getToolbar) => {
  const toolbarInput = {
    left: 'next,prev,prevYear,nextYear today',
    center: '',
    right: 'title dayGridMonth,timeGridWeek,timeGridDay',
  }
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2010-02-01',
    now: '2010-05-15',
    headerToolbar: false as const,
    footerToolbar: false as const,
    [toolbarOption]: toolbarInput,
  }

  it.each([
    ['Next Month', '2010-03-01'],
    ['Previous Month', '2010-01-01'],
    ['Next Year', '2011-02-01'],
    ['Previous Year', '2009-02-01'],
    ['This Month', '2010-05-15'], // today
  ])('clicking %s moves the date to %s', async (label, expectedDate) => {
    const calendar = initCalendar(options)
    await waitForSettle()

    await getToolbar(calendar.el)!.clickButton(label)

    expect(calendar.formatIso(calendar.getDate()).slice(0, 10)).toBe(expectedDate) // `now` ticks from its given value, so ignore the time
    expect(calendar.view.type).toBe('dayGridMonth')
  })

  it('clicking a view button switches the view and keeps the date', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()

    await getToolbar(calendar.el)!.clickButton('Day view')

    expect(calendar.view.type).toBe('timeGridDay')
    expect(getActiveRange(calendar)).toEqual(['2010-02-01', '2010-02-02'])
  })

  it('marks the current view\'s button as selected', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()
    const toolbar = getToolbar(calendar.el)!

    expect(toolbar.getButton('Month view').getAttribute('aria-selected')).toBe('true')
    expect(toolbar.getButton('Week view').getAttribute('aria-selected')).toBe('false')

    await toolbar.clickButton('Week view')

    expect(toolbar.getButton('Month view').getAttribute('aria-selected')).toBe('false')
    expect(toolbar.getButton('Week view').getAttribute('aria-selected')).toBe('true')
  })
})
