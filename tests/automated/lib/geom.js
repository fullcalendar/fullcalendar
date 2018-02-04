
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

export function joinRects(rect1, rect2) {
  return {
    left: Math.min(rect1.left, rect2.left),
    right: Math.max(rect1.right, rect2.right),
    top: Math.min(rect1.top, rect2.top),
    bottom: Math.max(rect1.bottom, rect2.bottom)
  }
}

function buildRectViaEdges(left, top, right, bottom) {
  return {
    left: left,
    top: top,
    width: right - left,
    height: bottom - top,
    right: right,
    bottom: bottom
  }
}

function buildPoint(left, top) {
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

export function isRect(input) {
  return typeof input === 'object' && 'left' in input && 'right' in input && 'top' in input && 'bottom' in input
}

export function isRectMostlyAbove(subjectRect, otherRect) {
  return (subjectRect.bottom - otherRect.top) < // overlap is less than
    ((subjectRect.bottom - subjectRect.top) / 2) // half the height
}

export function isRectMostlyLeft(subjectRect, otherRect) {
  return (subjectRect.right - otherRect.left) < // overlap is less then
    ((subjectRect.right - subjectRect.left) / 2) // half the width
}

export function isRectMostlyBounded(subjectRect, boundRect) {
  return isRectMostlyHBounded(subjectRect, boundRect) &&
    isRectMostlyVBounded(subjectRect, boundRect)
}

export function isRectMostlyHBounded(subjectRect, boundRect) {
  return (Math.min(subjectRect.right, boundRect.right) -
    Math.max(subjectRect.left, boundRect.left)) > // overlap area is greater than
      ((subjectRect.right - subjectRect.left) / 2) // half the width
}

export function isRectMostlyVBounded(subjectRect, boundRect) {
  return (Math.min(subjectRect.bottom, boundRect.bottom) -
    Math.max(subjectRect.top, boundRect.top)) > // overlap area is greater than
      ((subjectRect.bottom - subjectRect.top) / 2) // half the height
}

export function isRectsSimilar(rect1, rect2) {
  return isRectsHSimilar(rect1, rect2) && isRectsVSimilar(rect1, rect2)
}

function isRectsHSimilar(rect1, rect2) {
  // 1, because of possible borders
  return (Math.abs(rect1.left - rect2.left) <= 2) && (Math.abs(rect1.right - rect2.right) <= 2)
}

function isRectsVSimilar(rect1, rect2) {
  // 1, because of possible borders
  return (Math.abs(rect1.top - rect2.top) <= 2) && (Math.abs(rect1.bottom - rect2.bottom) <= 2)
}
