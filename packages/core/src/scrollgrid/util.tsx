import { VNode, h, Ref } from '../vdom'
import { findElements } from '../util/dom-manip'
import ComponentContext from '../component/ComponentContext'
import { computeSmallestCellWidth } from '../util/misc'


export type CssDimValue = string | number


export interface ColProps {
  width?: CssDimValue
  minWidth?: CssDimValue
  span?: number
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
  scrollerElRef?: Ref<HTMLDivElement>
  elRef?: Ref<HTMLTableCellElement>
  className?: string // on the <td>
}

export interface ChunkContentCallbackArgs {
  colGroupNode: VNode
  rowsGrow: boolean
  type: string
  isSizingReady: boolean
  minWidth: CssDimValue
}


export function computeShrinkWidth(chunkEls: HTMLElement[]) { // all in same COL!
  let shrinkCells = findElements(chunkEls, '.shrink')
  let largestWidth = 0

  for (let shrinkCell of shrinkCells) {
    largestWidth = Math.max(
      largestWidth,
      computeSmallestCellWidth(shrinkCell)
    )
  }

  return largestWidth
}


export interface ScrollerLike { // have scrollers implement?
  needsYScrolling(): boolean
  needsXScrolling(): boolean
}


export function computeForceScrollbars(scrollers: ScrollerLike[], axis: 'X' | 'Y') {
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


export function renderChunkContent(
  sectionConfig: SectionConfig,
  chunkConfig: ChunkConfig,
  microColGroupNode: VNode,
  chunkTableMinWidth: CssDimValue,
  isSizingReady: boolean
) {
  let vGrowRows = sectionConfig.vGrowRows || chunkConfig.vGrowRows

  let content: VNode = typeof chunkConfig.content === 'function' ?
    chunkConfig.content({
      colGroupNode: microColGroupNode,
      rowsGrow: vGrowRows,
      type: sectionConfig.type,
      isSizingReady,
      minWidth: chunkTableMinWidth
    }) :
    h('table', {
      class: (vGrowRows ? 'vgrow' : ''),
      style: {
        minWidth: chunkTableMinWidth // because colMinWidths arent enough
      }
    }, [
      microColGroupNode,
      h('tbody', {}, chunkConfig.rowContent)
    ])

  return content
}


export function renderMicroColGroup(cols: ColProps[], shrinkWidth?: number) { // TODO: make this SuperColumn-only!???
  return (
    <colgroup>
      {cols.map((colProps) => (
        <col
          span={colProps.span || 1}
          style={{
            /* why 4? if we do 0, it will kill any border, which are needed for computeSmallestCellWidth
            4 accounts for 2 2-pixel borders. TODO: better solution? */
            width: colProps.width === 'shrink' ? (shrinkWidth || 4) : (colProps.width || ''),
            minWidth: colProps.minWidth || ''
          }}
        />
      ))}
    </colgroup>
  )
}


export function hasShrinkWidth(cols: ColProps[]) {
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
    context.theme.getClass('table')
  ]

  if (vGrow) {
    classNames.push('vgrow')
  }

  return classNames
}


export function getSectionClassNames(sectionConfig: SectionConfig, wholeTableVGrow: boolean) {
  let classNames = [
    'scrollgrid__section',
    'fc-' + sectionConfig.type, // fc-head, fc-body, fc-foot
    sectionConfig.className
  ]

  if (wholeTableVGrow && sectionConfig.vGrow && sectionConfig.maxHeight == null) {
    classNames.push('vgrow')
  }

  return classNames
}


export function getChunkClassNames(sectionConfig: SectionConfig, chunkConfig: ChunkConfig, context: ComponentContext) {
  return [
    chunkConfig.className,
    context.theme.getClass(sectionConfig.type === 'body' ? 'tableCellNormal' : 'tableCellHeader')
  ].join(' ')
}
