import { describe, expect, it } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import frLocale from 'fullcalendar/locales/fr'
import { initCalendar } from '../lib/calendar'
import { getEventEls, queryPart, queryParts } from '../lib/models/events'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'

/*
Changing options after init with setOption.
SEE ALSO: toolbar/rendering.ts (headerToolbar, footerToolbar), visible-range/visible-range.ts (visibleRange),
sizing/height.ts (height, contentHeight)
*/
describe('setOption', () => {
  // what a month view shows
  function describeView(calendar: Calendar) {
    return {
      title: ToolbarModel.header(calendar.el)!.getTitleText(),
      buttons: ToolbarModel.header(calendar.el)!.getButtons().map((el) => el.textContent),
      dir: calendar.el.getAttribute('dir'),
      headers: queryParts(calendar.el, 'dayHeaderInner').map((el) => el.textContent),
      dates: queryParts(calendar.el, 'dayCell').map((el) => el.getAttribute('data-date')),
      events: getEventEls(calendar.el).length,
    }
  }

  const options: CalendarOptions = {
    initialView: 'dayGridMonth',
    initialDate: '2014-07-01',
    events: [{ start: '2014-07-02' }],
  }

  it.each<[string, any]>([
    ['weekends', false],
    ['firstDay', 1],
    ['hiddenDays', [3]],
    ['fixedWeekCount', false],
    ['showNonCurrentDates', false],
    ['locale', frLocale],
    ['direction', 'rtl'],
    ['titleFormat', { year: 'numeric' }],
    ['dayHeaderFormat', { weekday: 'long' }],
    ['todayText', 'Now'],
    ['events', [{ start: '2014-07-02' }, { start: '2014-07-03' }]],
  ])('changing %s renders the same as initializing with it', async (optionName, value) => {
    const initializedCalendar = initCalendar({ ...options, [optionName]: value })
    await waitForSettle()
    const expected = describeView(initializedCalendar)
    initializedCalendar.destroy()

    const calendar = initCalendar(options)
    await waitForSettle()
    expect(describeView(calendar)).not.toEqual(expected) // the option makes a difference

    calendar.setOption(optionName as keyof CalendarOptions, value)
    await waitForSettle()

    expect(describeView(calendar)).toEqual(expected)
    expect(calendar.getOption(optionName as keyof CalendarOptions)).toBe(value)
  })

  describe('in timeGrid', () => {
    const timeGridOptions: CalendarOptions = {
      initialView: 'timeGridWeek',
      initialDate: '2019-04-01',
      scrollTime: '00:00',
      allDaySlot: true,
      events: [
        { id: 'a', start: '2019-04-01T00:00:00' },
        { id: 'b', start: '2019-04-01T02:00:00' },
      ],
    }

    function getScrollerEl(calendar: Calendar): HTMLElement {
      for (let el = queryPart(calendar.el, 'slotLane')!.parentElement; el; el = el.parentElement) {
        const { overflowY } = getComputedStyle(el)
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          return el
        }
      }
      throw new Error('No time-slot scroller')
    }

    it('applies a single option, keeping the scroll position', async () => {
      const calendar = initCalendar(timeGridOptions)
      await waitForSettle()
      expect(queryParts(calendar.el, 'allDayHeader')).toHaveLength(1)

      const scrollerEl = getScrollerEl(calendar)
      scrollerEl.scrollTop = 100
      await waitForSettle()

      calendar.setOption('allDaySlot', false)
      await waitForSettle()

      expect(calendar.getOption('allDaySlot')).toBe(false)
      expect(queryParts(calendar.el, 'allDayHeader')).toHaveLength(0)
      expect(getScrollerEl(calendar).scrollTop).toBe(100)
    })

    it('rerenders events without rerendering the view', async () => {
      const calendar = initCalendar(timeGridOptions)
      await waitForSettle()
      const laneEl = queryPart(calendar.el, 'dayLane')!
      expect(getEventEls(calendar.el)).toHaveLength(2)

      calendar.setOption('events', [{ id: 'a', start: '2019-04-01T00:00:00' }])
      await waitForSettle()

      expect(getEventEls(calendar.el, 'a')).toHaveLength(1)
      expect(getEventEls(calendar.el, 'b')).toHaveLength(0)
      expect(queryPart(calendar.el, 'dayLane')).toBe(laneEl)
    })

    it('ignores initialView', async () => {
      const calendar = initCalendar(timeGridOptions)
      await waitForSettle()
      const laneEl = queryPart(calendar.el, 'dayLane')!

      calendar.setOption('initialView', 'timeGridDay')
      await waitForSettle()

      expect(calendar.view.type).toBe('timeGridWeek')
      expect(queryPart(calendar.el, 'dayLane')).toBe(laneEl)
    })
  })
})
