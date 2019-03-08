
// this file is about DAY grid???

const DAY_GRID_CLASS = 'fc-day-grid'

export function getDayGridSlotEls() {
  return $(`.${DAY_GRID_CLASS}`)
}

export function getDayGridSlotElsCount() {
  return getDayGridSlotEls().length
}
