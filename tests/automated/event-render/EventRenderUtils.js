
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

export function getSingleEl() {
  var els = $('.fc-event')
  expect(els).toHaveLength(1)
  return els
}
