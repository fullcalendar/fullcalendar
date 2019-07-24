import { getStockScrollbarWidths } from '../lib/dom-misc'
import { computeInnerRect } from '@fullcalendar/core'

describe('computeInnerRect', function() {
  var INNER_WIDTH = 150
  var INNER_HEIGHT = 100
  var BORDER_LEFT = 1
  var BORDER_RIGHT = 2
  var BORDER_TOP = 3
  var BORDER_BOTTOM = 4
  var PADDING_LEFT = 5
  var PADDING_RIGHT = 6
  var PADDING_TOP = 7
  var PADDING_BOTTOM = 8

  describeValues({
    'when LTR': 'ltr',
    'when RTL': 'rtl'
  }, function(dir) {
    var el

    beforeEach(function() {
      el = $('<div/>')
        .css({
          direction: dir,
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
          paddingBottom: PADDING_BOTTOM
        })
        .append(
          $('<div/>').css({
            width: INNER_WIDTH,
            height: INNER_HEIGHT
          })
        )
        .appendTo('body')
    })

    afterEach(function() {
      el.remove()
    })

    describe('when no scrolling', function() {
      beforeEach(function() {
        el.css('overflow', 'hidden')
      })

      it('goes within border', function() {
        expect(computeInnerRect(el[0])).toEqual({
          left: BORDER_LEFT,
          right: BORDER_LEFT + PADDING_LEFT + INNER_WIDTH + PADDING_RIGHT,
          top: BORDER_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT + PADDING_BOTTOM
        })
      })

      it('can go within padding', function() {
        expect(computeInnerRect(el[0], true)).toEqual({
          left: BORDER_LEFT + PADDING_LEFT,
          right: BORDER_LEFT + PADDING_LEFT + INNER_WIDTH,
          top: BORDER_TOP + PADDING_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT
        })
      })

    })

    describe('when scrolling', function() {
      beforeEach(function() {
        el.css('overflow', 'scroll')
      })

      var stockScrollbars = getStockScrollbarWidths(dir)

      it('goes within border and scrollbars', function() {
        expect(computeInnerRect(el[0])).toEqual({
          left: BORDER_LEFT + stockScrollbars.left,
          right: BORDER_LEFT + stockScrollbars.left + PADDING_LEFT + INNER_WIDTH + PADDING_RIGHT,
          top: BORDER_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT + PADDING_BOTTOM
        })
      })

      it('can go within padding', function() {
        expect(computeInnerRect(el[0], true)).toEqual({
          left: BORDER_LEFT + stockScrollbars.left + PADDING_LEFT,
          right: BORDER_LEFT + stockScrollbars.left + PADDING_LEFT + INNER_WIDTH,
          top: BORDER_TOP + PADDING_TOP,
          bottom: BORDER_TOP + PADDING_TOP + INNER_HEIGHT
        })
      })

    })
  })
})
