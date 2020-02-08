const SCROLLER_CLASS = 'fc-scroller'

export function getScrollerEl() {
  return $(currentCalendar.el).find(`.fc-body .${SCROLLER_CLASS}`)
}

