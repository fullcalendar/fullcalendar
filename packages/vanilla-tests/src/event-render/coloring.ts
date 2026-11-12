import { describe, expect, it } from 'vitest'
import { CalendarOptions, EventInput } from 'fullcalendar'
import { appendTestElement, initCalendar } from '../lib/calendar'
import { getEventIdOfEl, queryPart } from '../lib/models/events'
import { getBgEventEls, getVisibleEventEls } from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

const RED = 'rgb(255, 0, 0)'

/*
Each case renders the tested event (id 'test') plus a reference event on another day whose own color is
red. A color option reaching the tested event makes it render exactly like the reference.
*/
function buildCases(event: EventInput, globalOption: 'eventColor' | 'backgroundEventColor') {
  const testEvent = { ...event, id: 'test' }
  const refEvent = { ...event, id: 'ref', start: event.start!.toString().replace('11-04', '11-05'), color: 'red' }

  return [
    {
      desc: `the global ${globalOption}`,
      options: { [globalOption]: 'red', events: [testEvent, refEvent] },
      isRed: true,
    },
    {
      desc: `a source's color, over ${globalOption}`,
      options: { [globalOption]: 'blue', eventSources: [{ color: 'red', events: [testEvent, refEvent] }] },
      isRed: true,
    },
    {
      desc: 'an event\'s color, over its source\'s',
      options: { eventSources: [{ color: 'blue', events: [{ ...testEvent, color: 'red' }, refEvent] }] },
      isRed: true,
    },
    {
      desc: 'no color (the default)',
      options: { events: [testEvent, refEvent] },
      isRed: false,
    },
  ] as { desc: string, options: CalendarOptions, isRed: boolean }[]
}

/*
The color the browser resolves a CSS color value to, rendered outside any calendar.
*/
function resolveColor(cssColor: string): string {
  const el = appendTestElement(document.createElement('div'))
  el.style.backgroundColor = cssColor
  return getComputedStyle(el).backgroundColor
}

/*
The classic theme tints a background event with its color (the theme's default is green) at 15% opacity.
*/
function getBgTint(color: string): string {
  return resolveColor(`color-mix(in oklab, ${color} 15%, transparent)`)
}

function findById(els: HTMLElement[], id: string): HTMLElement {
  return els.find((el) => getEventIdOfEl(el) === id)!
}

describe.each([
  { view: 'dayGridMonth', start: '2014-11-04' },
  { view: 'timeGridWeek', start: '2014-11-04T01:00:00' },
])('event coloring in $view', ({ view, start }) => {
  const options = {
    initialView: view,
    initialDate: '2014-11-04',
    allDaySlot: false,
  }

  it.each(buildCases({ start }, 'eventColor'))('colors a foreground event with $desc', async ({ options: caseOptions, isRed }) => {
    const calendar = initCalendar({ ...options, ...caseOptions })
    await waitForSettle()

    const eventEls = getVisibleEventEls(calendar.el)
    const testColor = getComputedStyle(findById(eventEls, 'test')).backgroundColor
    expect(getComputedStyle(findById(eventEls, 'ref')).backgroundColor).toBe(RED)
    expect(testColor === RED).toBe(isRed)
  })

  it.each([
    ...buildCases({ start, display: 'background' }, 'backgroundEventColor'),
    {
      desc: 'the global eventColor, which is only for foreground events',
      options: {
        eventColor: 'red',
        events: [{ start, display: 'background', id: 'test' }, { start: start.replace('11-04', '11-05'), display: 'background', id: 'ref', color: 'red' }],
      },
      isRed: false,
    },
  ])('colors a background event with $desc', async ({ options: caseOptions, isRed }) => {
    const calendar = initCalendar({ ...options, ...caseOptions })
    await waitForSettle()

    const bgEventEls = getBgEventEls(calendar.el)
    const testColor = getComputedStyle(findById(bgEventEls, 'test')).backgroundColor
    const refColor = getComputedStyle(findById(bgEventEls, 'ref')).backgroundColor
    expect(refColor).toBe(getBgTint('red'))
    expect(testColor).toBe(getBgTint(isRed ? 'red' : '#22c55e'))
    expect(testColor === refColor).toBe(isRed)
  })

  describe('text color', () => {
    function getTitleColor(eventEl: HTMLElement): string {
      return getComputedStyle(queryPart(eventEl, 'eventInner')!.lastElementChild!).color
    }

    it.each([
      {
        desc: 'the global eventContrastColor',
        caseOptions: { eventContrastColor: 'red', events: [{ start }] },
      },
      {
        desc: 'a source\'s contrastColor, over eventContrastColor',
        caseOptions: { eventContrastColor: 'blue', eventSources: [{ contrastColor: 'red', events: [{ start }] }] },
      },
      {
        desc: 'an event\'s contrastColor, over eventContrastColor',
        caseOptions: { eventContrastColor: 'blue', events: [{ start, contrastColor: 'red' }] },
      },
    ])('uses $desc', async ({ caseOptions }) => {
      const calendar = initCalendar({ ...options, ...caseOptions })
      await waitForSettle()

      expect(getTitleColor(getVisibleEventEls(calendar.el)[0])).toBe(RED)
    })

    it('has a default that isn\'t red', async () => {
      const calendar = initCalendar({ ...options, events: [{ start }] })
      await waitForSettle()

      expect(getTitleColor(getVisibleEventEls(calendar.el)[0])).not.toBe(RED)
    })
  })
})
