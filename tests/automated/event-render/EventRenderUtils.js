import { TIME_CLASS, EVENT_CLASS, TITLE_CLASS, RESIZER_CLASS, START_CLASS, END_CLASS } from "../lib/constants"


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
  return el.find(`.${TIME_CLASS}`)
}
