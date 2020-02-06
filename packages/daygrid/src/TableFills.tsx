import {
  VNode,
  appendToElement,
  prependToElement,
  FillRenderer,
  Seg,
  ComponentContext,
  removeElement,
  BaseFillRendererProps,
  subrenderer,
  renderVNodes,
  h,
  isArraysEqual
} from '@fullcalendar/core'


const EMPTY_CELL_HTML = '<td style="pointer-events:none"></td>'


export interface TableFillsProps extends BaseFillRendererProps {
  type: string
  rowEls: HTMLElement[]
  colCnt: number
  renderIntro: () => VNode[]
  colGroupNode: VNode
}

export default class TableFills extends FillRenderer<TableFillsProps> {

  fillSegTag: string = 'td' // override the default tag name

  private attachSegs = subrenderer(attachSegs, detachSegs)


  render(props: TableFillsProps) {
    let segs = props.segs

    // don't render timed background events
    if (props.type === 'bgEvent') {
      segs = segs.filter(function(seg) {
        return seg.eventRange.def.allDay
      })
    }

    segs = this.renderSegs({
      type: props.type,
      segs
    })

    this.attachSegs({
      type: props.type,
      segs,
      rowEls: props.rowEls,
      colCnt: props.colCnt,
      renderIntro: props.renderIntro,
      colGroupNode: props.colGroupNode
    })
  }

}

TableFills.addPropsEquality({
  rowEls: isArraysEqual
})


function attachSegs(props: TableFillsProps, context: ComponentContext) {
  let { segs, rowEls } = props
  let els = []
  let i
  let seg
  let skeletonEl: HTMLElement

  for (i = 0; i < segs.length; i++) {
    seg = segs[i]
    skeletonEl = renderFillRow(seg, props, context)
    rowEls[seg.row].appendChild(skeletonEl)
    els.push(skeletonEl)
  }

  return els
}


function detachSegs(els: HTMLElement[]) {
  els.forEach(removeElement)
}


// Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
function renderFillRow(seg: Seg, { colCnt, type, renderIntro, colGroupNode }: TableFillsProps, context: ComponentContext): HTMLElement {
  let startCol = seg.firstCol
  let endCol = seg.lastCol + 1
  let className
  let skeletonEl: HTMLElement
  let trEl: HTMLTableRowElement

  if (type === 'businessHours') {
    className = 'bgevent'
  } else {
    className = type.toLowerCase()
  }

  skeletonEl = renderVNodes(
    <div class={'fc-' + className + '-skeleton'}>
      <table>
        {colGroupNode}
        <tr />
      </table>
    </div>,
    context
  )[0] as HTMLElement
  trEl = skeletonEl.getElementsByTagName('tr')[0]

  if (startCol > 0) {
    let emptyCellHtml = new Array(startCol + 1).join(EMPTY_CELL_HTML) // will create (startCol + 1) td's
    appendToElement(trEl, emptyCellHtml)
  }

  ;(seg.el as HTMLTableCellElement).colSpan = endCol - startCol
  trEl.appendChild(seg.el)

  if (endCol < colCnt) {
    let emptyCellHtml = new Array(colCnt - endCol + 1).join(EMPTY_CELL_HTML)
    appendToElement(trEl, emptyCellHtml)
  }

  let introEls = renderVNodes(renderIntro(), context)
  prependToElement(trEl, introEls)

  return skeletonEl
}
