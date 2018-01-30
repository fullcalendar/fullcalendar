import { getStockScrollbarWidths } from '../lib/dom-misc'

describe('getScrollbarWidths', function() {

  var getScrollbarWidths = $.fullCalendar.getScrollbarWidths

  defineTests(
    'when margin',
    { margin: '5px 10px' }
  )
  defineTests(
    'when padding',
    { padding: '5px 10px' }
  )

  /// / getScrollbarWidths doesn't work with borders anymore
  // defineTests(
  //  'when border',
  //  { border: '5px solid red' }
  // );
  // defineTests(
  //  'when border and padding',
  //  { border: '5px solid red', padding: '5px 10px' }
  // );

  function defineTests(description, cssProps) {
    describe(description, function() {
      describe('when no scrolling', function() {
        describe('when LTR', function() {
          defineTest(false, 'ltr', cssProps)
        })
        describe('when RTL', function() {
          defineTest(false, 'rtl', cssProps)
        })
      })
      describe('when scrolling', function() {
        describe('when LTR', function() {
          defineTest(true, 'ltr', cssProps)
        })
        describe('when RTL', function() {
          defineTest(true, 'rtl', cssProps)
        })
      })
    })
  }

  function defineTest(isScrolling, dir, cssProps) {
    it('computes correct widths', function() {
      var el = $(
        '<div style="position:absolute" />'
      )
        .css('overflow', isScrolling ? 'scroll' : 'hidden')
        .css('direction', dir)
        .css(cssProps)
        .append('<div style="position:relative;width:100px;height:100px" />')
        .appendTo('body')

      var widths = getScrollbarWidths(el)
      var correctWidths

      if (isScrolling) {
        correctWidths = getStockScrollbarWidths(dir)
      } else {
        correctWidths = { left: 0, right: 0, top: 0, bottom: 0 }
      }

      expect(widths.left).toBe(correctWidths.left)
      expect(widths.right).toBe(correctWidths.right)
      expect(widths.top).toBe(correctWidths.top)
      expect(widths.bottom).toBe(correctWidths.bottom)

      el.remove()
    })
  }
})
