import { VNode, createElement, Ref } from '../vdom'
import { findElements } from '../util/dom-manip'
import { ViewContext } from '../ViewContext'
import { computeSmallestCellWidth } from '../util/misc'
import { isPropsEqual } from '../util/object'
import { isArraysEqual } from '../util/array'
import { BaseOptionsRefined } from '../options'

export type CssDimValue = string | number // TODO: move to more general file

export interface ColProps {
  width?: CssDimValue
  minWidth?: CssDimValue
  span?: number
}

export interface SectionConfig {
  outerContent?: VNode
  type: 'body' | 'header' | 'footer'
  className?: string
  maxHeight?: number
  liquid?: boolean
  expandRows?: boolean // TODO: how to get a bottom rule?
  syncRowHeights?: boolean // yuck
  isSticky?: boolean
}

export type ChunkConfigContent = (contentProps: ChunkContentCallbackArgs) => VNode
export type ChunkConfigRowContent = VNode | ChunkConfigContent

export interface ChunkConfig {
  outerContent?: VNode
  content?: ChunkConfigContent
  rowContent?: ChunkConfigRowContent
  scrollerElRef?: Ref<HTMLDivElement>
  elRef?: Ref<HTMLTableCellElement>
  tableClassName?: string
}

export interface ChunkContentCallbackArgs { // TODO: util for wrapping tables!?
  tableColGroupNode: VNode
  tableMinWidth: CssDimValue
  clientWidth: number | null // important to know whether 0 or not-yet-determined. for headless testing
  clientHeight: number | null //
  expandRows: boolean
  syncRowHeights: boolean
  rowSyncHeights: number[]
  reportRowHeightChange: (rowEl: HTMLElement, isStable: boolean) => void
}

export function computeShrinkWidth(chunkEls: HTMLElement[]) { // all in same COL!
  let shrinkCells = findElements(chunkEls, '.fc-scrollgrid-shrink')
  let largestWidth = 0

  for (let shrinkCell of shrinkCells) {
    largestWidth = Math.max(
      largestWidth,
      computeSmallestCellWidth(shrinkCell),
    )
  }

  return Math.ceil(largestWidth) // <table> elements work best with integers. round up to ensure contents fits
}

export interface ScrollerLike { // have scrollers implement?
  needsYScrolling(): boolean
  needsXScrolling(): boolean
}

export function getSectionHasLiquidHeight(props: { liquid: boolean }, sectionConfig: SectionConfig) {
  return props.liquid && sectionConfig.liquid // does the section do liquid-height? (need to have whole scrollgrid liquid-height as well)
}

export function getAllowYScrolling(props: { liquid: boolean }, sectionConfig: SectionConfig) {
  return sectionConfig.maxHeight != null || // if its possible for the height to max out, we might need scrollbars
    getSectionHasLiquidHeight(props, sectionConfig) // if the section is liquid height, it might condense enough to require scrollbars
}

// TODO: ONLY use `arg`. force out internal function to use same API
export function renderChunkContent(sectionConfig: SectionConfig, chunkConfig: ChunkConfig, arg: ChunkContentCallbackArgs) {
  let { expandRows } = arg

  let content: VNode = typeof chunkConfig.content === 'function' ?
    chunkConfig.content(arg) :
    createElement('table',
      {
        className: [
          chunkConfig.tableClassName,
          sectionConfig.syncRowHeights ? 'fc-scrollgrid-sync-table' : '',
        ].join(' '),
        style: {
          minWidth: arg.tableMinWidth, // because colMinWidths arent enough
          width: arg.clientWidth,
          height: expandRows ? arg.clientHeight : '', // css `height` on a <table> serves as a min-height
        },
      },
      arg.tableColGroupNode,
      createElement('tbody', {}, typeof chunkConfig.rowContent === 'function' ? chunkConfig.rowContent(arg) : chunkConfig.rowContent))

  return content
}

export function isColPropsEqual(cols0: ColProps[], cols1: ColProps[]) {
  return isArraysEqual(cols0, cols1, isPropsEqual)
}

export function renderMicroColGroup(cols: ColProps[], shrinkWidth?: number): VNode {
  let colNodes: VNode[] = []

  /*
  for ColProps with spans, it would have been great to make a single <col span="">
  HOWEVER, Chrome was getting messing up distributing the width to <td>/<th> elements with colspans.
  SOLUTION: making individual <col> elements makes Chrome behave.
  */
  for (let colProps of cols) {
    let span = colProps.span || 1

    for (let i = 0; i < span; i += 1) {
      colNodes.push(
        <col
          style={{
            width: colProps.width === 'shrink' ? sanitizeShrinkWidth(shrinkWidth) : (colProps.width || ''),
            minWidth: colProps.minWidth || '',
          }}
        />,
      )
    }
  }

  return createElement('colgroup', {}, ...colNodes)
}

export function sanitizeShrinkWidth(shrinkWidth?: number) {
  /* why 4? if we do 0, it will kill any border, which are needed for computeSmallestCellWidth
  4 accounts for 2 2-pixel borders. TODO: better solution? */
  return shrinkWidth == null ? 4 : shrinkWidth
}

export function hasShrinkWidth(cols: ColProps[]) {
  for (let col of cols) {
    if (col.width === 'shrink') {
      return true
    }
  }

  return false
}

export function getScrollGridClassNames(liquid: boolean, context: ViewContext) {
  let classNames = [
    'fc-scrollgrid',
    context.theme.getClass('table'),
  ]

  if (liquid) {
    classNames.push('fc-scrollgrid-liquid')
  }

  return classNames
}

export function getSectionClassNames(sectionConfig: SectionConfig, wholeTableVGrow: boolean) {
  let classNames = [
    'fc-scrollgrid-section',
    `fc-scrollgrid-section-${sectionConfig.type}`,
    sectionConfig.className, // used?
  ]

  if (wholeTableVGrow && sectionConfig.liquid && sectionConfig.maxHeight == null) {
    classNames.push('fc-scrollgrid-section-liquid')
  }

  if (sectionConfig.isSticky) {
    classNames.push('fc-scrollgrid-section-sticky')
  }

  return classNames
}

export function renderScrollShim(arg: ChunkContentCallbackArgs) {
  return (
    <div
      className="fc-scrollgrid-sticky-shim"
      style={{
        width: arg.clientWidth,
        minWidth: arg.tableMinWidth,
      }}
    />
  )
}

export function getStickyHeaderDates(options: BaseOptionsRefined) {
  let { stickyHeaderDates } = options

  if (stickyHeaderDates == null || stickyHeaderDates === 'auto') {
    stickyHeaderDates = options.height === 'auto' || options.viewHeight === 'auto'
  }

  return stickyHeaderDates
}

export function getStickyFooterScrollbar(options: BaseOptionsRefined) {
  let { stickyFooterScrollbar } = options

  if (stickyFooterScrollbar == null || stickyFooterScrollbar === 'auto') {
    stickyFooterScrollbar = options.height === 'auto' || options.viewHeight === 'auto'
  }

  return stickyFooterScrollbar
}
