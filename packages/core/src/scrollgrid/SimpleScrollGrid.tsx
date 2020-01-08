import { VNode, h } from '../vdom'
import ComponentContext from '../component/ComponentContext'
import { BaseComponent, setRef, componentNeedsResize } from '../vdom-util'
import Scroller, { OverflowValue } from './Scroller'
import RefMap from '../util/RefMap'
import { ColCss, SectionConfig, renderMicroColGroup, computeShrinkWidth, getScrollGridClassNames, getSectionClassNames, getNeedsYScrolling,
  renderChunkContent, getChunkVGrow, doSizingHacks, computeForceScrollbars, ChunkConfig, hasShrinkWidth, CssDimValue, getChunkClassNames } from './util'


export interface SimpleScrollGridProps {
  cols: ColCss[]
  sections: SimpleScrollGridSection[]
  vGrow?: boolean
  height?: CssDimValue // TODO: give to real ScrollGrid
}

export interface SimpleScrollGridSection extends SectionConfig {
  chunk?: ChunkConfig
}

interface SimpleScrollGridState {
  shrinkWidth?: number
  forceYScrollbars: boolean
}

const STATE_IS_SIZING = {
  shrinkWidth: true,
  forceYScrollbars: true
}


export default class SimpleScrollGrid extends BaseComponent<SimpleScrollGridProps> {

  scrollerRefs = new RefMap<Scroller>()
  scrollerElRefs = new RefMap<HTMLElement, [ChunkConfig]>(this._handleScrollerElRef.bind(this))

  state = {
    forceYScrollbars: false
  }


  render(props: SimpleScrollGridProps, state: SimpleScrollGridState, context: ComponentContext) {
    let sectionConfigs = props.sections || []
    let microColGroupNode = renderMicroColGroup(props.cols, state.shrinkWidth)

    return (
      <table class={getScrollGridClassNames(props.vGrow, context).join(' ')} style={{ height: props.height }}>
        {sectionConfigs.map((sectionConfig, sectionI) => this.renderSection(sectionConfig, sectionI, microColGroupNode))}
      </table>
    )
  }


  renderSection(sectionConfig: SimpleScrollGridSection, sectionI: number, microColGroupNode: VNode) {
    return (
      <tr class={getSectionClassNames(sectionConfig, this.props.vGrow).join(' ')}>
        {this.renderChunkTd(sectionConfig, sectionI, microColGroupNode, sectionConfig.chunk)}
      </tr>
    )
  }


  renderChunkTd(sectionConfig: SimpleScrollGridSection, sectionI: number, microColGroupNode: VNode, chunkConfig: ChunkConfig) {

    if (chunkConfig.outerContent) {
      return chunkConfig.outerContent
    }

    let needsYScrolling = getNeedsYScrolling(this.props, sectionConfig, chunkConfig) // TODO: do lazily
    let overflowY: OverflowValue = this.state.forceYScrollbars ? 'scroll' : (needsYScrolling ? 'auto' : 'hidden')
    let content = renderChunkContent(sectionConfig, chunkConfig, microColGroupNode, '', true)

    return (
      <td class={getChunkClassNames(sectionConfig, this.context)} ref={chunkConfig.elRef}>
        <Scroller
          ref={this.scrollerRefs.createRef(sectionI)}
          elRef={this.scrollerElRefs.createRef(sectionI, chunkConfig)}
          className={chunkConfig.scrollerClassName}
          overflowY={overflowY}
          overflowX='hidden'
          maxHeight={sectionConfig.maxHeight}
          vGrow={getChunkVGrow(this.props, sectionConfig, chunkConfig)}
        >{content}</Scroller>
      </td>
    )
  }


  _handleScrollerElRef(scrollerEl: HTMLElement | null, key: string, chunkConfig: ChunkConfig) {
    setRef(chunkConfig.scrollerElRef, scrollerEl)
  }


  componentDidMount() {
    this.handleSizing()
    this.context.addResizeHandler(this.handleSizing)
  }


  componentDidUpdate(prevProps: SimpleScrollGridProps, prevState: SimpleScrollGridState) {
    if (componentNeedsResize(prevProps, this.props, prevState, this.state, STATE_IS_SIZING)) {
      this.handleSizing()
    }
  }


  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleSizing)
  }


  handleSizing = () => {
    doSizingHacks(this.base as HTMLElement)

    if (hasShrinkWidth(this.props.cols)) {
      this.setState({
        shrinkWidth: computeShrinkWidth(this.scrollerElRefs.getCurrents())
      })
    }

    this.setState({
      forceYScrollbars: computeForceScrollbars(this.scrollerRefs.getCurrents(), 'Y')
    })
  }


  // TODO: can do a really simple print-view. dont need to join rows

}
