
export interface CoordCacheOptions { // TODO: set these props directly
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
export default class CoordCache { // TODO: rename to PositionCoordCache

  els: HTMLElement[] // assumed to be siblings
  originEl: HTMLElement // options can override the natural originEl
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

    if (this.isHorizontal) {
      this.buildElHorizontals(originClientRect.left)
    }

    if (this.isVertical) {
      this.buildElVerticals(originClientRect.top)
    }
  }


  // Populates the left/right internal coordinate arrays
  buildElHorizontals(originClientLeft: number) {
    let lefts = []
    let rights = []

    for (let el of this.els) {
      let rect = el.getBoundingClientRect()
      lefts.push(rect.left - originClientLeft)
      rights.push(rect.right - originClientLeft)
    }

    this.lefts = lefts
    this.rights = rights
  }


  // Populates the top/bottom internal coordinate arrays
  buildElVerticals(originClientTop: number) {
    let tops = []
    let bottoms = []

    for (let el of this.els) {
      let rect = el.getBoundingClientRect()
      tops.push(rect.top - originClientTop)
      bottoms.push(rect.bottom - originClientTop)
    }

    this.tops = tops
    this.bottoms = bottoms
  }


  // Given a left offset (from document left), returns the index of the el that it horizontally intersects.
  // If no intersection is made, returns undefined.
  leftPositionToIndex(leftPosition) {
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
  topPositionToIndex(topPosition) {
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


  // Gets the left position (from originEl left) of the element at the given index
  indexToLeftPosition(leftIndex) {
    return this.lefts[leftIndex]
  }


  // Gets the right position (from originEl left) of the element at the given index.
  // This value is NOT relative to the originEl's right edge, like the CSS concept of "right" would be.
  indexToRightPosition(leftIndex) {
    return this.rights[leftIndex]
  }


  // Gets the top position (from originEl top) of the element at the given position
  indexToTopPosition(topIndex) {
    return this.tops[topIndex]
  }


  // Gets the bottom position (from the originEl top) of the element at the given index.
  // This value is NOT relative to the originEl's bottom edge, like the CSS concept of "bottom" would be.
  indexToBottomPosition(topIndex) {
    return this.bottoms[topIndex]
  }


  // Gets the width of the element at the given index
  getWidth(leftIndex) {
    return this.rights[leftIndex] - this.lefts[leftIndex]
  }


  // Gets the height of the element at the given index
  getHeight(topIndex) {
    return this.bottoms[topIndex] - this.tops[topIndex]
  }

}
