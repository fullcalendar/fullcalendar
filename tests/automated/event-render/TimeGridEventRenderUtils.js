import { getEventEls, getEventElTimeText } from './EventRenderUtils'
import { computeSpanRects } from '../view-render/TimeGridRenderUtils'

export function getTimeTexts() {
  return getEventEls().map(function(i, eventEl) {
    return getEventElTimeText(eventEl)
  }).get()
}


/*
Returns a boolean.
TODO: check isStart/isEnd.
*/
export function checkEventRendering(start, end) {

  if (typeof start === 'string') {
    start = new Date(start)
  }
  if (typeof end === 'string') {
    end = new Date(end)
  }

  var expectedRects = computeSpanRects(start, end)
  var eventEls = getEventEls() // sorted by DOM order. not good for RTL
  var isMatch = checkEventRenderingMatch(expectedRects, eventEls)

  return {
    rects: expectedRects,
    els: eventEls,
    length: eventEls.length,
    isMatch: isMatch
  }
}


function checkEventRenderingMatch(expectedRects, eventEls) {
  var expectedLength = expectedRects.length
  var i, expectedRect
  var elRect

  if (eventEls.length !== expectedLength) {
    console.log('does not match element count')
    return false
  }

  for (i = 0; i < expectedLength; i++) {
    expectedRect = expectedRects[i]
    elRect = eventEls[i].getBoundingClientRect()

    // horizontally contained AND vertically really similar?
    if (!(
      elRect.left >= expectedRect.left &&
      elRect.right <= expectedRect.right &&
      Math.abs(elRect.top - expectedRect.top) < 1 &&
      Math.abs(elRect.bottom + 1 - expectedRect.bottom) < 1 // add 1 because of bottom margin!
    )) {
      console.log('rects do not match')
      return false
    }
  }

  return true
}
