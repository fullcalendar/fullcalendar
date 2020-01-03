import { VNode, h, Ref } from '../vdom'
import { findElements } from '../util/dom-manip'
import { computeInnerRect } from '../util/dom-geom'
import ComponentContext from '../component/ComponentContext'


export type CssDimValue = string | number


export interface ColCss {
  width?: CssDimValue
  minWidth?: CssDimValue
  [otherProp: string]: any
}

export interface SectionConfig {
  outerContent?: VNode
  type?: 'body' | 'head' | 'foot'
  className?: string
  maxHeight?: number
  vGrow?: boolean
  vGrowRows?: boolean // TODO: how to get a bottom rule?
}

export interface ChunkConfig {
  outerContent?: VNode
  content?: (contentProps: ChunkContentCallbackArgs) => VNode
  rowContent?: VNode
  vGrowRows?: boolean
  needsSizing?: boolean
  scrollerClassName?: string // give this to NormalScrollGrid too ... make a classname for the <td> too
  scrollerElRef?: Ref<HTMLDivElement>
  elRef?: Ref<HTMLTableCellElement>
}

export interface ChunkContentCallbackArgs {
  colGroupNode: VNode
  rowsGrow: boolean
  type: string
  isSizingReady: boolean
  minWidth: CssDimValue
}


export function getShrinkWidth(chunkEls: HTMLElement[]) { // all in same COL!
  let shrinkEls = findElements(chunkEls, '.shrink')
  let largestWidth = 0

  for (let shrinkEl of shrinkEls) {
    let cellWidth = shrinkEl.getBoundingClientRect().width + 1 // HACK for simulating a border

    largestWidth = Math.max(largestWidth, cellWidth)
  }

  return largestWidth
}


export function doSizingHacks(rootEl: HTMLElement) { // TODO: needs to run on window resize fetch!!

  // // for Safari
  // // TODO: in Scroller class?
  // let hGrowTables = findElements(rootEl, '.scroller > table.hgrow')
  // for (let tableEl of hGrowTables) {
  //   if (tableEl.style.position == 'relative') {
  //     tableEl.style.position = ''
  //   } else {
  //     tableEl.style.position = 'relative'
  //   }
  // }

  // for Firefox for all cells
  // for Safari(?) for cells with rowspans
  let vGrowEls = findElements(rootEl, 'td > .vgrow')
  for (let vGrowEl of vGrowEls) {
    let cellEl = vGrowEl.parentNode as HTMLElement
    let cellInnerRect = computeInnerRect(cellEl, true) // TODO: cache!
    let cellInnerHeight = cellInnerRect.bottom - cellInnerRect.top
    let vGrowHeight = vGrowEl.getBoundingClientRect().height
    let lacking = cellInnerHeight - vGrowHeight

    if (lacking > 0.5) {
      let cellEl = vGrowEl.parentNode as HTMLElement
      cellEl.style.position = 'relative'
      vGrowEl.classList.add('vgrow--absolute')
    }
  }
}


export interface ScrollerLike { // have scrollers implement?
  needsYScrolling(): boolean
  needsXScrolling(): boolean
}


export function getForceScrollbars(scrollers: ScrollerLike[], axis: 'X' | 'Y') {
  let methodName = 'needs' + axis + 'Scrolling'
  let needsScrollbars = false

  for (let scroller of scrollers) {
    if (scroller[methodName]()) {
      needsScrollbars = true
      break
    }
  }

  return needsScrollbars
}


export function getChunkVGrow(props: { vGrow?: boolean }, sectionConfig: SectionConfig, chunkConfig: ChunkConfig) {
  return (props.vGrow && sectionConfig.vGrow) || chunkConfig.vGrowRows
}


export function getNeedsYScrolling(props: { vGrow?: boolean }, sectionConfig: SectionConfig, chunkConfig: ChunkConfig) {
  return (sectionConfig.maxHeight != null || (props.vGrow && sectionConfig.vGrow)) && !chunkConfig.vGrowRows
}


export function renderChunkContent(sectionConfig: SectionConfig, chunkConfig: ChunkConfig, microColGroupNode: VNode, chunkTableMinWidth: CssDimValue) {
  let vGrowRows = sectionConfig.vGrowRows || chunkConfig.vGrowRows

  let content: VNode = typeof chunkConfig.content === 'function' ?
    chunkConfig.content({
      colGroupNode: microColGroupNode,
      rowsGrow: vGrowRows,
      type: sectionConfig.type,
      isSizingReady: true, // TODO!!!!!!
      minWidth: chunkTableMinWidth
    }) :
    h('table', {
      class: [ 'hgrow', (vGrowRows ? 'vgrow' : '') ].join(' '),
      style: {
        minWidth: chunkTableMinWidth // because colMinWidths arent enough
      }
    }, [
      microColGroupNode,
      h('tbody', {}, chunkConfig.rowContent)
    ])

  return content
}


export function renderMicroColGroup(cols: ColCss[], shrinkWidth?: number) { // TODO: make this SuperColumn-only!???
  return (
    <colgroup>
      {cols.map((colCss, i) => {
        let className = '' // HACK

        if (colCss.width === 'shrink') {
          colCss = { ...colCss, width: shrinkWidth || 0 }
        }

        if (colCss.className !== undefined) { // gahhhhh
          className = colCss.className
          colCss = { ...colCss }
          delete colCss.className
        }

        return (<col className={className} style={colCss}></col>)
      })}
    </colgroup>
  )
}


export function hasShrinkWidth(cols: ColCss[]) {
  for (let col of cols) {
    if (col.width === 'shrink') {
      return true
    }
  }

  return false
}


export function getScrollGridClassNames(vGrow: boolean, context: ComponentContext) {
  let classNames = [
    'scrollgrid',
    (context.isRtl ? 'scrollgrid--rtl' : 'scrollgrid--ltr'), // TODO: kill this
    context.theme.getClass('tableGrid')
  ]

  if (vGrow) {
    classNames.push('scrollgrid--vgrow')
  }

  return classNames
}


export function getSectionClassNames(sectionConfig: SectionConfig, wholeTableVGrow: boolean) {
  let classNames = [ 'scrollgrid__section', 'scrollgrid__' + sectionConfig.type, sectionConfig.className ]

  if (wholeTableVGrow && sectionConfig.vGrow && sectionConfig.maxHeight == null) {
    classNames.push('scrollgrid__section--vgrow')
  }

  return classNames
}


export function getChunkClassNames(sectionConfig: SectionConfig, context: ComponentContext) {
  return context.theme.getClass(
    sectionConfig.type === 'body' ? 'widgetContent' : 'widgetHeader'
  )
}
