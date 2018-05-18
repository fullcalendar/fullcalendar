export function getVisibleEventEls(){
  return $('.fc-event:visible')
}

export function getScrollerEl(){
  return $(currentCalendar.el).find('.fc-scroller');
}

export function getEventEls(){
  return $('.fc-event')
}

