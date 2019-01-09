import * as $ from 'jquery'
import { getClientRect, getScrollParent } from '../util'

/*
A cache for the left/right/top/bottom/width/height values for one or more elements.
Works with both offset (from topleft document) and position (from offsetParent).

options:
- els
- isHorizontal
- isVertical
*/
export default class CoordCache {

  els: any // jQuery set (assumed to be siblings)
  forcedOffsetParentEl: any // options can override the natural offsetParent
  origin: any // {left,top} position of offsetParent of els
  boundingRect: any // constrain cordinates to this rectangle. {left,right,top,bottom} or null
  isHorizontal: boolean = false // whether to query for left/right/width
  isVertical: boolean = false // whether to query for top/bottom/height

  // arrays of coordinates (offsets from topleft of document)
  lefts: any
  rights: any
  tops: any
  bottoms: any


  constructor(options) {
    this.els = $(options.els)
    this.isHorizontal = options.isHorizontal
    this.isVertical = options.isVertical
    this.forcedOffsetParentEl = options.offsetParent ? $(options.offsetParent) : null
  }


  // Queries the els for coordinates and stores them.
  // Call this method before using and of the get* methods below.
  build() {
    let offsetParentEl = this.forcedOffsetParentEl
    if (!offsetParentEl && this.els.length > 0) {
      offsetParentEl = this.els.eq(0).offsetParent()
    }

    this.origin = offsetParentEl ?
      offsetParentEl.offset() :
      null

    this.boundingRect = this.queryBoundingRect()

    if (this.isHorizontal) {
      this.buildElHorizontals()
    }
    if (this.isVertical) {
      this.buildElVerticals()
    }
  }


  // Destroys all internal data about coordinates, freeing memory
  clear() {
    this.origin = null
    this.boundingRect = null
    this.lefts = null
    this.rights = null
    this.tops = null
    this.bottoms = null
  }


  // When called, if coord caches aren't built, builds them
  ensureBuilt() {
    if (!this.origin) {
      this.build()
    }
  }


  // Populates the left/right internal coordinate arrays
  buildElHorizontals() {
    let lefts = []
    let rights = []

    this.els.each(function(i, node) {
      let el = $(node)
      let left = el.offset().left
      let width = el.outerWidth()

      lefts.push(left)
      rights.push(left + width)
    })

    this.lefts = lefts
    this.rights = rights
  }


  // Populates the top/bottom internal coordinate arrays
  buildElVerticals() {
    let tops = []
    let bottoms = []

    this.els.each(function(i, node) {
      let el = $(node)
      let top = el.offset().top
      let height = el.outerHeight()

      tops.push(top)
      bottoms.push(top + height)
    })

    this.tops = tops
    this.bottoms = bottoms
  }


  // Given a left offset (from document left), returns the index of the el that it horizontally intersects.
  // If no intersection is made, returns undefined.
  getHorizontalIndex(leftOffset) {
    this.ensureBuilt()

    let lefts = this.lefts
    let rights = this.rights
    let len = lefts.length
    let i

    for (i = 0; i < len; i++) {
      if (leftOffset >= lefts[i] && leftOffset < rights[i]) {
        return i
      }
    }
  }


  // Given a top offset (from document top), returns the index of the el that it vertically intersects.
  // If no intersection is made, returns undefined.
  getVerticalIndex(topOffset) {
    this.ensureBuilt()

    let tops = this.tops
    let bottoms = this.bottoms
    let len = tops.length
    let i

    for (i = 0; i < len; i++) {
      if (topOffset >= tops[i] && topOffset < bottoms[i]) {
        return i
      }
    }
  }


  // Gets the left offset (from document left) of the element at the given index
  getLeftOffset(leftIndex) {
    this.ensureBuilt()
    return this.lefts[leftIndex]
  }


  // Gets the left position (from offsetParent left) of the element at the given index
  getLeftPosition(leftIndex) {
    this.ensureBuilt()
    return this.lefts[leftIndex] - this.origin.left
  }


  // Gets the right offset (from document left) of the element at the given index.
  // This value is NOT relative to the document's right edge, like the CSS concept of "right" would be.
  getRightOffset(leftIndex) {
    this.ensureBuilt()
    return this.rights[leftIndex]
  }


  // Gets the right position (from offsetParent left) of the element at the given index.
  // This value is NOT relative to the offsetParent's right edge, like the CSS concept of "right" would be.
  getRightPosition(leftIndex) {
    this.ensureBuilt()
    return this.rights[leftIndex] - this.origin.left
  }


  // Gets the width of the element at the given index
  getWidth(leftIndex) {
    this.ensureBuilt()
    return this.rights[leftIndex] - this.lefts[leftIndex]
  }


  // Gets the top offset (from document top) of the element at the given index
  getTopOffset(topIndex) {
    this.ensureBuilt()
    return this.tops[topIndex]
  }


  // Gets the top position (from offsetParent top) of the element at the given position
  getTopPosition(topIndex) {
    this.ensureBuilt()
    return this.tops[topIndex] - this.origin.top
  }

  // Gets the bottom offset (from the document top) of the element at the given index.
  // This value is NOT relative to the offsetParent's bottom edge, like the CSS concept of "bottom" would be.
  getBottomOffset(topIndex) {
    this.ensureBuilt()
    return this.bottoms[topIndex]
  }


  // Gets the bottom position (from the offsetParent top) of the element at the given index.
  // This value is NOT relative to the offsetParent's bottom edge, like the CSS concept of "bottom" would be.
  getBottomPosition(topIndex) {
    this.ensureBuilt()
    return this.bottoms[topIndex] - this.origin.top
  }


  // Gets the height of the element at the given index
  getHeight(topIndex) {
    this.ensureBuilt()
    return this.bottoms[topIndex] - this.tops[topIndex]
  }


  // Bounding Rect
  // TODO: decouple this from CoordCache

  // Compute and return what the elements' bounding rectangle is, from the user's perspective.
  // Right now, only returns a rectangle if constrained by an overflow:scroll element.
  // Returns null if there are no elements
  queryBoundingRect() {
    let scrollParentEl

    if (this.els.length > 0) {
      scrollParentEl = getScrollParent(this.els.eq(0))

      if (
        !scrollParentEl.is(document) &&
        !scrollParentEl.is('html,body') // don't consider these bounding rects. solves issue 3615
      ) {
        return getClientRect(scrollParentEl)
      }
    }

    return null
  }

  isPointInBounds(leftOffset, topOffset) {
    return this.isLeftInBounds(leftOffset) && this.isTopInBounds(topOffset)
  }

  isLeftInBounds(leftOffset) {
    return !this.boundingRect || (leftOffset >= this.boundingRect.left && leftOffset < this.boundingRect.right)
  }

  isTopInBounds(topOffset) {
    return !this.boundingRect || (topOffset >= this.boundingRect.top && topOffset < this.boundingRect.bottom)
  }

}
