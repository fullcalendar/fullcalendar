import { formatIsoDay } from '../datelib/utils'
import { 
  DAY_GRID_CLASS, ROW_CLASS, 
  BG_CLASS, HEAD_CLASS, 
  VIEW_CLASS, DAY_HEADER_CLASS, 
  DAY_TOP_CLASS, DAY_DISABLED_CLASS,
  AXIS_CLASS, DAY_CLASS } from '../lib/constants'

export function getDayEl(date) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return $(`.${DAY_GRID_CLASS} .${BG_CLASS} .${DAY_CLASS}[data-date="${formatIsoDay(date)}"]`)
}

export function getDisabledEl(i) {
  var el = $(`.${DAY_GRID_CLASS} .${BG_CLASS} .${DAY_DISABLED_CLASS}:eq(${i})`)
  expect(el).toHaveLength(1)
  return el
}

export function getDayEls() {
  return $(`.${DAY_HEADER_CLASS}`)
}

export function getDayElTopElText(date) {
  return $(`td.${DAY_TOP_CLASS}[data-date="${date}"]`).text()
}

export function getHeaderEl() {
  return $(`.${VIEW_CLASS} > table > .${HEAD_CLASS}`)
}

export function hasHeaderEl() {
  return getHeaderEl().length === 1
}

export function getFirstDayEl() {
  return getDayEls().first()
}

export function getLastDayEl() {
  return getDayEls().last()
}

export function getAllDayAxisEl(){
  return $(`.${DAY_GRID_CLASS} > .${ROW_CLASS} > .${BG_CLASS} .${AXIS_CLASS}`)
}
