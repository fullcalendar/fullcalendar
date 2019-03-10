
export interface Point {
  left: number
  top: number
}

export interface Rect {
  left: number
  right: number
  top: number
  bottom: number
}


export function pointInsideRect(point: Point, rect: Rect): boolean {
  return point.left >= rect.left &&
    point.left < rect.right &&
    point.top >= rect.top &&
    point.top < rect.bottom
}


// Returns a new rectangle that is the intersection of the two rectangles. If they don't intersect, returns false
export function intersectRects(rect1: Rect, rect2: Rect): Rect | false {
  let res = {
    left: Math.max(rect1.left, rect2.left),
    right: Math.min(rect1.right, rect2.right),
    top: Math.max(rect1.top, rect2.top),
    bottom: Math.min(rect1.bottom, rect2.bottom)
  }

  if (res.left < res.right && res.top < res.bottom) {
    return res
  }

  return false
}


export function translateRect(rect: Rect, deltaX: number, deltaY: number): Rect {
  return {
    left: rect.left + deltaX,
    right: rect.right + deltaX,
    top: rect.top + deltaY,
    bottom: rect.bottom + deltaY
  }
}


// Returns a new point that will have been moved to reside within the given rectangle
export function constrainPoint(point: Point, rect: Rect): Point {
  return {
    left: Math.min(Math.max(point.left, rect.left), rect.right),
    top: Math.min(Math.max(point.top, rect.top), rect.bottom)
  }
}


// Returns a point that is the center of the given rectangle
export function getRectCenter(rect: Rect): Point {
  return {
    left: (rect.left + rect.right) / 2,
    top: (rect.top + rect.bottom) / 2
  }
}


// Subtracts point2's coordinates from point1's coordinates, returning a delta
export function diffPoints(point1: Point, point2: Point): Point {
  return {
    left: point1.left - point2.left,
    top: point1.top - point2.top
  }
}
