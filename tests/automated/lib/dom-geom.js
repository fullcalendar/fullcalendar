import {
  isRect, isRectMostlyAbove, isRectMostlyLeft, isRectMostlyBounded,
  isRectMostlyHBounded, isRectMostlyVBounded
} from './geom'


// fix bug with jQuery 3 returning 0 height for <td> elements in the IE's
[ 'height', 'outerHeight' ].forEach(function(methodName) {
  var orig = $.fn[methodName]

  $.fn[methodName] = function() {
    if (!arguments.length && this.is('td')) {
      return this[0].getBoundingClientRect().height
    } else {
      return orig.apply(this, arguments)
    }
  }
})


export function getBoundingRects(els) {
  return $(els).map(function(i, node) {
    return getBoundingRect(node)
  })
}


export function getBoundingRect(el) {
  el = $(el)
  return $.extend({}, el[0].getBoundingClientRect(), {
    node: el // very useful for debugging
  })
}


export function getLeadingBoundingRect(els, isRTL) {
  els = $(els)
  expect(els.length).toBeGreaterThan(0)
  let best = null
  els.each(function(i, node) {
    const rect = getBoundingRect(node)
    if (!best) {
      best = rect
    } else if (isRTL) {
      if (rect.right > best.right) {
        best = rect
      }
    } else {
      if (rect.left < best.left) {
        best = rect
      }
    }
  })
  return best
}


export function getTrailingBoundingRect(els, isRTL) {
  els = $(els)
  expect(els.length).toBeGreaterThan(0)
  let best = null
  els.each(function(i, node) {
    const rect = getBoundingRect(node)
    if (!best) {
      best = rect
    } else if (isRTL) {
      if (rect.left < best.left) {
        best = rect
      }
    } else {
      if (rect.right > best.right) {
        best = rect
      }
    }
  })
  return best
}


export function sortBoundingRects(els, isRTL) {
  const rects = els.map(function(i, node) {
    return getBoundingRect(node)
  })
  rects.sort(function(a, b) {
    if (isRTL) {
      return b.right - a.right
    } else {
      return a.left - b.left
    }
  })
  return rects
}


// given an element, returns its bounding box. given a rect, returns the rect.
function massageRect(input) {
  if (isRect(input)) {
    return input
  } else {
    return getBoundingRect(input)
  }
}


// Jasmine Adapters
// --------------------------------------------------------------------------------------------------

beforeEach(function() {
  jasmine.addMatchers({

    toBeMostlyAbove() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyAbove(massageRect(subject), massageRect(other)) }
          if (!result.pass) {
            result.message = 'first rect is not mostly above the second'
          }
          return result
        }
      }
    },

    toBeMostlyBelow() {
      return {
        compare(subject, other) {
          const result = { pass: !isRectMostlyAbove(massageRect(subject), massageRect(other)) }
          if (!result.pass) {
            result.message = 'first rect is not mostly below the second'
          }
          return result
        }
      }
    },

    toBeMostlyLeftOf() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyLeft(massageRect(subject), massageRect(other)) }
          if (!result.pass) {
            result.message = 'first rect is not mostly left of the second'
          }
          return result
        }
      }
    },

    toBeMostlyRightOf() {
      return {
        compare(subject, other) {
          const result = { pass: !isRectMostlyLeft(massageRect(subject), massageRect(other)) }
          if (!result.pass) {
            result.message = 'first rect is not mostly right of the second'
          }
          return result
        }
      }
    },

    toBeMostlyBoundedBy() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyBounded(massageRect(subject), massageRect(other)) }
          if (!result.pass) {
            result.message = 'first rect is not mostly bounded by the second'
          }
          return result
        }
      }
    },

    toBeMostlyHBoundedBy() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyHBounded(massageRect(subject), massageRect(other)) }
          if (!result.pass) {
            result.message = 'first rect does not mostly horizontally bound the second'
          }
          return result
        }
      }
    },

    toBeMostlyVBoundedBy() {
      return {
        compare(subject, other) {
          const result = { pass: isRectMostlyVBounded(massageRect(subject), massageRect(other)) }
          if (!result.pass) {
            result.message = 'first rect does not mostly vertically bound the second'
          }
          return result
        }
      }
    },

    toBeBoundedBy() {
      return {
        compare: function(actual, expected) {
          var outer = massageRect(expected)
          var inner = massageRect(actual)
          var result = {
            pass: outer && inner &&
              inner.left >= outer.left &&
              inner.right <= outer.right &&
              inner.top >= outer.top &&
              inner.bottom <= outer.bottom
          }
          if (!result.pass) {
            result.message = 'Element does not bound other element'
          }
          return result
        }
      }
    },

    toBeLeftOf() {
      return {
        compare: function(actual, expected) {
          var subjectBounds = massageRect(actual)
          var otherBounds = massageRect(expected)
          var result = {
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.right) <= Math.round(otherBounds.left) + 2
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not to the left of the other element'
          }
          return result
        }
      }
    },

    toBeRightOf() {
      return {
        compare: function(actual, expected) {
          var subjectBounds = massageRect(actual)
          var otherBounds = massageRect(expected)
          var result = {
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.left) >= Math.round(otherBounds.right) - 2
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not to the right of the other element'
          }
          return result
        }
      }
    },

    toBeAbove() {
      return {
        compare: function(actual, expected) {
          var subjectBounds = massageRect(actual)
          var otherBounds = massageRect(expected)
          var result = {
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.bottom) <= Math.round(otherBounds.top) + 2
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not above the other element'
          }
          return result
        }
      }
    },

    toBeBelow() {
      return {
        compare: function(actual, expected) {
          var subjectBounds = massageRect(actual)
          var otherBounds = massageRect(expected)
          var result = {
            pass: subjectBounds && otherBounds &&
              Math.round(subjectBounds.top) >= Math.round(otherBounds.bottom) - 2
            // need to round because IE was giving weird fractions
          }
          if (!result.pass) {
            result.message = 'Element is not below the other element'
          }
          return result
        }
      }
    },

    toIntersectWith() {
      return {
        compare: function(actual, expected) {
          var subjectBounds = massageRect(actual)
          var otherBounds = massageRect(expected)
          var result = {
            pass: subjectBounds && otherBounds &&
              subjectBounds.right - 1 > otherBounds.left &&
              subjectBounds.left + 1 < otherBounds.right &&
              subjectBounds.bottom - 1 > otherBounds.top &&
              subjectBounds.top + 1 < otherBounds.bottom
            // +/-1 because of zoom
          }
          if (!result.pass) {
            result.message = 'Element does not intersect with other element'
          }
          return result
        }
      }
    }

  })
})
