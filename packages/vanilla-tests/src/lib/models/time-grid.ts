import { pointer, Point } from '../pointer'
import { waitForSettle } from '../settle'
import { DayGridModel } from './day-grid'
import { assertGrabbable, assertNotOnEvent, getEventEls, getMirrorEls, queryParts } from './events'
import { describeSpot, matchesResource, parseSpot, Spot } from './spot'
import { ResizeEdge, resizeSegment, touchResizeSegment } from './resize'
import { scrollIntoViewOnAxis } from './scroll'

/*
A timeGrid view (resource or not). `allDay` models the all-day row.
Date-times are `YYYY-MM-DDTHH:mm(:ss)` strings in the calendar's time zone, matching the columns'
data-date and the slots' data-time attributes. In resource views, a spot can name the resource:
`{ date, resourceId }`.
*/
export class TimeGridModel {
  allDay: DayGridModel

  constructor(public root: HTMLElement) {
    this.allDay = new DayGridModel(root)
  }

  getDayLane(spot: Spot): HTMLElement {
    const { date, resourceId } = parseSpot(spot)
    const lanes = queryParts(this.root, 'dayLane').filter((el) => (
      el.getAttribute('data-date') === date &&
      matchesResource(el, resourceId) &&
      !el.closest('.test-part-tableHeader') // ex: a placeholder's blank header cell, styled like a lane
    ))

    if (lanes.length !== 1) {
      throw new Error(`Expected one day lane for ${describeSpot(spot)}, found ${lanes.length}`)
    }
    return lanes[0]
  }

  getSlotLanes(): HTMLElement[] {
    return queryParts(this.root, 'slotLane')
  }

  getEventEls(eventId?: string): HTMLElement[] {
    return getEventEls(this.root, eventId).filter((el) => this.isInLane(el))
  }

  getMirrorEls(): HTMLElement[] {
    return getMirrorEls(this.root).filter((el) => this.isInLane(el))
  }

  /*
  A point in the date's column, just below where the time starts. Scrolls the time into view.
  */
  pointForDateTime(spot: Spot): Point {
    const { date: dateTime, resourceId } = parseSpot(spot)
    const [date, time] = splitDateTime(dateTime)
    const y = this.yForTime(time)
    const laneEl = this.getDayLane({ date, resourceId })
    scrollIntoViewOnAxis(laneEl, 'x') // lanes are taller than the scroller
    const laneRect = laneEl.getBoundingClientRect()
    return { x: laneRect.left + laneRect.width / 2, y }
  }

  /*
  A point just above where the time is, in the slot that ends there: where an exclusive end (of a
  selection, say) is. Midnight counts as the end of the previous day's column.
  */
  pointForDateTimeEnd(spot: Spot): Point {
    const { date: dateTime, resourceId } = parseSpot(spot)
    let [date, time] = splitDateTime(dateTime)

    if (parseTimeMs(time) === 0) {
      date = addDays(date, -1)
      time = '24:00'
    }

    const y = this.yForTime(time, 'end')
    const laneEl = this.getDayLane({ date, resourceId })
    scrollIntoViewOnAxis(laneEl, 'x') // lanes are taller than the scroller
    const laneRect = laneEl.getBoundingClientRect()
    return { x: laneRect.left + laneRect.width / 2, y }
  }

  async clickDateTime(spot: Spot): Promise<void> {
    await pointer.click(this.pointForDateTime(spot))
    await waitForSettle()
  }

  /*
  Selects from `start` to the exclusive `end` by dragging. Selections can't start on an event, so
  with `fromEnd`, the drag goes backwards from the end (for ranges that start on an event).
  */
  async selectRange(start: Spot, end: Spot, { fromEnd = false } = {}): Promise<void> {
    const pressPoint = fromEnd ? this.pointForDateTimeEnd(end) : this.pointForDateTime(start)
    assertNotOnEvent(pressPoint, `the selection's ${fromEnd ? 'end' : 'start'}`)

    await pointer.press(pressPoint, async () => {
      await pointer.move(fromEnd ? this.pointForDateTime(start) : this.pointForDateTimeEnd(end))
      await waitForSettle()
    })
    await waitForSettle()
  }

  /*
  The point on the event's segment in `dateTime`'s column, at that time.
  The time must be within the event.
  */
  pointForEventAt(eventId: string, spot: Spot): { point: Point, eventEl: HTMLElement } {
    const { date: dateTime, resourceId } = parseSpot(spot)
    const [date, time] = splitDateTime(dateTime)
    const y = this.yForTime(time)
    const laneEl = this.getDayLane({ date, resourceId })
    const eventEl = this.getEventEls(eventId).find((el) => laneEl.contains(el))

    if (!eventEl) {
      throw new Error(`Event ${eventId} has no segment on ${describeSpot(spot)}`)
    }

    const eventRect = eventEl.getBoundingClientRect()
    const point = { x: eventRect.left + eventRect.width / 2, y }
    assertGrabbable(point, eventEl, `event ${eventId} at ${describeSpot(spot)}`)
    return { point, eventEl }
  }

