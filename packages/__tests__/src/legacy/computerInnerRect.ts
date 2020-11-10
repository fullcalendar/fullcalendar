import { computeInnerRect } from '@fullcalendar/core'
import { getStockScrollbarWidths } from '../lib/dom-misc'

describe('computeInnerRect', () => {
  let INNER_WIDTH = 150
  let INNER_HEIGHT = 100
  let BORDER_LEFT = 1
  let BORDER_RIGHT = 2
  let BORDER_TOP = 3
  let BORDER_BOTTOM = 4
  let PADDING_LEFT = 5
  let PADDING_RIGHT = 6
  let PADDING_TOP = 7
  let PADDING_BOTTOM = 8

  describeValues({
    'when LTR': 'ltr',
    'when RTL': 'rtl',
  }, (direction) => {
    let el

    beforeEach(() => {
      el = $('<div/>')
        .css({
          direction,
          position: 'absolute',
          top: 0,
          left: 0,
          borderStyle: 'solid',
          borderColor: 'black',
          borderLeftWidth: BORDER_LEFT,
          borderRightWidth: BORDER_RIGHT,
          borderTopWidth: BORDER_TOP,
          borderBottomWidth: BORDER_BOTTOM,
          paddingLeft: PADDING_LEFT,
          paddingRight: PADDING_RIGHT,
          paddingTop: PADDING_TOP,
          paddingBottom: PADDING_BOTTOM,
        })
        .append(
          $('<div/>').css({
            width: INNER_WIDTH,
            height: INNER_HEIGHT,
          }),
        )
        .appendTo('body')
    })

    afterEach(() => {
      el.remove()
    })

    describe('when no scrolling', () => {
      beforeEach(() => {
        el.css('overflow', 'hidden')
      })

      it('goes within border', () => {
        expect(computeInnerRect(el[0])).toEqual({
          left: BORDER_LEFT,
          right: BORDER_LEFT + PADDING_LEFT + INNER_WIDTH + PADDING_RIGHT,
          top: BORDER_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT + PADDING_BOTTOM,
        })
      })

      it('can go within padding', () => {
        expect(computeInnerRect(el[0], true)).toEqual({
          left: BORDER_LEFT + PADDING_LEFT,
          right: BORDER_LEFT + PADDING_LEFT + INNER_WIDTH,
          top: BORDER_TOP + PADDING_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT,
        })
      })
    })

    describe('when scrolling', () => {
      beforeEach(() => {
        el.css('overflow', 'scroll')
      })

      let stockScrollbars = getStockScrollbarWidths(direction)

      it('goes within border and scrollbars', () => {
        expect(computeInnerRect(el[0])).toEqual({
          left: BORDER_LEFT + stockScrollbars.left,
          right: BORDER_LEFT + stockScrollbars.left + PADDING_LEFT + INNER_WIDTH + PADDING_RIGHT,
          top: BORDER_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT + PADDING_BOTTOM,
        })
      })

      it('can go within padding', () => {
        expect(computeInnerRect(el[0], true)).toEqual({
          left: BORDER_LEFT + stockScrollbars.left + PADDING_LEFT,
          right: BORDER_LEFT + stockScrollbars.left + PADDING_LEFT + INNER_WIDTH,
          top: BORDER_TOP + PADDING_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT,
        })
      })
    })
  })
})
