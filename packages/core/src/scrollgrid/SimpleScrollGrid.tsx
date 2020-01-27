import { VNode, h } from '../vdom'
import ComponentContext from '../component/ComponentContext'
import { BaseComponent, setRef } from '../vdom-util'
import Scroller, { OverflowValue } from './Scroller'
import RefMap from '../util/RefMap'
import { ColProps, SectionConfig, renderMicroColGroup, computeShrinkWidth, getScrollGridClassNames, getSectionClassNames, getNeedsYScrolling,
  renderChunkContent, getChunkVGrow, computeForceScrollbars, ChunkConfig, hasShrinkWidth, CssDimValue, getChunkClassNames, computeScrollerClientWidths, computeScrollerClientHeights,
  } from './util'
import { memoize } from '../util/memoize'


export interface SimpleScrollGridProps {
  cols: ColProps[]
  sections: SimpleScrollGridSection[]
  vGrow?: boolean
  forPrint?: boolean
  height?: CssDimValue // TODO: give to real ScrollGrid
}

export interface SimpleScrollGridSection extends SectionConfig {
  chunk?: ChunkConfig
}

interface SimpleScrollGridState {
  isSizingReady: boolean
  shrinkWidth: null | number
  forceYScrollbars: null | boolean
  scrollerClientWidths: null | { [index: string]: number }
  scrollerClientHeights: null | { [index: string]: number }
}

const INITIAL_SIZING_STATE: SimpleScrollGridState = {
  isSizingReady: false,
  shrinkWidth: null,
  forceYScrollbars: null,
  scrollerClientWidths: null,
  scrollerClientHeights: null
}


export default class SimpleScrollGrid extends BaseComponent<SimpleScrollGridProps, SimpleScrollGridState> {

  renderMicroColGroup = memoize(renderMicroColGroup) // yucky to memoize VNodes, but much more efficient for consumers
  scrollerRefs = new RefMap<Scroller>()
  scrollerElRefs = new RefMap<HTMLElement, [ChunkConfig]>(this._handleScrollerEl.bind(this))

  state = INITIAL_SIZING_STATE


  static getDerivedStateFromProps(props, state: SimpleScrollGridState) {
    if (state.isSizingReady) { // from a prop change
      return INITIAL_SIZING_STATE
    } else if (state.scrollerClientWidths) { // the last sizing-state was just set
      return { isSizingReady: true }
    }
  }


  render(props: SimpleScrollGridProps, state: SimpleScrollGridState, context: ComponentContext) {
    let sectionConfigs = props.sections || []

    let microColGroupNode = props.forPrint ?
        <colgroup></colgroup> : // temporary
        this.renderMicroColGroup(props.cols, state.shrinkWidth)

    let classNames = getScrollGridClassNames(props.vGrow, context)
    if (props.forPrint) { // temporary
      classNames.push('scrollgrid--forprint')
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
      <tr class={getSectionClassNames(sectionConfig, this.props.vGrow).join(' ')}>
        {this.renderChunkTd(sectionConfig, sectionI, microColGroupNode, sectionConfig.chunk)}
      </tr>
    )
  }


  renderChunkTd(sectionConfig: SimpleScrollGridSection, sectionI: number, microColGroupNode: VNode, chunkConfig: ChunkConfig) {

    if ('outerContent' in chunkConfig) {
      return chunkConfig.outerContent
    }

    let { state } = this
    let { isSizingReady } = state

    let needsYScrolling = getNeedsYScrolling(this.props, sectionConfig, chunkConfig) // TODO: do lazily
    let overflowY: OverflowValue = state.forceYScrollbars ? 'scroll' : (needsYScrolling ? 'auto' : 'hidden')
    let vGrow = getChunkVGrow(this.props, sectionConfig, chunkConfig)

    let content = renderChunkContent(sectionConfig, chunkConfig, {
      tableColGroupNode: microColGroupNode,
      tableMinWidth: '',
      tableWidth: isSizingReady ? state.scrollerClientWidths[sectionI] : '',
      tableHeight: isSizingReady ? state.scrollerClientHeights[sectionI] : '', // TODO: subtract 1 for IE?????
      isSizingReady
    })

    // TODO: cleaner solution
    // in browsers other than Chrome, the height of the inner table was taking precedence over scroller's liquid height,
    // making it so there's never be scrollbars (thus the position:relative div)
    if (vGrow) {
      return (
        <td class={getChunkClassNames(sectionConfig, chunkConfig, this.context)} ref={chunkConfig.elRef}>
          <div style={{ position: 'relative' }} class='vgrow'>
            <Scroller
              ref={this.scrollerRefs.createRef(sectionI)}
              elRef={this.scrollerElRefs.createRef(sectionI, chunkConfig)}
              className={'vgrow--absolute' /* needed for sizing within table. TODO fix position:relative above */}
              overflowY={overflowY}
              overflowX='hidden'
              maxHeight={sectionConfig.maxHeight}
              vGrow={vGrow}
            >{content}</Scroller>
          </div>
        </td>
      )
    } else {
      return (
        <td class={getChunkClassNames(sectionConfig, chunkConfig, this.context)} ref={chunkConfig.elRef}>
          <div>{/* when we didn't have this, preact was recycling the ref, and removing it
            (not not adding it back yet) before recomputing the scrollbar-forcing  */}
            <Scroller
              ref={this.scrollerRefs.createRef(sectionI)}
              elRef={this.scrollerElRefs.createRef(sectionI, chunkConfig)}
              overflowY={overflowY}
              overflowX='hidden'
              maxHeight={sectionConfig.maxHeight}
              vGrow={vGrow}
            >{content}</Scroller>
          </div>
        </td>
      )
    }
  }


  _handleScrollerEl(scrollerEl: HTMLElement | null, key: string, chunkConfig: ChunkConfig) {
    setRef(chunkConfig.scrollerElRef, scrollerEl)
  }


  componentDidMount() {
    if (!this.props.forPrint) {
      this.adjustSizing()
    }

    this.context.addResizeHandler(this.handleResize)
  }


  componentDidUpdate(prevProps: SimpleScrollGridProps, prevState: SimpleScrollGridState) {
    if (!this.props.forPrint) { // repeat code
      this.adjustSizing()
    }
  }


  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleResize)
  }


  adjustSizing() {
    let { state } = this

    if (state.shrinkWidth == null) {
      this.setState({
        shrinkWidth:
          hasShrinkWidth(this.props.cols) ? // TODO: do this optimization for ScrollGrid
            computeShrinkWidth(this.scrollerElRefs.getAll())
            : 0
      })

    } else if (state.forceYScrollbars == null) {
      this.setState({
        forceYScrollbars: computeForceScrollbars(this.scrollerRefs.getAll(), 'Y')
      })

    } else if (!state.scrollerClientWidths) {
      this.setState({
        scrollerClientWidths: computeScrollerClientWidths(this.scrollerElRefs),
        scrollerClientHeights: computeScrollerClientHeights(this.scrollerElRefs)
      })
    }
  }


  handleResize = () => {
    if (!this.props.forPrint) {
      this.forceUpdate() // getDerivedStateFromProps will clear the sizing state
    }
  }


  // TODO: can do a really simple print-view. dont need to join rows

}