  /*
  Drags the event by its segment at `grab` (a date-time within the event) and releases at `drop`.
  FullCalendar treats the press as if it were at the center of the grabbed slot, so the event moves
  by the pointer's travel rounded to the nearest slot (or snap). With slot-aligned times, that's
  exactly the difference between `grab` and `drop`.
  For cross-section drags, `drop` can compute a point elsewhere (ex: an all-day cell).
  It's computed after the press, because locating it can scroll, which would move the grab point.
  */
  async dragEvent(eventId: string, grab: Spot, drop: Spot | (() => Point)): Promise<void> {
    const { point: grabPoint } = this.pointForEventAt(eventId, grab)
    await pointer.press(grabPoint, async () => {
      const dropPoint = typeof drop === 'function' ? drop() : this.pointForDateTime(drop)
      await pointer.move(dropPoint)
      await waitForSettle()
    })
    await waitForSettle()
  }

  /*
  Resizes the event's edge from one date-time to another (ex: an end from 07:00 to 09:30).
  `from` is where the edge currently is. An end at midnight belongs to the previous day's column.
  `whileResizing` runs before release, for checking the mirror. With `touch`, a long press of
  `touch.holdMs` first selects the event.
  */
  async resizeEvent(
    eventId: string,
    edge: ResizeEdge,
    from: Spot,
    to: Spot,
    whileResizing?: () => Promise<void>,
    touch?: { holdMs: number },
  ): Promise<void> {
    const eventEl = this.getEdgeSegment(eventId, edge, from)
    // end edges are measured just above the time, start edges just below, like the handles
    const anchor = (spot: Spot) => edge === 'end' ? this.pointForDateTimeEnd(spot) : this.pointForDateTime(spot)

    if (touch) {
      await touchResizeSegment(eventEl, edge, () => anchor(from), () => anchor(to), touch.holdMs)
    } else {
      await resizeSegment(eventEl, edge, () => anchor(from), () => anchor(to), whileResizing)
    }
  }

  private getEdgeSegment(eventId: string, edge: ResizeEdge, spot: Spot): HTMLElement {
    const { date: dateTime, resourceId } = parseSpot(spot)
    let [date, time] = splitDateTime(dateTime)

    if (edge === 'end' && parseTimeMs(time) === 0) {
      date = addDays(date, -1)
    }

    const laneEl = this.getDayLane({ date, resourceId })
    const eventEl = this.getEventEls(eventId).find((el) => laneEl.contains(el))

    if (!eventEl) {
      throw new Error(`Event ${eventId} has no segment with its ${edge} at ${describeSpot(spot)}`)
    }
    return eventEl
  }

  /*
  Just below the time's position (or just above, for an 'end' edge), so the point is unambiguously
  within the slot (or snap interval) that starts (or ends) there. Assumes snap intervals are taller
  than 2px.
  */
  private yForTime(time: string, edge: 'start' | 'end' = 'start'): number {
    const slotEls = this.getSlotLanes()
    const slotMs = getSlotStartMs(slotEls)
    const ms = parseTimeMs(time)
    const isEnd = edge === 'end'
    let i = slotMs.length - 1

    while (i > 0 && (isEnd ? slotMs[i] >= ms : slotMs[i] > ms)) {
      i--
    }

    const slotDurationMs = slotMs.length > 1
      ? (i + 1 < slotMs.length ? slotMs[i + 1] : slotMs[i] + (slotMs[i] - slotMs[i - 1])) - slotMs[i]
      : NaN
    const frac = (ms - slotMs[i]) / slotDurationMs

    if (!(isEnd ? frac > 0 && frac <= 1 : frac >= 0 && frac < 1)) { // also rejects NaN
      throw new Error(`Time ${time} is outside the rendered slots`)
    }

    const slotEl = slotEls[i]
    scrollIntoViewOnAxis(slotEl, 'y') // slots can be wider than the scroller
    const rect = slotEl.getBoundingClientRect()
    return rect.top + rect.height * frac + (isEnd ? -2 : 2)
  }

  private isInLane(el: HTMLElement): boolean {
    return Boolean(el.closest('.test-part-dayLane'))
  }
}

function splitDateTime(dateTime: string): [string, string] {
  const [date, time] = dateTime.split('T')

  if (!time) {
    throw new Error(`Expected a date-time, got ${dateTime}`)
  }
  return [date, time]
}

/*
Slot start times, as ms from the day's start. data-time wraps after midnight when slotMaxTime is past
24h, so later slots get a day added to keep the sequence increasing.
*/
function getSlotStartMs(slotEls: HTMLElement[]): number[] {
  const res: number[] = []

  for (const slotEl of slotEls) {
    let ms = parseTimeMs(slotEl.getAttribute('data-time')!)

    while (res.length && ms <= res[res.length - 1]) {
      ms += 24 * 60 * 60 * 1000
    }
    res.push(ms)
  }

  return res
}

function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function parseTimeMs(time: string): number {
  const [h, m = '0', s = '0'] = time.split(':')
  return ((Number(h) * 60 + Number(m)) * 60 + Number(s)) * 1000
}
