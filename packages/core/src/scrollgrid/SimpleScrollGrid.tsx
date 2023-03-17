import { VNode, createElement, Fragment } from '../preact.js'
import { BaseComponent, setRef } from '../vdom-util.js'
import { Scroller, OverflowValue } from './Scroller.js'
import { RefMap } from '../util/RefMap.js'
import {
  ColProps, SectionConfig, renderMicroColGroup, computeShrinkWidth, getScrollGridClassNames, getSectionClassNames, getAllowYScrolling,
  renderChunkContent, getSectionHasLiquidHeight, ChunkConfig, hasShrinkWidth, CssDimValue,
  isColPropsEqual,
} from './util.js'
import { getCanVGrowWithinCell } from '../util/table-styling.js'
import { memoize } from '../util/memoize.js'
import { isPropsEqual } from '../util/object.js'
import { getScrollbarWidths } from '../util/scrollbar-width.js'

export interface SimpleScrollGridProps {
  cols: ColProps[]
  sections: SimpleScrollGridSection[]
  liquid: boolean // liquid *height*
  collapsibleWidth: boolean // can ALL sections be fully collapsed in width?
  height?: CssDimValue // TODO: give to real ScrollGrid
}

export interface SimpleScrollGridSection extends SectionConfig {
  key: string
  chunk?: ChunkConfig
}

interface SimpleScrollGridState {
  shrinkWidth: number | null
  forceYScrollbars: boolean
  scrollerClientWidths: { [key: string]: number }
  scrollerClientHeights: { [key: string]: number }
}

export class SimpleScrollGrid extends BaseComponent<SimpleScrollGridProps, SimpleScrollGridState> {
  processCols = memoize((a) => a, isColPropsEqual) // so we get same `cols` props every time

  // yucky to memoize VNodes, but much more efficient for consumers
  renderMicroColGroup: typeof renderMicroColGroup = memoize(renderMicroColGroup)

  scrollerRefs = new RefMap<Scroller>()
  scrollerElRefs = new RefMap<HTMLElement>(this._handleScrollerEl.bind(this))

  state: SimpleScrollGridState = {
    shrinkWidth: null,
    forceYScrollbars: false,
    scrollerClientWidths: {},
    scrollerClientHeights: {},
  }

  render(): VNode {
    let { props, state, context } = this
    let sectionConfigs = props.sections || []
    let cols = this.processCols(props.cols)

    let microColGroupNode = this.renderMicroColGroup(cols, state.shrinkWidth)
    let classNames = getScrollGridClassNames(props.liquid, context)

    if (props.collapsibleWidth) {
      classNames.push('fc-scrollgrid-collapsible')
    }

    // TODO: make DRY
    let configCnt = sectionConfigs.length
    let configI = 0
    let currentConfig: SimpleScrollGridSection
    let headSectionNodes: VNode[] = []
    let bodySectionNodes: VNode[] = []
    let footSectionNodes: VNode[] = []

    while (configI < configCnt && (currentConfig = sectionConfigs[configI]).type === 'header') {
      headSectionNodes.push(this.renderSection(currentConfig, microColGroupNode, true))
      configI += 1
    }

    while (configI < configCnt && (currentConfig = sectionConfigs[configI]).type === 'body') {
      bodySectionNodes.push(this.renderSection(currentConfig, microColGroupNode, false))
      configI += 1
    }

    while (configI < configCnt && (currentConfig = sectionConfigs[configI]).type === 'footer') {
      footSectionNodes.push(this.renderSection(currentConfig, microColGroupNode, true))
      configI += 1
    }

    // firefox bug: when setting height on table and there is a thead or tfoot,
    // the necessary height:100% on the liquid-height body section forces the *whole* table to be taller. (bug #5524)
    // use getCanVGrowWithinCell as a way to detect table-stupid firefox.
    // if so, use a simpler dom structure, jam everything into a lone tbody.
    let isBuggy = !getCanVGrowWithinCell()

    const roleAttrs = { role: 'rowgroup' }

    return createElement(
      'table',
      {
        role: 'grid',
        className: classNames.join(' '),
        style: { height: props.height },
      },
      Boolean(!isBuggy && headSectionNodes.length) && createElement('thead', roleAttrs, ...headSectionNodes),
      Boolean(!isBuggy && bodySectionNodes.length) && createElement('tbody', roleAttrs, ...bodySectionNodes),
      Boolean(!isBuggy && footSectionNodes.length) && createElement('tfoot', roleAttrs, ...footSectionNodes),
      isBuggy && createElement('tbody', roleAttrs, ...headSectionNodes, ...bodySectionNodes, ...footSectionNodes),
    )
  }

  renderSection(sectionConfig: SimpleScrollGridSection, microColGroupNode: VNode, isHeader: boolean) {
    if ('outerContent' in sectionConfig) {
      return (
        <Fragment key={sectionConfig.key}>
          {sectionConfig.outerContent}
        </Fragment>
      )
    }

    return (
      <tr
        key={sectionConfig.key}
        role="presentation"
        className={getSectionClassNames(sectionConfig, this.props.liquid).join(' ')}
      >
        {this.renderChunkTd(sectionConfig, microColGroupNode, sectionConfig.chunk, isHeader)}
      </tr>
    )
  }

