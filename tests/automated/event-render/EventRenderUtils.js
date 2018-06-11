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

export function getEventEls() {
  return $(`.${EVENT_CLASS}`)
}

export function getFirstEventEl() {
  return getEventEls().first()
}

export function getLastEventEl() {
  return getEventEls().last()
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

export function getEventElTimeEl(el) {
  return el.find('.fc-time')
}
