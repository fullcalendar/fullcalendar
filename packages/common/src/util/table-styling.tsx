import { createElement } from '../vdom'
import { renderVirtual } from './dom-manip'


let canVGrowWithinCell: boolean


export function getCanVGrowWithinCell() {
  if (canVGrowWithinCell == null) {
    canVGrowWithinCell = computeCanVGrowWithinCell()
  }
  return canVGrowWithinCell
}


function computeCanVGrowWithinCell() {
  // TODO: abstraction for creating these temporary detection-based els
  let el = renderVirtual(
    <div style={{ position: 'absolute', top: 0, left: 0 }}>
      <table style={{ height: 100 }}>
        <tr>
          <td>
            <div style={{ height: '100%' }}></div>
          </td>
        </tr>
      </table>
    </div>
  )

  document.body.appendChild(el)

  let div = el.querySelector('div')
  let possible = div.offsetHeight > 0
  document.body.removeChild(el)
  return possible
}
