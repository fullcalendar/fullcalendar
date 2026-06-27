import { isRectsSimilar } from './geom'
import { getBoundingRects } from './dom-geom'

export function doElsMatchSegs(els, segs, segToRectFunc) {
  let elRect
  let found
  let i
  let j
  let k
  let len
  let len1
  let seg
  let segRect
  let unmatchedRects = getBoundingRects(els)

  if (unmatchedRects.length !== segs.length) {
    return false
  }

  for (j = 0, len = segs.length; j < len; j += 1) {
    seg = segs[j]
    segRect = segToRectFunc(seg)
    found = false
    for (i = k = 0, len1 = unmatchedRects.length; k < len1; i = (k += 1)) {
      elRect = unmatchedRects[i]
      if (isRectsSimilar(elRect, segRect)) {
        unmatchedRects.splice(i, 1) // remove
        found = true
        break
      }
    }
    if (!found) {
      return false
    }
  }

  return !unmatchedRects.length
}
