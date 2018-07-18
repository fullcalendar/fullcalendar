import { computeInnerRect, getScrollParent } from '../util/dom-geom'

export interface CoordCacheOptions {
  originEl: HTMLElement
  els: HTMLElement[]
  isHorizontal?: boolean
  isVertical?: boolean
}

/*
A cache for the left/right/top/bottom/width/height values for one or more elements.
Works with both offset (from topleft document) and position (from originEl).

options:
- els
- isHorizontal
- isVertical
*/
export default class CoordCache {

  els: HTMLElement[] // assumed to be siblings
  originEl: HTMLElement // options can override the natural originEl
  origin: any // {left,top} position of originEl of els
  boundingRect: any // constrain cordinates to this rectangle. {left,right,top,bottom} or null
  isHorizontal: boolean = false // whether to query for left/right/width
  isVertical: boolean = false // whether to query for top/bottom/height

  // arrays of coordinates (offsets from topleft of originEl)
  lefts: any
  rights: any
  tops: any
  bottoms: any


  constructor(options: CoordCacheOptions) {
    this.originEl = options.originEl
    this.els = options.els
    this.isHorizontal = options.isHorizontal
    this.isVertical = options.isVertical
  }


  // Queries the els for coordinates and stores them.
  // Call this method before using and of the get* methods below.
  build() {
    let originEl = this.originEl
    let originClientRect = originEl.getBoundingClientRect() // relative to viewport top-left

    this.origin = {
      top: originClientRect.top + window.scrollY,
      left: originClientRect.left + window.scrollX
    }

    if (this.isHorizontal) {
      this.buildElHorizontals(originClientRect.left)
    }

    if (this.isVertical) {
      this.buildElVerticals(originClientRect.top)
    }

    this.boundingRect = this.queryBoundingRect()
  }


  // Populates the left/right internal coordinate arrays
  buildElHorizontals(originClientLeft: number) {
    let lefts = []
    let rights = []

    this.els.forEach(function(node) {
      let rect = node.getBoundingClientRect()
      lefts.push(rect.left - originClientLeft)
      rights.push(rect.right - originClientLeft)
    })

    this.lefts = lefts
    this.rights = rights
  }


  // Populates the top/bottom internal coordinate arrays
  buildElVerticals(originClientTop: number) {
    let tops = []
    let bottoms = []

    this.els.forEach(function(node) {
      let rect = node.getBoundingClientRect()
      tops.push(rect.top - originClientTop)
      bottoms.push(rect.bottom - originClientTop)
    })

    this.tops = tops
    this.bottoms = bottoms
  }


  // Given a left offset (from document left), returns the index of the el that it horizontally intersects.
  // If no intersection is made, returns undefined.
  getHorizontalIndex(leftOffset) {
    let leftPosition = leftOffset - this.origin.left
    let lefts = this.lefts
    let rights = this.rights
    let len = lefts.length
    let i

    for (i = 0; i < len; i++) {
      if (leftPosition >= lefts[i] && leftPosition < rights[i]) {
        return i
      }
    }
  }


  // Given a top offset (from document top), returns the index of the el that it vertically intersects.
  // If no intersection is made, returns undefined.
  getVerticalIndex(topOffset) {
    let topPosition = topOffset - this.origin.top
    let tops = this.tops
    let bottoms = this.bottoms
    let len = tops.length
    let i

    for (i = 0; i < len; i++) {
      if (topPosition >= tops[i] && topPosition < bottoms[i]) {
        return i
      }
    }
  }


  // Gets the left offset (from document left) of the element at the given index
  getLeftOffset(leftIndex) {
    return this.lefts[leftIndex] + this.origin.left
  }


  // Gets the left position (from originEl left) of the element at the given index
  getLeftPosition(leftIndex) {
    return this.lefts[leftIndex]
  }


  // Gets the right offset (from document left) of the element at the given index.
  // This value is NOT relative to the document's right edge, like the CSS concept of "right" would be.
  getRightOffset(leftIndex) {
    return this.rights[leftIndex] + this.origin.left
  }


  // Gets the right position (from originEl left) of the element at the given index.
  // This value is NOT relative to the originEl's right edge, like the CSS concept of "right" would be.
  getRightPosition(leftIndex) {
    return this.rights[leftIndex]
  }


  // Gets the width of the element at the given index
  getWidth(leftIndex) {
    return this.rights[leftIndex] - this.lefts[leftIndex]
  }


  // Gets the top offset (from document top) of the element at the given index
  getTopOffset(topIndex) {
    return this.tops[topIndex] + this.origin.top
  }


  // Gets the top position (from originEl top) of the element at the given position
  getTopPosition(topIndex) {
    return this.tops[topIndex]
  }

  // Gets the bottom offset (from the document top) of the element at the given index.
  // This value is NOT relative to the originEl's bottom edge, like the CSS concept of "bottom" would be.
  getBottomOffset(topIndex) {
    return this.bottoms[topIndex] + this.origin.top
  }


  // Gets the bottom position (from the originEl top) of the element at the given index.
  // This value is NOT relative to the originEl's bottom edge, like the CSS concept of "bottom" would be.
  getBottomPosition(topIndex) {
    return this.bottoms[topIndex]
  }


  // Gets the height of the element at the given index
  getHeight(topIndex) {
    return this.bottoms[topIndex] - this.tops[topIndex]
  }


  // Bounding Rect
  // TODO: decouple this from CoordCache

  // Compute and return what the elements' bounding rectangle is, from the user's perspective.
  // Right now, only returns a rectangle if constrained by an overflow:scroll element.
  // Returns null if there are no elements
  queryBoundingRect() {
    let scrollParentEl: HTMLElement = getScrollParent(this.els[0] || this.originEl)

    if (scrollParentEl) {
      return computeInnerRect(scrollParentEl)
    }
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
