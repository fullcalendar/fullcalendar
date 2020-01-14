import { VNode, h } from '../vdom'
import ComponentContext from '../component/ComponentContext'
import { BaseComponent, setRef, componentNeedsResize } from '../vdom-util'
import Scroller, { OverflowValue } from './Scroller'
import RefMap from '../util/RefMap'
import { ColProps, SectionConfig, renderMicroColGroup, computeShrinkWidth, getScrollGridClassNames, getSectionClassNames, getNeedsYScrolling,
  renderChunkContent, getChunkVGrow, computeForceScrollbars, ChunkConfig, hasShrinkWidth, CssDimValue, getChunkClassNames } from './util'


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
  shrinkWidth?: number
  forceYScrollbars: boolean
}

const STATE_IS_SIZING = {
  shrinkWidth: true,
  forceYScrollbars: true
}


export default class SimpleScrollGrid extends BaseComponent<SimpleScrollGridProps> {

  scrollerRefs = new RefMap<Scroller>()
  scrollerElRefs = new RefMap<HTMLElement, [ChunkConfig]>(this._handleScrollerEl.bind(this))

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

    let needsYScrolling = getNeedsYScrolling(this.props, sectionConfig, chunkConfig) // TODO: do lazily
    let overflowY: OverflowValue = this.state.forceYScrollbars ? 'scroll' : (needsYScrolling ? 'auto' : 'hidden')
    let content = renderChunkContent(sectionConfig, chunkConfig, microColGroupNode, '', true)
    let vGrow = getChunkVGrow(this.props, sectionConfig, chunkConfig)

    // TODO: cleaner solution
    // in browsers other than Chrome, the height of the inner table was taking precedence over scroller's liquid height,
    // making it so there's never be scrollbars
    if (vGrow) {
      return (
        <td class={getChunkClassNames(sectionConfig, chunkConfig, this.context)} ref={chunkConfig.elRef}>
          <div style={{ position: 'relative' }} class='vgrow'>
            <Scroller
              ref={this.scrollerRefs.createRef(sectionI)}
              elRef={this.scrollerElRefs.createRef(sectionI, chunkConfig)}
              className='vgrow--absolute'
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
          <Scroller
            ref={this.scrollerRefs.createRef(sectionI)}
            elRef={this.scrollerElRefs.createRef(sectionI, chunkConfig)}
            overflowY={overflowY}
            overflowX='hidden'
            maxHeight={sectionConfig.maxHeight}
            vGrow={vGrow}
          >{content}</Scroller>
        </td>
      )
    }
  }


  _handleScrollerEl(scrollerEl: HTMLElement | null, key: string, chunkConfig: ChunkConfig) {
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

    if (hasShrinkWidth(this.props.cols)) {
      this.setState({
        shrinkWidth: computeShrinkWidth(this.scrollerElRefs.getAll())
      })
    }

    this.setState({
      forceYScrollbars: computeForceScrollbars(this.scrollerRefs.getAll(), 'Y')
    })
  }


  // TODO: can do a really simple print-view. dont need to join rows

}
