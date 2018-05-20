export function getEventElTime(el){
  return $(el).find('.fc-time').text()
}

export function getDayEls(){
  return $('.fc-day-header[data-date]')
}

export function getVisibleEventEls(){
  return $('.fc-event:visible')
}

export function getScrollerEl(){
  return $(currentCalendar.el).find('.fc-scroller');
}

export function getEventEls(){
  return $('.fc-event')
}

