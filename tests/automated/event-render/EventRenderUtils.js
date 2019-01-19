const TIME_CLASS = 'fc-time'
const EVENT_CLASS = 'fc-event'
const TITLE_CLASS = 'fc-title'
const RESIZER_CLASS = 'fc-resizer'
const START_CLASS = 'fc-start'
const END_CLASS = 'fc-end'
const DAY_CLASS = 'fc-day'
const EVENT_DOT_CLASS = 'fc-event-dot'
const BACKGROUND_EVENT_CLASS = 'fc-bgevent'

export function getEventElDotEl(el) {
  return el.find(`.${EVENT_DOT_CLASS}`)
}

export function replaceEventElDotElWithEl(eventEl, newDotEl) {
  return getEventElDotEl(eventEl).replaceWith(newDotEl)
}

export function expectIsStart(bool) {
  var el = getSingleEl()

  if (bool) {
    expect(el).toHaveClass(START_CLASS)
  } else {
    expect(el).not.toHaveClass(START_CLASS)
  }
}

export function expectIsEnd(bool) {
  var el = getSingleEl()

  if (bool) {
    expect(el).toHaveClass(END_CLASS)
  } else {
    expect(el).not.toHaveClass(END_CLASS)
  }
}

export function getEventElTimeText(el) {
  return $(el).find(`.${TIME_CLASS}`).text()
}

export function getVisibleEventEls() {
  return $(`.${EVENT_CLASS}:visible`)
}

export function getDayEls() {
  return $(`.${DAY_CLASS}`)
}

export function getEventEls() {
  return $(`.${EVENT_CLASS}`)
}

export function getBackgroundEventEls(containerEl) {
  return $(`.${BACKGROUND_EVENT_CLASS}`, containerEl)
}

export function getEventElAtIndex(index) {
  return getEventEls().eq(index)
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

// single EVENT element
export function getSingleEl() {
  var els = getEventEls()
  expect(els).toHaveLength(1)
  return els
}

export function getSingleBackgroundEventEl() {
  var els = getBackgroundEventEls()
  expect(els).toHaveLength(1)
  return els
}

export function getEventElTimeEl(el) {
  return el.find(`.${TIME_CLASS}`)
}

export function getEventElsWithCustomClass(customClass) {
  return $(`.${customClass}`)
}



