
export interface ScrollbarWidths {
  x: number
  y: number
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
  document.body.appendChild(el)
  let res = computeScrollbarWidthsForEl(el)
  document.body.removeChild(el)
  return res
}


// WARNING: will include border
export function computeScrollbarWidthsForEl(el: HTMLElement): ScrollbarWidths {
  return {
    x: el.offsetHeight - el.clientHeight,
    y: el.offsetWidth - el.clientWidth
  }
}
