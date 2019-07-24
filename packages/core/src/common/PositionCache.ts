
/*
Records offset information for a set of elements, relative to an origin element.
Can record the left/right OR the top/bottom OR both.
Provides methods for querying the cache by position.
*/
export default class PositionCache {

  originClientRect: ClientRect
  els: HTMLElement[] // assumed to be siblings
  originEl: HTMLElement // options can override the natural originEl
  isHorizontal: boolean // whether to query for left/right/width
  isVertical: boolean // whether to query for top/bottom/height

  // arrays of coordinates (from topleft of originEl)
  // caller can access these directly
  lefts: any
  rights: any
  tops: any
  bottoms: any


  constructor(originEl: HTMLElement, els: HTMLElement[], isHorizontal: boolean, isVertical: boolean) {
    this.originEl = originEl
    this.els = els
    this.isHorizontal = isHorizontal
    this.isVertical = isVertical
  }


  // Queries the els for coordinates and stores them.
  // Call this method before using and of the get* methods below.
  build() {
    let originEl = this.originEl
    let originClientRect = this.originClientRect =
      originEl.getBoundingClientRect() // relative to viewport top-left

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
  leftToIndex(leftPosition: number) {
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
  topToIndex(topPosition: number) {
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


  // Gets the width of the element at the given index
  getWidth(leftIndex: number) {
    return this.rights[leftIndex] - this.lefts[leftIndex]
  }


  // Gets the height of the element at the given index
  getHeight(topIndex: number) {
    return this.bottoms[topIndex] - this.tops[topIndex]
  }

}
