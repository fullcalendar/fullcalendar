export interface ScrollbarWidths {
  x: number
  y: number // TODO: rename to vertical. less confusing when dealing with width/height verbage
}

let _scrollbarWidths: ScrollbarWidths | undefined

export function getScrollbarWidths() { // TODO: way to force recompute?
  if (!_scrollbarWidths) {
    _scrollbarWidths = computeScrollbarWidths()
  }

  return _scrollbarWidths
}

function computeScrollbarWidths(): ScrollbarWidths {
  let el = document.createElement('div')
  el.style.overflow = 'scroll'
  el.style.position = 'absolute'
  el.style.top = '-9999px'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  let res = computeScrollbarWidthsForEl(el)
  document.body.removeChild(el)
  return res
}

// WARNING: will include border
export function computeScrollbarWidthsForEl(el: HTMLElement): ScrollbarWidths {
  return {
    x: el.offsetHeight - el.clientHeight,
    y: el.offsetWidth - el.clientWidth,
  }
}
