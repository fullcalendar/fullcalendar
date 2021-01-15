import {
  createElement,
  VNode,
  BaseComponent,
  RefMap,
  CssDimValue,
  createRef,
  PositionCache,
  DateProfile,
} from '@fullcalendar/common'
import { TimeSlatMeta } from './time-slat-meta'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'
import { TimeColsSlatsBody } from './TimeColsSlatsBody'

export interface TimeColsSlatsProps extends TimeColsSlatsContentProps {
  dateProfile: DateProfile
  clientWidth: number | null
  minHeight: CssDimValue
  tableMinWidth: CssDimValue
  tableColGroupNode: VNode
  onCoords?: (coords: TimeColsSlatsCoords | null) => void
}

interface TimeColsSlatsContentProps {
  axis: boolean
  slatMetas: TimeSlatMeta[]
}

/*
for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
*/

export class TimeColsSlats extends BaseComponent<TimeColsSlatsProps> {
  private rootElRef = createRef<HTMLDivElement>()
  private slatElRefs = new RefMap<HTMLTableRowElement>()

  render() {
    let { props, context } = this

    return (
      <div className="fc-timegrid-slots" ref={this.rootElRef}>
        <table
          className={context.theme.getClass('table')}
          style={{
            minWidth: props.tableMinWidth,
            width: props.clientWidth,
            height: props.minHeight,
          }}
        >
          {props.tableColGroupNode /* relies on there only being a single <col> for the axis */}
          <TimeColsSlatsBody
            slatElRefs={this.slatElRefs}
            axis={props.axis}
            slatMetas={props.slatMetas}
          />
        </table>
      </div>
    )
  }

  componentDidMount() {
    this.updateSizing()
  }

  componentDidUpdate() {
    this.updateSizing()
  }

  componentWillUnmount() {
    if (this.props.onCoords) {
      this.props.onCoords(null)
    }
  }

  updateSizing() {
    let { context, props } = this

    if (
      props.onCoords &&
      props.clientWidth !== null // means sizing has stabilized
    ) {
      let rootEl = this.rootElRef.current

      if (rootEl.offsetHeight) { // not hidden by css
        props.onCoords(
          new TimeColsSlatsCoords(
            new PositionCache(
              this.rootElRef.current,
              collectSlatEls(this.slatElRefs.currentMap, props.slatMetas),
              false,
              true, // vertical
            ),
            this.props.dateProfile,
            context.options.slotDuration,
          ),
        )
      }
    }
  }
}

function collectSlatEls(elMap: { [key: string]: HTMLElement }, slatMetas: TimeSlatMeta[]) {
  return slatMetas.map((slatMeta) => elMap[slatMeta.key])
}
