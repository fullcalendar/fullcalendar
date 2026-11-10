import { describe, expect, it, vi } from 'vitest'
import { sliceEvents } from 'fullcalendar'
import { strictModeFactor } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { queryPart } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
Views defined by plugins with content hooks, and custom views defined in `views`.
SEE ALSO: visible-range/duration.ts, for the dates custom views render, and
views-specific-options.ts, for the options they inherit.
*/
describe('custom views', () => {
  it('a plugin view renders its content and gets the view\'s data and lifecycle', async () => {
    const didMount = vi.fn()
    const willUnmount = vi.fn()
    const content = vi.fn((props: any) => {
      const eventRanges = sliceEvents(props, true) // allDay
      return { html: `<div class="hello-world">${eventRanges.map((range) => range.def.title).join(',')}</div>` }
    })

    const calendar = initCalendar({
      plugins: [{
        name: 'custom-view-plugin',
        views: {
          custom: { className: 'awesome-view', didMount, willUnmount, content },
        },
      }],
      initialView: 'custom',
      initialDate: '2014-12-25', // a single-day view
      events: [
        { title: 'Holidays', start: '2014-12-25T09:00:00', end: '2014-12-25T11:00:00' },
        { title: 'Later', start: '2014-12-27' },
      ],
    })
    await waitForSettle()

    const viewEl = queryPart(calendar.el, 'view')!
    expect(viewEl.classList.contains('awesome-view')).toBe(true)
    expect(viewEl.querySelector('.hello-world')!.textContent).toBe('Holidays') // only the in-range event

    expect(didMount).toHaveBeenCalledTimes(1 * strictModeFactor)
    expect(content).toHaveBeenCalledTimes(1 * strictModeFactor)
    expect(willUnmount).toHaveBeenCalledTimes(strictModeFactor - 1)

    const props = content.mock.calls[0][0]
    expect(props.dateProfile.activeRange.start.toISOString()).toBe('2014-12-25T00:00:00.000Z')
    expect(props.dateProfile.activeRange.end.toISOString()).toBe('2014-12-26T00:00:00.000Z')
    expect(props.dateSelection).toBe(null)

    const [eventRange] = sliceEvents(props, true)
    expect(eventRange.isStart).toBe(true)
    expect(eventRange.isEnd).toBe(true)
    // sliced as all-day, the timed event covers its whole day
    expect(eventRange.range.start.toISOString()).toBe('2014-12-25T00:00:00.000Z')
    expect(eventRange.range.end.toISOString()).toBe('2014-12-26T00:00:00.000Z')

    // selecting rerenders the content, with the selection
    content.mockClear()
    calendar.select('2014-12-25', '2014-12-26')
    await waitForSettle()
    expect(content).toHaveBeenCalledTimes(1 * strictModeFactor)
    const { dateSelection } = content.mock.calls[0][0]
    expect(dateSelection.allDay).toBe(true)
    expect(dateSelection.range.start.toISOString()).toBe('2014-12-25T00:00:00.000Z')
    expect(dateSelection.range.end.toISOString()).toBe('2014-12-26T00:00:00.000Z')

    content.mockClear()
    calendar.unselect()
    await waitForSettle()
    expect(content).toHaveBeenCalledTimes(1 * strictModeFactor)
    expect(content.mock.calls[0][0].dateSelection).toBe(null)
    expect(didMount).toHaveBeenCalledTimes(1 * strictModeFactor) // still not remounted

    willUnmount.mockClear()
    content.mockClear()
    calendar.destroy()
    expect(willUnmount).toHaveBeenCalledTimes(1)
    expect(content).not.toHaveBeenCalled()
  })

  it('can\'t have a type that references itself', () => {
    expect(() => {
      initCalendar({
        initialView: 'month',
        views: {
          month: { type: 'month' },
        },
      })
    }).toThrow('Can\'t have a custom view type that references itself')
  })
})
