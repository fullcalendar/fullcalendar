/*
Records offset information for a set of elements, relative to an origin element.
Can record the left/right OR the top/bottom OR both.
Provides methods for querying the cache by position.
*/
export class PositionCache {
  els: HTMLElement[] // assumed to be siblings
  originClientRect: ClientRect

  // arrays of coordinates (from topleft of originEl)
  // caller can access these directly
  lefts: any
  rights: any
  tops: any
  bottoms: any

  constructor(originEl: HTMLElement, els: HTMLElement[], isHorizontal: boolean, isVertical: boolean) {
    this.els = els

    let originClientRect = this.originClientRect = originEl.getBoundingClientRect() // relative to viewport top-left

    if (isHorizontal) {
      this.buildElHorizontals(originClientRect.left)
    }

    if (isVertical) {
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
    let { lefts, rights } = this
    let len = lefts.length
    let i

    for (i = 0; i < len; i += 1) {
      if (leftPosition >= lefts[i] && leftPosition < rights[i]) {
        return i
      }
    }

    return undefined // TODO: better
  }

  // Given a top offset (from document top), returns the index of the el that it vertically intersects.
  // If no intersection is made, returns undefined.
  topToIndex(topPosition: number) {
    let { tops, bottoms } = this
    let len = tops.length
    let i

    for (i = 0; i < len; i += 1) {
      if (topPosition >= tops[i] && topPosition < bottoms[i]) {
        return i
      }
    }

    return undefined // TODO: better
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
