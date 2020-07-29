
let canVGrowWithinCell: boolean


export function getCanVGrowWithinCell() {
  if (canVGrowWithinCell == null) {
    canVGrowWithinCell = computeCanVGrowWithinCell()
  }
  return canVGrowWithinCell
}


function computeCanVGrowWithinCell() {
  let el = document.createElement('div')
  el.style.position = 'absolute'
  el.style.top = '0px'
  el.style.left = '0px'
  el.innerHTML = '<div><table><tr><td><div></div></td></tr></table></div>'
  el.querySelector('table').style.height = '100px'
  el.querySelector('div').style.height = '100%'

  document.body.appendChild(el)

  let div = el.querySelector('div')
  let possible = div.offsetHeight > 0
  document.body.removeChild(el)
  return possible
}
