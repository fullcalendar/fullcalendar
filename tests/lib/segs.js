import { isRectsSimilar } from './geom'
import { getBoundingRects } from './dom-geom'

export function doElsMatchSegs(els, segs, segToRectFunc) {
  var elRect, found, i, j, k, len, len1, seg, segRect, unmatchedRects
  unmatchedRects = getBoundingRects(els)
  if (unmatchedRects.length !== segs.length) {
    return false
  }
  for (j = 0, len = segs.length; j < len; j++) {
    seg = segs[j]
    segRect = segToRectFunc(seg)
    found = false
    for (i = k = 0, len1 = unmatchedRects.length; k < len1; i = ++k) {
      elRect = unmatchedRects[i]
      if (isRectsSimilar(elRect, segRect)) {
        unmatchedRects.splice(i, 1)
        found = true
        break
      }
    }
    if (!found) {
      return false
    }
  }
  return true
}
