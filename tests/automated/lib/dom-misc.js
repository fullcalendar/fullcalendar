
export const RED_REGEX = /red|rgb\(255,\s*0,\s*0\)/
export const GREEN_REGEX = /green|rgb\(0,\s*255,\s*0\)/
export const BLUE_REGEX = /blue|rgb\(0,\s*0,\s*255\)/


export function getStockScrollbarWidths(dir) {
  var el = $('<div><div style="position:relative"/></div>')
    .css({
      position: 'absolute',
      top: -1000,
      left: 0,
      border: 0,
      padding: 0,
      overflow: 'scroll',
      direction: dir || 'ltr'
    })
    .appendTo('body')

  var elRect = el[0].getBoundingClientRect()
  var innerEl = el.children()
  var innerElRect = innerEl[0].getBoundingClientRect()

  var girths = {
    left: innerElRect.left - elRect.left,
    right: elRect.left + elRect.width - innerElRect.left,
    top: innerElRect.top - elRect.top,
    bottom: elRect.top + elRect.height - innerElRect.top
  }

  el.remove()

  return girths
}


export function isElWithinRtl(el) {
  return el.closest('.fc').hasClass('fc-rtl')
}


beforeEach(function() {
  jasmine.addMatchers({

    toHaveScrollbars() {
      return {
        compare: function(actual) {
          var elm = $(actual)
          var result = {
            pass: elm[0].scrollWidth - 1 > elm[0].clientWidth || // -1 !!!
              elm[0].scrollHeight - 1 > elm[0].clientHeight // -1 !!!
          }
          // !!! - IE was reporting a scrollWidth/scrollHeight 1 pixel taller than what it was :(
          return result
        }
      }
    }

  })
})
