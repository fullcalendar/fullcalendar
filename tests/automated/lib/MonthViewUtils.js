const SCROLLER_CLASS = 'fc-scroller'

export function getScrollerEl() {
  return $(currentCalendar.el).find(`.${SCROLLER_CLASS}`)
}

