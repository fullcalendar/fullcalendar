import { VNode, h } from '../vdom'
import ComponentContext from '../component/ComponentContext'
import { BaseComponent, setRef } from '../vdom-util'
import Scroller, { OverflowValue } from './Scroller'
import RefMap from '../util/RefMap'
import {
  ColProps, SectionConfig, renderMicroColGroup, computeShrinkWidth, getScrollGridClassNames, getSectionClassNames, getAllowYScrolling,
  renderChunkContent, getDoesSectionVGrow, ChunkConfig, hasShrinkWidth, CssDimValue,
  isColPropsEqual
} from './util'
import { memoize } from '../util/memoize'
import { isPropsEqual } from '../util/object'
import { getScrollbarWidths } from '../util/scrollbar-width'
import { getCanVGrowWithinCell } from './table-styling'


export interface SimpleScrollGridProps {
  cols: ColProps[]
  sections: SimpleScrollGridSection[]
  vGrow?: boolean
  forPrint?: boolean
  height?: CssDimValue // TODO: give to real ScrollGrid
}

export interface SimpleScrollGridSection extends SectionConfig {
  key?: string
  chunk?: ChunkConfig
}

interface SimpleScrollGridState {
  shrinkWidth: number | null
  forceYScrollbars: boolean
  scrollerClientWidths: { [index: string]: number } // why not use array?
  scrollerClientHeights: { [index: string]: number }
}


export default class SimpleScrollGrid extends BaseComponent<SimpleScrollGridProps, SimpleScrollGridState> {

  processCols = memoize((a) => a, isColPropsEqual) // so we get same `cols` props every time
  renderMicroColGroup = memoize(renderMicroColGroup) // yucky to memoize VNodes, but much more efficient for consumers
  scrollerRefs = new RefMap<Scroller>()
  scrollerElRefs = new RefMap<HTMLElement>(this._handleScrollerEl.bind(this))

  state: SimpleScrollGridState = {
    shrinkWidth: null,
    forceYScrollbars: false,
    scrollerClientWidths: {},
    scrollerClientHeights: {}
  }


  render(props: SimpleScrollGridProps, state: SimpleScrollGridState, context: ComponentContext) {
    let sectionConfigs = props.sections || []
    let cols = this.processCols(props.cols)

    let microColGroupNode = props.forPrint ?
        <colgroup></colgroup> : // temporary
        this.renderMicroColGroup(cols, state.shrinkWidth)

    let classNames = getScrollGridClassNames(props.vGrow, context)
    if (props.forPrint) { // temporary
      classNames.push('fc-scrollgrid--forprint')
    }

    if (!getCanVGrowWithinCell()) {
      classNames.push('fc-scrollgrid-vgrow-cell-hack')
    }

    return (
      <table class={classNames.join(' ')} style={{ height: props.height }}>
        {sectionConfigs.map((sectionConfig, sectionI) => this.renderSection(sectionConfig, sectionI, microColGroupNode))}
      </table>
    )
  }


  renderSection(sectionConfig: SimpleScrollGridSection, sectionI: number, microColGroupNode: VNode) {

    if ('outerContent' in sectionConfig) {
      return sectionConfig.outerContent
    }

    return (
      <tr key={sectionConfig.key} class={getSectionClassNames(sectionConfig, this.props.vGrow).join(' ')}>
        {this.renderChunkTd(sectionConfig, sectionI, microColGroupNode, sectionConfig.chunk)}
      </tr>
    )
  }


  renderChunkTd(sectionConfig: SimpleScrollGridSection, sectionI: number, microColGroupNode: VNode, chunkConfig: ChunkConfig) {

    if ('outerContent' in chunkConfig) {
      return chunkConfig.outerContent
    }

    let { state } = this

    let needsYScrolling = getAllowYScrolling(this.props, sectionConfig) // TODO: do lazily. do in section config?
    let vGrow = getDoesSectionVGrow(this.props, sectionConfig)

    let overflowY: OverflowValue =
      state.forceYScrollbars ? 'scroll' :
      !needsYScrolling ? 'hidden' :
      'auto'

    let content = renderChunkContent(sectionConfig, chunkConfig, {
      tableColGroupNode: microColGroupNode,
      tableMinWidth: '',
      clientWidth: state.scrollerClientWidths[sectionI] || '',
      clientHeight: state.scrollerClientHeights[sectionI] || '',
      vGrowRows: sectionConfig.vGrowRows,
      syncRowHeights: false,
      rowSyncHeights: [],
      reportRowHeightChange: () => {}
    })

    return (
      <td ref={chunkConfig.elRef}>
        <div class={'fc-scroller-harness' + (vGrow ? ' vgrow' : '')}>
          <Scroller
            ref={this.scrollerRefs.createRef(sectionI)}
            elRef={this.scrollerElRefs.createRef(sectionI)}
            overflowY={overflowY}
            overflowX='hidden'
            maxHeight={sectionConfig.maxHeight}
            vGrow={vGrow}
          >{content}</Scroller>
        </div>
      </td>
    )
  }


  _handleScrollerEl(scrollerEl: HTMLElement | null, key: string) {
    let sectionI = parseInt(key, 10)
    let chunkConfig = this.props.sections[sectionI].chunk

    setRef(chunkConfig.scrollerElRef, scrollerEl)
  }


  // TODO: can do a really simple print-view. dont need to join rows
  handleSizing = () => {
    if (!this.props.forPrint) {
      this.setState({
        shrinkWidth: this.computeShrinkWidth(), // will create each chunk's <colgroup>. TODO: precompute hasShrinkWidth
        ...this.computeScrollerDims()
      })
    }
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
    let sectionCnt = this.props.sections.length
    let { scrollerRefs, scrollerElRefs } = this

    let forceYScrollbars = false
    let scrollerClientWidths: { [index: string]: number } = {}
    let scrollerClientHeights: { [index: string]: number } = {}

    for (let sectionI = 0; sectionI < sectionCnt; sectionI++) { // along edge
      let scroller = scrollerRefs.currentMap[sectionI]

      if (scroller && scroller.needsYScrolling()) {
        forceYScrollbars = true
        break
      }
    }

    for (let sectionI = 0; sectionI < sectionCnt; sectionI++) { // along edge
      let scrollerEl = scrollerElRefs.currentMap[sectionI]

      if (scrollerEl) {
        scrollerClientWidths[sectionI] = scrollerEl.offsetWidth - (forceYScrollbars ? scrollbarWidth.y : 0)
        scrollerClientHeights[sectionI] = scrollerEl.offsetHeight
        // TODO: need IE wiggle?
      }
    }

    return { forceYScrollbars, scrollerClientWidths, scrollerClientHeights }
  }

}

SimpleScrollGrid.addStateEquality({
  scrollerClientWidths: isPropsEqual,
  scrollerClientHeights: isPropsEqual
})
