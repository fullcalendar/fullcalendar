
export function anyElsIntersect(els: HTMLElement[]): [HTMLElement, HTMLElement] | false {
  let rects = els.map((el) => el.getBoundingClientRect())

  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      if (rectsIntersect(rects[i], rects[j])) {
        return [els[i], els[j]]
      }
    }
  }

  return false
}

export interface React {
  left: number
  right: number
  top: number
  bottom: number
}

export function rectsIntersect(rect0: React, rect1: React): boolean {
  return rect0.left < rect1.right && rect0.right > rect1.left && rect0.top < rect1.bottom && rect0.bottom > rect1.top
}
