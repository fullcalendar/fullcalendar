const EVENT_CLASS = 'fc-event'
const SCROLLER_CLASS = 'fc-scroller'
const TITLE_CLASS = 'fc-title'
const RESIZER_CLASS = 'fc-resizer'
const TIME_CLASS = 'fc-time'

export function getEventElTime(el){
  return $(el).find(`.${TIME_CLASS}`).text()
}

export function getDayEls(){
  return $('.fc-day-header[data-date]')
}

export function getVisibleEventEls(){
  return $(`.${EVENT_CLASS}:visible`)
}

export function getScrollerEl(){
  return $(currentCalendar.el).find(`.${SCROLLER_CLASS}`);
}

export function getEventEls(eventClassName=EVENT_CLASS){
  return $(`.${eventClassName}`)
}

export function getSingleEventEl(eventEl){
  expect(eventEl.length).toBe(1)
  return eventEl
}

export function getFirstEventEl(eventClassName){
  return getSingleEventEl(getEventEls(eventClassName).first())
}

export function getLastEventEl(eventClassName){
  return getSingleEventEl(getEventEls(eventClassName).last())
}

export function getDayTdEls(date){
  return $(`td[data-date="${date}"]`)
}

export function getEventTitleEl(eventEl) {
  return eventEl.find(`.${TITLE_CLASS}`)
}

export function getEventResizerEl(eventEl) {
  return eventEl.find(`.${RESIZER_CLASS}`)
}
