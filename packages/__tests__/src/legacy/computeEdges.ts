import { computeEdges } from '@fullcalendar/core'
import { getStockScrollbarWidths } from '../lib/dom-misc'

describe('computeEdges', () => {
  defineTests(
    'when margin',
    { margin: '5px 10px' },
  )
  defineTests(
    'when padding',
    { padding: '5px 10px' },
  )

  defineTests(
    'when border',
    { border: '5px solid red' },
  )
  defineTests(
    'when border and padding',
    { border: '5px solid red', padding: '5px 10px' },
  )

  function defineTests(description, cssProps) {
    describe(description, () => {
      describe('when no scrolling', () => {
        describe('when LTR', () => {
          defineTest(false, 'ltr', cssProps)
        })
        describe('when RTL', () => {
          defineTest(false, 'rtl', cssProps)
        })
      })
      describe('when scrolling', () => {
        describe('when LTR', () => {
          defineTest(true, 'ltr', cssProps)
        })
        describe('when RTL', () => {
          defineTest(true, 'rtl', cssProps)
        })
      })
    })
  }

  function defineTest(isScrolling, direction, cssProps) {
    it('computes correct widths', () => {
      let el = $(
        '<div style="position:absolute" />',
      )
        .css('overflow', isScrolling ? 'scroll' : 'hidden')
        .css('direction', direction)
        .css(cssProps)
        .append('<div style="position:relative;width:100px;height:100px" />')
        .appendTo('body')

      let edges = computeEdges(el[0])
      let correctWidths

      if (isScrolling) {
        correctWidths = getStockScrollbarWidths(direction)
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
