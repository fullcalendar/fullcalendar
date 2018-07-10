import { formatIsoDay } from '../datelib/utils'
import { getHeaderEl } from './DayGridRenderUtils'

const DAY_GRID_CLASS = 'fc-day-grid'
const ROW_CLASS = 'fc-row'
const BG_CLASS = 'fc-bg'
const HEAD_CLASS = 'fc-head' 
const VIEW_CLASS = 'fc-view'
const DAY_HEADER_CLASS = 'fc-day-header' 
const DAY_TOP_CLASS = 'fc-day-top'
const DAY_DISABLED_CLASS  = 'fc-day-disabled'
const AXIS_CLASS = 'fc-axis'
const DAY_CLASS = 'fc-day'

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

export function getTimeGridHeaderAxisEl(){
  return getHeaderEl().find(`.${AXIS_CLASS}`) 
}

export function getSlatElAxisEl(slatEl){
  return slatEl.find(`.${AXIS_CLASS}`)
}

export function getSlatElGridEls(slatEl){
  return slatEl.find(`td:not(${AXIS_CLASS})`)
}

export function getDayGridAxisEl(){
  return $(`.${DAY_GRID_CLASS} .${AXIS_CLASS}`)
}

export function getDayGridDayEl(){
    return $(`.${DAY_GRID_CLASS} .${DAY_CLASS}`)
}

export function getFirstDayGridDayEl(){
  return getDayGridDayEl().first()
}