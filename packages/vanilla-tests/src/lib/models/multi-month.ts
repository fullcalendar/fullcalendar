import { pointer } from '../pointer'
import { waitForSettle } from '../settle'
import { DayGridModel } from './day-grid'
import { assertNotOnEvent, queryParts } from './events'
import { ResizeEdge, resizeSegment } from './resize'

/*
A multiMonth view: one dayGrid per month (the `singleMonth` part, with a `YYYY-MM` data-date).
A date's cell is looked up in ITS month's grid, because other months' grids can show the same date as
an other-month cell (dated when showNonCurrentDates is true). Gestures can start in one month's grid
and end in another's.
*/
export class MultiMonthModel {
  constructor(public root: HTMLElement) {
  }

  getMonthEls(): HTMLElement[] {
    return queryParts(this.root, 'singleMonth')
  }

  getMonthEl(month: string): HTMLElement {
    const monthEls = this.getMonthEls().filter((el) => el.getAttribute('data-date') === month)

    if (monthEls.length !== 1) {
      throw new Error(`Expected one month grid for ${month}, found ${monthEls.length}`)
    }
    return monthEls[0]
  }

  /*
  The dayGrid of the date's month (date is `YYYY-MM-DD`).
  */
  gridForDate(date: string): DayGridModel {
    return new DayGridModel(this.getMonthEl(date.slice(0, 7)))
  }

  getDayCell(date: string): HTMLElement {
    return this.gridForDate(date).getDayCell(date)
  }

  async clickDate(date: string): Promise<void> {
    await this.gridForDate(date).clickDate(date)
  }

  /*
  Drags the event by its segment over `grab` (in grab's month) and drops it on the `drop` cell
  (in drop's month).
  */
  async dragEvent(eventId: string, grab: string, drop: string): Promise<void> {
    await this.gridForDate(grab).dragEvent(eventId, grab, () => this.gridForDate(drop).pointForDate(drop))
  }

  /*
  Like DayGridModel's resizeEvent, but `from` and `to` can be in different months.
  */
  async resizeEvent(eventId: string, edge: ResizeEdge, from: string, to: string): Promise<void> {
    const fromGrid = this.gridForDate(from)
    const { eventEl } = fromGrid.pointForEventOnDate(eventId, from)
    await resizeSegment(eventEl, edge, () => fromGrid.pointForDate(from), () => this.gridForDate(to).pointForDate(to))
  }

  /*
  Like DayGridModel's selectDates, but `first` and `last` can be in different months.
  */
  async selectDates(first: string, last: string): Promise<void> {
    const start = this.gridForDate(first).pointForEmptyDate(first)
    assertNotOnEvent(start, `the selection start ${first}`)
    await pointer.press(start, async () => {
      await pointer.move(this.gridForDate(last).pointForDate(last))
      await waitForSettle()
    })
    await waitForSettle()
  }
}
