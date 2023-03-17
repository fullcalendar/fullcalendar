import {
  isRect, isRectMostlyAbove, isRectMostlyLeft, isRectMostlyBounded,
  isRectMostlyHBounded, isRectMostlyVBounded, rectsIntersect, rectContainersOther,
} from './geom.js'

// fix bug with jQuery 3 returning 0 height for <td> elements in the IE's
['height', 'outerHeight'].forEach((methodName) => {
  let orig = $.fn[methodName]

  $.fn[methodName] = function () { // eslint-disable-line func-names
    if (!arguments.length && this.is('td')) { // eslint-disable-line prefer-rest-params
      return this[0].getBoundingClientRect().height
    }
    return orig.apply(this, arguments) // eslint-disable-line prefer-rest-params
  }
})

export function getBoundingRects(els) {
  return $(els).map((i, node) => getBoundingRect(node)).get()
}

export function getBoundingRect(el) {
  el = $(el)
  return $.extend({}, el[0].getBoundingClientRect(), {
    node: el, // very useful for debugging
  })
}

export function anyElsIntersect(els) {
  let rects = els.map((el) => el.getBoundingClientRect())

  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      if (rectsIntersect(rects[i], rects[j])) {
        return [els[i], els[j]]
      }
    }
  }

  return false
}

export function anyElsObscured(els) {
  let rects = els.map((el) => el.getBoundingClientRect())

  for (let i = 0; i < rects.length; i += 1) {
    for (let j = 0; j < rects.length; j += 1) {
      if (i !== j && rectContainersOther(rects[i], rects[j])) {
        return [els[i], els[j]]
      }
    }
  }

  return false
}

export function getLeadingBoundingRect(els, direction = 'ltr') {
  els = $(els)
  expect(els.length).toBeGreaterThan(0)
  let best = null
  els.each((i, node) => {
    const rect = getBoundingRect(node)
    if (!best) {
      best = rect
    } else if (direction === 'rtl') {
      if (rect.right > best.right) {
        best = rect
      }
    } else if (rect.left < best.left) {
      best = rect
    }
  })
  return best
}

export function getTrailingBoundingRect(els, direction = 'ltr') {
  els = $(els)
  expect(els.length).toBeGreaterThan(0)
  let best = null
  els.each((i, node) => {
    const rect = getBoundingRect(node)
    if (!best) {
      best = rect
    } else if (direction === 'rtl') {
      if (rect.left < best.left) {
        best = rect
      }
    } else if (rect.right > best.right) {
      best = rect
    }
  })
  return best
}

export function sortBoundingRects(els, direction = 'ltr') {
  els = $(els) // TODO: un-jquery-ify
  const rects = els.map((i, node) => getBoundingRect(node)).get()
  rects.sort((a, b) => {
    if (direction === 'rtl') {
      return b.right - a.right
    }
    return a.left - b.left
  })
  return rects
}

// given an element, returns its bounding box. given a rect, returns the rect.
function massageRect(input) {
  if (isRect(input)) {
    return input
  }
  return getBoundingRect(input)
}

// Jasmine Adapters
// --------------------------------------------------------------------------------------------------

beforeEach(() => {
  jasmine.addMatchers({

    toBeMostlyAbove() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyAbove(massageRect(subject), massageRect(other)), message: '' }
          if (!result.pass) {
            result.message = 'first rect is not mostly above the second'
          }
          return result
        },
      }
    },

    toBeMostlyBelow() {
      return {
        compare(subject, other) {
          const result = { pass: !isRectMostlyAbove(massageRect(subject), massageRect(other)), message: '' }
          if (!result.pass) {
            result.message = 'first rect is not mostly below the second'
          }
          return result
        },
      }
    },

    toBeMostlyLeftOf() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyLeft(massageRect(subject), massageRect(other)), message: '' }
          if (!result.pass) {
            result.message = 'first rect is not mostly left of the second'
          }
          return result
        },
      }
    },

    toBeMostlyRightOf() {
      return {
        compare(subject, other) {
          const result = { pass: !isRectMostlyLeft(massageRect(subject), massageRect(other)), message: '' }
          if (!result.pass) {
            result.message = 'first rect is not mostly right of the second'
          }
          return result
        },
      }
    },

    toBeMostlyBoundedBy() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyBounded(massageRect(subject), massageRect(other)), message: '' }
          if (!result.pass) {
            result.message = 'first rect is not mostly bounded by the second'
          }
          return result
        },
      }
    },

    toBeMostlyHBoundedBy() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyHBounded(massageRect(subject), massageRect(other)), message: '' }
          if (!result.pass) {
            result.message = 'first rect does not mostly horizontally bound the second'
          }
          return result
        },
      }
    },

    toBeMostlyVBoundedBy() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyVBounded(massageRect(subject), massageRect(other)), message: '' }
          if (!result.pass) {
            result.message = 'first rect does not mostly vertically bound the second'
          }
          return result
        },
      }
    },

    toBeBoundedBy() {
      return {
        compare(actual, expected) {
          let outer = massageRect(expected)
          let inner = massageRect(actual)
          let result = {
            message: '',
            pass: outer && inner &&
              inner.left >= outer.left &&
              inner.right <= outer.right &&
              inner.top >= outer.top &&
              inner.bottom <= outer.bottom,
          }
          if (!result.pass) {
            result.message = 'Element does not bound other element'
          }
          return result
        },
      }
    },

    toBeLeftOf() {
      return {
        compare(actual, expected) {
          let subjectBounds = massageRect(actual)
          let otherBounds = massageRect(expected)
          let result = {
            message: '',
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.right) <= Math.round(otherBounds.left) + 2,
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not to the left of the other element'
          }
          return result
        },
      }
    },

    toBeRightOf() {
      return {
        compare(actual, expected) {
          let subjectBounds = massageRect(actual)
          let otherBounds = massageRect(expected)
          let result = {
            message: '',
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.left) >= Math.round(otherBounds.right) - 2,
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not to the right of the other element'
          }
          return result
        },
      }
    },

    toBeAbove() {
      return {
        compare(actual, expected) {
          let subjectBounds = massageRect(actual)
          let otherBounds = massageRect(expected)
          let result = {
            message: '',
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.bottom) <= Math.round(otherBounds.top) + 2,
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not above the other element'
          }
          return result
        },
      }
    },

    toBeBelow() {
      return {
        compare(actual, expected) {
          let subjectBounds = massageRect(actual)
          let otherBounds = massageRect(expected)
          let result = {
            message: '',
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.top) >= Math.round(otherBounds.bottom) - 2,
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not below the other element'
          }
          return result
        },
      }
    },

    toIntersectWith() {
      return {
        compare(actual, expected) {
          let subjectBounds = massageRect(actual)
          let otherBounds = massageRect(expected)
          let result = {
            message: '',
            pass: subjectBounds && otherBounds &&
              subjectBounds.right - 1 > otherBounds.left &&
              subjectBounds.left + 1 < otherBounds.right &&
              subjectBounds.bottom - 1 > otherBounds.top &&
              subjectBounds.top + 1 < otherBounds.bottom,
            // +/-1 because of zoom
          }
          if (!result.pass) {
            result.message = 'Element does not intersect with other element'
          }
          return result
        },
      }
    },

  })
})
