
export function getRectCenter(rect) {
  return buildPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  )
}

export function intersectRects(rect0, rect1) {
  return buildRectViaEdges(
    Math.max(rect0.left, rect1.left),
    Math.max(rect0.top, rect1.top),
    Math.min(rect0.right, rect1.right),
    Math.min(rect0.bottom, rect1.bottom)
  )
}

export function buildRectViaDims(left, top, width, height) {
  return {
    left: left,
    top: top,
    width: width,
    height: height,
    right: left + width,
    bottom: top + height
  }
}

export function buildRectViaEdges(left, top, right, bottom) {
  return {
    left: left,
    top: top,
    width: right - left,
    height: bottom - top,
    right: right,
    bottom: bottom
  }
}

export function buildPoint(left, top) {
  return {
    left: left,
    top: top
  }
}

export function subtractPoints(point1, point0) {
  return buildPoint(
    point1.left - point0.left,
    point1.top - point0.top
  )
}

export function addPoints(point0, point1) {
  return buildPoint(
    point0.left + point1.left,
    point0.top + point1.top
  )
}

export function getRectTopLeft(rect) {
  return buildPoint(rect.left, rect.top)
}
