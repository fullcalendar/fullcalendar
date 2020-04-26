
let canVGrowWithinCell: boolean


export function getCanVGrowWithinCell() {
  if (canVGrowWithinCell == null) {
    canVGrowWithinCell = computeCanVGrowWithinCell()
  }
  return canVGrowWithinCell
}


function computeCanVGrowWithinCell() {
  // TODO: abstraction for creating these temporary detection-based els
  var el = document.createElement('div')
  el.style.position = 'absolute' // for not interfering with current layout
  el.style.top = '0'
  el.style.left = '0'
  el.innerHTML = '<table style="height:100px"><tr><td><div style="height:100%"></div></td></tr></table>'
  document.body.appendChild(el)
  let div = el.querySelector('div')
  let possible = div.offsetHeight > 0
  document.body.removeChild(el)
  return possible
}
