const SCROLLER_CLASS = 'fc-scroller'
const ROW_CLASS = 'fc-row'
const DAY_GRID_CLASS = 'fc-day-grid'

export function getScrollerEl() {
  return $(currentCalendar.el).find(`.${SCROLLER_CLASS}`)
}

export function getDayGridRowEls() {
  return $(`.${DAY_GRID_CLASS} .${ROW_CLASS}`)
}

export function getDayGridRowElAtIndex(index){
  return getDayGridRowEls().eq(index)
}
