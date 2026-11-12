import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { getSlotLaneEls, getSlotTop } from '../lib/models/slots'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

/*
The now-indicator renders a line in the day's lane and a marker (the header) on the time axis.
`now` is a fixed date, so no timers are involved.
*/
function getNowIndicatorEls(root: HTMLElement): { lineEl: HTMLElement | null, headerEl: HTMLElement | null } {
  const lineEls = queryParts(root, 'nowIndicatorLine')
  const headerEls = queryParts(root, 'nowIndicatorHeader')
  expect(lineEls.length).toBe(headerEls.length)
  expect(lineEls.length).toBeLessThanOrEqual(1)
  return { lineEl: lineEls[0] || null, headerEl: headerEls[0] || null }
}

function getCenterY(el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  return (rect.top + rect.bottom) / 2
}

function getCenterX(el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  return (rect.left + rect.right) / 2
}

describe('now indicator in timeGrid', () => {
  const options = {
    initialView: 'timeGridWeek',
    now: '2015-12-26T06:00:00',
    scrollTime: '00:00',
  }

  it.each([
    [{}, false], // the default: false
    [{ nowIndicator: true }, true],
  ])('with %j, renders: %s', async (extraOptions, renders) => {
    const calendar = initCalendar({ ...options, ...extraOptions })
    await waitForSettle()

    expect(getNowIndicatorEls(calendar.el).lineEl !== null).toBe(renders)
  })

  it.each([
    ['2015-12-20', true], // the week of now
    ['2015-12-27', false], // the next week
  ])('when showing the week of %s, renders: %s', async (initialDate, renders) => {
    const calendar = initCalendar({ ...options, nowIndicator: true, initialDate })
    await waitForSettle()

    expect(getNowIndicatorEls(calendar.el).lineEl !== null).toBe(renders)
  })

  it.each([
    ['ltr', '2015-12-26T06:00:00', '2015-12-26', '06:00:00'],
    ['rtl', '2015-12-26T06:00:00', '2015-12-26', '06:00:00'],
    ['ltr', '2015-12-20T02:30:00', '2015-12-20', '02:30:00'],
  ] as const)('in %s, renders at %s', async (direction, now, date, time) => {
    const calendar = initCalendar({ ...options, nowIndicator: true, direction, now })
    await waitForSettle()

    const { lineEl, headerEl } = getNowIndicatorEls(calendar.el)
    const laneEl = new TimeGridModel(calendar.el).getDayLane(date)
    const slotTop = getSlotTop(calendar.el, time)
    expect(laneEl.contains(lineEl)).toBe(true)
    expect(Math.abs(getCenterY(lineEl!) - slotTop)).toBeLessThan(3)
    expect(Math.abs(getCenterY(headerEl!) - slotTop)).toBeLessThan(3)

    // the header is on the time axis, at the grid's start side
    const lanesRect = queryPart(calendar.el, 'slotLane')!.getBoundingClientRect()
    if (direction === 'ltr') {
      expect(getCenterX(headerEl!)).toBeLessThan(lanesRect.left)
    } else {
      expect(getCenterX(headerEl!)).toBeGreaterThan(lanesRect.right)
    }
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6394
  describe('when slotMaxTime extends past midnight', () => {
    const pastMidnightOptions = {
      ...options,
      nowIndicator: true,
      initialView: 'timeGridDay',
      initialDate: '2015-12-26',
      slotMaxTime: '30:00',
    }

    // slots past midnight repeat their data-time (26:30 is "02:30:00"), so they're located by index.
    // 30-minute slots from 00:00, so 26:30 is the 53rd slot
    it.each([
      ['2015-12-27T02:30:00', 53], // after midnight, within the previous day
      ['2015-12-27T07:00:00', null], // past the extended end
    ])('when now is %s, renders at slot %s', async (now, slotIndex) => {
      const calendar = initCalendar({ ...pastMidnightOptions, now })
      await waitForSettle()

      const { lineEl, headerEl } = getNowIndicatorEls(calendar.el)

      if (slotIndex === null) {
        expect(lineEl).toBe(null)
      } else {
        const slotTop = getSlotLaneEls(calendar.el)[slotIndex].getBoundingClientRect().top
        expect(Math.abs(getCenterY(lineEl!) - slotTop)).toBeLessThan(3)
        expect(Math.abs(getCenterY(headerEl!) - slotTop)).toBeLessThan(3)
      }
    })
  })
})