  renderChunkTd(
    sectionConfig: SimpleScrollGridSection,
    microColGroupNode: VNode,
    chunkConfig: ChunkConfig,
    isHeader: boolean,
  ): createElement.JSX.Element {
    if ('outerContent' in chunkConfig) {
      return chunkConfig.outerContent
    }

    let { props } = this
    let { forceYScrollbars, scrollerClientWidths, scrollerClientHeights } = this.state

    let needsYScrolling = getAllowYScrolling(props, sectionConfig) // TODO: do lazily. do in section config?
    let isLiquid = getSectionHasLiquidHeight(props, sectionConfig)

    // for `!props.liquid` - is WHOLE scrollgrid natural height?
    // TODO: do same thing in advanced scrollgrid? prolly not b/c always has horizontal scrollbars
    let overflowY: OverflowValue =
      !props.liquid ? 'visible' :
        forceYScrollbars ? 'scroll' :
          !needsYScrolling ? 'hidden' :
            'auto'

    let sectionKey = sectionConfig.key
    let content = renderChunkContent(sectionConfig, chunkConfig, {
      tableColGroupNode: microColGroupNode,
      tableMinWidth: '',
      clientWidth: (!props.collapsibleWidth && scrollerClientWidths[sectionKey] !== undefined) ? scrollerClientWidths[sectionKey] : null,
      clientHeight: scrollerClientHeights[sectionKey] !== undefined ? scrollerClientHeights[sectionKey] : null,
      expandRows: sectionConfig.expandRows,
      syncRowHeights: false,
      rowSyncHeights: [],
      reportRowHeightChange: () => {},
    }, isHeader)

    return createElement(
      isHeader ? 'th' : 'td',
      {
        ref: chunkConfig.elRef as any,
        role: 'presentation',
      },
      <div className={`fc-scroller-harness${isLiquid ? ' fc-scroller-harness-liquid' : ''}`}>
        <Scroller
          ref={this.scrollerRefs.createRef(sectionKey)}
          elRef={this.scrollerElRefs.createRef(sectionKey)}
          overflowY={overflowY}
          overflowX={!props.liquid ? 'visible' : 'hidden' /* natural height? */}
          maxHeight={sectionConfig.maxHeight}
          liquid={isLiquid}
          liquidIsAbsolute // because its within a harness
        >
          {content}
        </Scroller>
      </div>,
    )
  }

  _handleScrollerEl(scrollerEl: HTMLElement | null, key: string) {
    let section = getSectionByKey(this.props.sections, key)

    if (section) {
      setRef(section.chunk.scrollerElRef, scrollerEl)
    }
  }

  // TODO: can do a really simple print-view. dont need to join rows
  handleSizing = () => {
    this.safeSetState({
      shrinkWidth: this.computeShrinkWidth(), // will create each chunk's <colgroup>. TODO: precompute hasShrinkWidth
      ...this.computeScrollerDims(),
    })
  }

  componentDidMount() {
    this.handleSizing()
    this.context.addResizeHandler(this.handleSizing)
  }

  componentDidUpdate() {
    // TODO: need better solution when state contains non-sizing things
    this.handleSizing()
  }

  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleSizing)
  }

  computeShrinkWidth() {
    return hasShrinkWidth(this.props.cols)
      ? computeShrinkWidth(this.scrollerElRefs.getAll())
      : 0
  }

  computeScrollerDims() {
    let scrollbarWidth = getScrollbarWidths()
    let { scrollerRefs, scrollerElRefs } = this

    let forceYScrollbars = false
    let scrollerClientWidths: { [index: string]: number } = {}
    let scrollerClientHeights: { [index: string]: number } = {}

    for (let sectionKey in scrollerRefs.currentMap) {
      let scroller = scrollerRefs.currentMap[sectionKey]

      if (scroller && scroller.needsYScrolling()) {
        forceYScrollbars = true
        break
      }
    }

    for (let section of this.props.sections) {
      let sectionKey = section.key
      let scrollerEl = scrollerElRefs.currentMap[sectionKey]

      if (scrollerEl) {
        let harnessEl = scrollerEl.parentNode as HTMLElement // TODO: weird way to get this. need harness b/c doesn't include table borders

        scrollerClientWidths[sectionKey] = Math.floor(
          harnessEl.getBoundingClientRect().width - (
            forceYScrollbars
              ? scrollbarWidth.y // use global because scroller might not have scrollbars yet but will need them in future
              : 0
          ),
        )

        scrollerClientHeights[sectionKey] = Math.floor(
          harnessEl.getBoundingClientRect().height, // never has horizontal scrollbars
        )
      }
    }

    return { forceYScrollbars, scrollerClientWidths, scrollerClientHeights }
  }
}

SimpleScrollGrid.addStateEquality({
  scrollerClientWidths: isPropsEqual,
  scrollerClientHeights: isPropsEqual,
})

function getSectionByKey(sections: SimpleScrollGridSection[], key: string): SimpleScrollGridSection | null {
  for (let section of sections) {
    if (section.key === key) {
      return section
    }
  }

  return null
}
