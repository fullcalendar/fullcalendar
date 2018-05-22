const EVENT_CLASS = '.fc-event'

export function getEventElTime(el){
  return $(el).find('.fc-time').text()
}

export function getDayEls(){
  return $('.fc-day-header[data-date]')
}

export function getVisibleEventEls(){
  return $(`${EVENT_CLASS}:visible`)
}

export function getScrollerEl(){
  return $(currentCalendar.el).find('.fc-scroller');
}

export function getEventEls(){
  return $(`${EVENT_CLASS}`)
}

export function getDayTdEls(date){
  return $(`td[data-date="${date}"]`)
}
