import { describe, expect, it, vi } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { isForceReact } from '../lib/env'
import { queryPart } from '../lib/models/events'
import { getMoreLinkEls } from '../lib/models/event-content'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

const dayGridViews = { left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek,dayGridDay' }
const timeGridViews = { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }

async function clickMoreLink(calendar: Calendar): Promise<void> {
  const moreLinkEls = getMoreLinkEls(calendar.el)
  expect(moreLinkEls.length).toBe(1)
  await pointer.click(getRectCenter(moreLinkEls[0].getBoundingClientRect()))
  await waitForSettle()
}

describe('moreLinkClick', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-08-01',
    dayMaxEventRows: 3,
    events: Array.from({ length: 4 }, (_, i) => ({ title: `event${i + 1}`, start: '2014-07-29' })),
  }

  it('opens a popover by default', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()
    expect(queryPart(document, 'popover')).toBeNull()

    await clickMoreLink(calendar)

    expect(queryPart(document, 'popover')).not.toBeNull()
    expect(calendar.view.type).toBe('dayGridMonth')
  })

  it.each([
    { moreLinkClick: 'week', headerToolbar: dayGridViews, view: 'dayGridWeek', start: '2014-07-27' },
    { moreLinkClick: 'week', headerToolbar: timeGridViews, view: 'timeGridWeek', start: '2014-07-27' },
    { moreLinkClick: 'day', headerToolbar: dayGridViews, view: 'dayGridDay', start: '2014-07-29' },
    { moreLinkClick: 'day', headerToolbar: timeGridViews, view: 'timeGridDay', start: '2014-07-29' },
    { moreLinkClick: 'timeGridWeek', headerToolbar: dayGridViews, view: 'timeGridWeek', start: '2014-07-27' },
  ])('"$moreLinkClick" goes to $view, given the toolbar\'s views', async ({ moreLinkClick, headerToolbar, view, start }) => {
    const calendar = initCalendar({ ...options, moreLinkClick, headerToolbar })
    await waitForSettle()

    await clickMoreLink(calendar)

    expect(calendar.view.type).toBe(view)
    expect(calendar.view.currentStart.toISOString()).toBe(`${start}T00:00:00.000Z`)
    expect(queryPart(document, 'popover')).toBeNull()
  })

  it('calls a function with info about the day and its events', async () => {
    const moreLinkClick = vi.fn()
    const calendar = initCalendar({ ...options, moreLinkClick })
    await waitForSettle()

    await clickMoreLink(calendar)

    expect(moreLinkClick).toHaveBeenCalledOnce()
    const info = moreLinkClick.mock.calls[0][0]
    expect(info.date.toISOString()).toBe('2014-07-29T00:00:00.000Z')
    expect(info.allDay).toBe(true)
    expect(info.allSegs.map((seg: { event: { title: string } }) => seg.event.title))
      .toEqual(['event1', 'event2', 'event3', 'event4'])
    expect(info.hiddenSegs.map((seg: { event: { title: string } }) => seg.event.title)).toEqual(['event3', 'event4'])
    expect(info.view.type).toBe('dayGridMonth')
  })

  // KNOWN BUG under React (it.fails until fixed): jsEvent is React's SyntheticEvent, not the native event
  const itNotUnderReact = isForceReact ? it.fails : it

  itNotUnderReact('gives the function the native click event', async () => {
    const moreLinkClick = vi.fn()
    const calendar = initCalendar({ ...options, moreLinkClick })
    await waitForSettle()

    await clickMoreLink(calendar)

    expect(moreLinkClick).toHaveBeenCalledOnce()
    expect(moreLinkClick.mock.calls[0][0].jsEvent).toBeInstanceOf(MouseEvent)
  })

  it('goes to the view a function returns', async () => {
    const calendar = initCalendar({ ...options, moreLinkClick: () => 'timeGridDay' })
    await waitForSettle()

    await clickMoreLink(calendar)

    expect(calendar.view.type).toBe('timeGridDay')
    expect(calendar.view.currentStart.toISOString()).toBe('2014-07-29T00:00:00.000Z')
  })

  it.each([
    ['nothing', () => undefined],
    ['\'popover\'', () => 'popover'],
  ])('opens a popover when a function returns %s', async (_desc, moreLinkClick) => {
    const calendar = initCalendar({ ...options, moreLinkClick } as CalendarOptions)
    await waitForSettle()

    await clickMoreLink(calendar)

    expect(queryPart(document, 'popover')).not.toBeNull()
    expect(calendar.view.type).toBe('dayGridMonth')
  })

  it('gives the date in a named time zone', async () => {
    const moreLinkClick = vi.fn()
    const calendar = initCalendar({ ...options, timeZone: 'Asia/Hong_Kong', moreLinkClick } as CalendarOptions)
    await waitForSettle()

    await clickMoreLink(calendar)

    // midnight in Hong Kong (UTC+8)
    expect(moreLinkClick.mock.calls[0][0].date.toISOString()).toBe('2014-07-28T16:00:00.000Z')
  })
})
