import { h, BaseComponent, ComponentContext, VNode, CssDimValue, DateProfile, RefMap, PositionCache, createRef } from '@fullcalendar/core'
import { DayBgRow, DayBgCellModel } from '@fullcalendar/daygrid'


export interface TimeColsBgProps {
  dateProfile: DateProfile
  cells: DayBgCellModel[]
  clientWidth: CssDimValue
  tableMinWidth: CssDimValue
  tableColGroupNode: VNode
  renderIntro: () => VNode[]
  onCoords?: (coords: PositionCache | null) => void
}


export default class TimeColsBg extends BaseComponent<TimeColsBgProps> {

  rootElRef = createRef<HTMLDivElement>()
  cellElRefs = new RefMap<HTMLTableCellElement>()


  render(props: TimeColsBgProps, state: {}, context: ComponentContext) {
    return (
      <div class='fc-bg' ref={this.rootElRef}>
        <table class={context.theme.getClass('table')} style={{
          minWidth: props.tableMinWidth,
          width: props.clientWidth
        }}>
          {props.tableColGroupNode}
          <DayBgRow
            dateProfile={props.dateProfile}
            cells={props.cells}
            renderIntro={props.renderIntro}
            cellElRefs={this.cellElRefs}
          />
        </table>
      </div>
    )
  }


  componentDidMount() {
    this.handleSizing()
    this.context.addResizeHandler(this.handleSizing)
  }


  componentDidUpdate() {
    this.handleSizing()
  }


  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleSizing)

    if (this.props.onCoords) {
      this.props.onCoords(null)
    }
  }


  handleSizing = () => {
    let { props } = this

    if (props.onCoords && props.tableColGroupNode && props.clientWidth) {
      props.onCoords(
        new PositionCache(
          this.rootElRef.current,
          this.cellElRefs.collect(),
          true, // horizontal
          false
        )
      )
    }
  }

}
