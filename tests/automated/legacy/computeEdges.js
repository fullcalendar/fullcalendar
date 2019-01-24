import { getStockScrollbarWidths } from '../lib/dom-misc'
import { computeEdges } from '@fullcalendar/core'

describe('computeEdges', function() {

  defineTests(
    'when margin',
    { margin: '5px 10px' }
  )
  defineTests(
    'when padding',
    { padding: '5px 10px' }
  )

  defineTests(
    'when border',
    { border: '5px solid red' }
  )
  defineTests(
    'when border and padding',
    { border: '5px solid red', padding: '5px 10px' }
  )

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

      var edges = computeEdges(el[0])
      var correctWidths

      if (isScrolling) {
        correctWidths = getStockScrollbarWidths(dir)
      } else {
        correctWidths = { left: 0, right: 0, bottom: 0 }
      }

      expect(edges.scrollbarLeft).toBe(correctWidths.left)
      expect(edges.scrollbarRight).toBe(correctWidths.right)
      expect(edges.scrollbarBottom).toBe(correctWidths.bottom)

      el.remove()
    })
  }
})
