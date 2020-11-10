import {
  createElement, VNode,
  BaseComponent,
  ViewContext,
  createDuration,
  asRoughMs,
  formatIsoTimeString,
  addDurations,
  wholeDivideDurations,
  Duration,
  createFormatter,
  RefMap,
  CssDimValue,
  createRef,
  PositionCache,
  DateMarker,
  DateEnv,
  ViewContextType,
  RenderHook,
  DateProfile,
  SlotLabelContentArg,
  SlotLaneContentArg,
} from '@fullcalendar/common'
import { TimeColsSlatsCoords } from './TimeColsSlatsCoords'

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

// potential nice values for the slot-duration and interval-duration
// from largest to smallest
const STOCK_SUB_DURATIONS = [
  { hours: 1 },
  { minutes: 30 },
  { minutes: 15 },
  { seconds: 30 },
  { seconds: 15 },
]

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
    let { props } = this

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
            props.slatMetas,
          ),
        )
      }
    }
  }
}

function collectSlatEls(elMap: { [key: string]: HTMLElement }, slatMetas: TimeSlatMeta[]) {
  return slatMetas.map((slatMeta) => elMap[slatMeta.key])
}

export interface TimeColsSlatsBodyProps {
  axis: boolean
  slatMetas: TimeSlatMeta[]
  slatElRefs: RefMap<HTMLTableRowElement>
}

export class TimeColsSlatsBody extends BaseComponent<TimeColsSlatsBodyProps> {
  render() {
    let { props, context } = this
    let { options } = context
    let { slatElRefs } = props

    return (
      <tbody>
        {props.slatMetas.map((slatMeta, i) => {
          let hookProps: SlotLaneContentArg = {
            time: slatMeta.time,
            date: context.dateEnv.toDate(slatMeta.date),
            view: context.viewApi,
          }

          let classNames = [
            'fc-timegrid-slot',
            'fc-timegrid-slot-lane',
            slatMeta.isLabeled ? '' : 'fc-timegrid-slot-minor',
          ]

          return (
            <tr
              key={slatMeta.key}
              ref={slatElRefs.createRef(slatMeta.key)}
            >
              {props.axis &&
                <TimeColsAxisCell {...slatMeta} />}
              <RenderHook
                hookProps={hookProps}
                classNames={options.slotLaneClassNames}
                content={options.slotLaneContent}
                didMount={options.slotLaneDidMount}
                willUnmount={options.slotLaneWillUnmount}
              >
                {(rootElRef, customClassNames, innerElRef, innerContent) => (
                  <td
                    ref={rootElRef}
                    className={classNames.concat(customClassNames).join(' ')}
                    data-time={slatMeta.isoTimeStr}
                  >
                    {innerContent}
                  </td>
                )}
              </RenderHook>
            </tr>
          )
        })}
      </tbody>
    )
  }
}

const DEFAULT_SLAT_LABEL_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'short',
})

export function TimeColsAxisCell(props: TimeSlatMeta) {
  let classNames = [
    'fc-timegrid-slot',
    'fc-timegrid-slot-label',
    props.isLabeled ? 'fc-scrollgrid-shrink' : 'fc-timegrid-slot-minor',
  ]

  return (
    <ViewContextType.Consumer>
      {(context: ViewContext) => {
        if (!props.isLabeled) {
          return (
            <td className={classNames.join(' ')} data-time={props.isoTimeStr} />
          )
        }

        let { dateEnv, options, viewApi } = context
        let labelFormat = // TODO: fully pre-parse
          options.slotLabelFormat == null ? DEFAULT_SLAT_LABEL_FORMAT :
          Array.isArray(options.slotLabelFormat) ? createFormatter(options.slotLabelFormat[0]) :
          createFormatter(options.slotLabelFormat)

        let hookProps: SlotLabelContentArg = {
          level: 0,
          time: props.time,
          date: dateEnv.toDate(props.date),
          view: viewApi,
          text: dateEnv.format(props.date, labelFormat),
        }

        return (
          <RenderHook<SlotLabelContentArg> // needed?
            hookProps={hookProps}
            classNames={options.slotLabelClassNames}
            content={options.slotLabelContent}
            defaultContent={renderInnerContent}
            didMount={options.slotLabelDidMount}
            willUnmount={options.slotLabelWillUnmount}
          >
            {(rootElRef, customClassNames, innerElRef, innerContent) => (
              <td ref={rootElRef} className={classNames.concat(customClassNames).join(' ')} data-time={props.isoTimeStr}>
                <div className="fc-timegrid-slot-label-frame fc-scrollgrid-shrink-frame">
                  <div className="fc-timegrid-slot-label-cushion fc-scrollgrid-shrink-cushion" ref={innerElRef}>
                    {innerContent}
                  </div>
                </div>
              </td>
            )}
          </RenderHook>
        )
      }}
    </ViewContextType.Consumer>
  )
}

function renderInnerContent(props) { // TODO: add types
  return props.text
}

export interface TimeSlatMeta {
  date: DateMarker
  time: Duration
  key: string
  isoTimeStr: string
  isLabeled: boolean
}

export function buildSlatMetas(slotMinTime: Duration, slotMaxTime: Duration, explicitLabelInterval: Duration | null, slotDuration: Duration, dateEnv: DateEnv) {
  let dayStart = new Date(0)
  let slatTime = slotMinTime
  let slatIterator = createDuration(0)
  let labelInterval = explicitLabelInterval || computeLabelInterval(slotDuration)
  let metas: TimeSlatMeta[] = []

  while (asRoughMs(slatTime) < asRoughMs(slotMaxTime)) {
    let date = dateEnv.add(dayStart, slatTime)
    let isLabeled = wholeDivideDurations(slatIterator, labelInterval) !== null

    metas.push({
      date,
      time: slatTime,
      key: date.toISOString(), // we can't use the isoTimeStr for uniqueness when minTime/maxTime beyone 0h/24h
      isoTimeStr: formatIsoTimeString(date),
      isLabeled,
    })

    slatTime = addDurations(slatTime, slotDuration)
    slatIterator = addDurations(slatIterator, slotDuration)
  }

  return metas
}

// Computes an automatic value for slotLabelInterval
function computeLabelInterval(slotDuration) {
  let i
  let labelInterval
  let slotsPerLabel

  // find the smallest stock label interval that results in more than one slots-per-label
  for (i = STOCK_SUB_DURATIONS.length - 1; i >= 0; i--) {
    labelInterval = createDuration(STOCK_SUB_DURATIONS[i])
    slotsPerLabel = wholeDivideDurations(labelInterval, slotDuration)
    if (slotsPerLabel !== null && slotsPerLabel > 1) {
      return labelInterval
    }
  }

  return slotDuration // fall back
}
