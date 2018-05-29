const EVENT_CLASS = 'fc-event'
const TITLE_CLASS = 'fc-title'
const RESIZER_CLASS = 'fc-resizer'
const TIME_CLASS = 'fc-time'

export function expectIsStart(bool) {
  var el = getSingleEl()

  if (bool) {
    expect(el).toHaveClass('fc-start')
  } else {
    expect(el).not.toHaveClass('fc-start')
  }
}

export function expectIsEnd(bool) {
  var el = getSingleEl()

  if (bool) {
    expect(el).toHaveClass('fc-end')
  } else {
    expect(el).not.toHaveClass('fc-end')
  }
}

export function getEventElTimeText(el) {
  return $(el).find(`.${TIME_CLASS}`).text()
}

export function getVisibleEventEls() {
  return $(`.${EVENT_CLASS}:visible`)
}

export function getEventEls(eventClassName = EVENT_CLASS) {
  return $(`.${eventClassName}`)
}

export function getSingleEventEl(eventEl) {
  expect(eventEl.length).toBe(1)
  return eventEl
}

export function getFirstEventEl(eventClassName) {
  return getSingleEventEl(getEventEls(eventClassName).first())
}

export function getLastEventEl(eventClassName) {
  return getSingleEventEl(getEventEls(eventClassName).last())
}

export function getEventElTitleEl(eventEl) {
  return eventEl.find(`.${TITLE_CLASS}`)
}

export function getEventElResizerEl(eventEl) {
  return eventEl.find(`.${RESIZER_CLASS}`)
}

export function getSingleEl() {
  var els = getEventEls()
  expect(els).toHaveLength(1)
  return els
}
