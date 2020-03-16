import {
  h, VNode,
  BaseComponent,
  DateProfile,
  ComponentContext,
  createDuration,
  startOfDay,
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
  ComponentContextType,
  RenderHook
} from '@fullcalendar/core'
import TimeColsSlatsCoords from './TimeColsSlatsCoords'


export interface TimeColsSlatsProps extends TimeColsSlatsContentProps {
  clientWidth: CssDimValue
  minHeight: CssDimValue
  tableMinWidth: CssDimValue
  tableColGroupNode: VNode
  onCoords?: (coords: TimeColsSlatsCoords | null) => void
}

interface TimeColsSlatsContentProps {
  dateProfile: DateProfile
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
  { seconds: 15 }
]

/*
for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
*/


export default class TimeColsSlats extends BaseComponent<TimeColsSlatsProps> {

  private rootElRef = createRef<HTMLDivElement>()
  private slatElRefs = new RefMap<HTMLTableRowElement>()


  render(props: TimeColsSlatsProps, state: {}, context: ComponentContext) {
    let { theme } = context

    return (
      <div class='fc-timegrid-slats' ref={this.rootElRef}>
        <table
          class={theme.getClass('table') + ' vgrow' /* why not use rowsGrow like resource view? */}
          style={{
            minWidth: props.tableMinWidth,
            width: props.clientWidth,
            height: props.minHeight
          }}
        >
          {props.tableColGroupNode /* relies on there only being a single <col> for the axis */}
          <TimeColsSlatsBody
            slatElRefs={this.slatElRefs}
            axis={props.axis}
            slatMetas={props.slatMetas}
            dateProfile={props.dateProfile}
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

    if (props.onCoords && props.clientWidth) { // clientWidth means sizing has stabilized
      props.onCoords(
        new TimeColsSlatsCoords(
          new PositionCache(
            this.rootElRef.current,
            this.slatElRefs.collect(),
            false,
            true // vertical
          ),
          props.dateProfile,
          props.slatMetas
        )
      )
    }
  }

}


export interface TimeColsSlatsBodyProps extends TimeColsSlatsContentProps {
  slatElRefs: RefMap<HTMLTableRowElement>
}


export class TimeColsSlatsBody extends BaseComponent<TimeColsSlatsBodyProps> {

  render(props: TimeColsSlatsBodyProps, state: {}, context: ComponentContext) {
    let { slatElRefs } = props

    return (
      <tbody>
        {props.slatMetas.map((slatMeta, i) => {
          let innerProps = {
            time: slatMeta.time,
            date: context.dateEnv.toDate(slatMeta.date),
            view: context.view
          }
          let classNames = [ 'fc-slat', 'fc-time', (!slatMeta.isLabeled ? ' fc-minor' : '') ]

          return (
            <tr ref={slatElRefs.createRef(i)}>
              {props.axis &&
                <TimeColsAxisCell {...slatMeta} />
              }
              <RenderHook name='slotLane' mountProps={innerProps} dynamicProps={innerProps}>
                {(rootElRef, customClassNames, innerElRef, innerContent) => (
                  <td
                    ref={rootElRef}
                    className={classNames.concat(customClassNames).join(' ')}
                    data-time={slatMeta.isoTimeStr}
                  >{innerContent}</td>
                )}
              </RenderHook>
            </tr>
          )
        })}
      </tbody>
    )
  }

}


const DEFAULT_SLAT_LABEL_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'short'
}

export function TimeColsAxisCell(props: TimeSlatMeta) {
  let classNames = [ 'fc-slat', 'fc-time', props.isLabeled ? 'shrink' : 'fc-minor', 'fc-axis' ]

  return (
    <ComponentContextType.Consumer>
      {(context: ComponentContext) => {

        if (!props.isLabeled) {
          return (
            <td className={classNames.join(' ')} data-time={props.isoTimeStr} />
          )

        } else {
          let { dateEnv, options, view } = context
          let labelFormat = createFormatter(options.slotLabelFormat || DEFAULT_SLAT_LABEL_FORMAT) // TODO: optimize!!!
          let mountProps = {
            time: props.time,
            date: dateEnv.toDate(props.date),
            view: view
          }
          let dynamicProps = {
            ...mountProps,
            text: dateEnv.format(props.date, labelFormat)
          }

          return (
            <RenderHook name='slotLabel' mountProps={mountProps} dynamicProps={dynamicProps} defaultInnerContent={renderInnerContent}>
              {(rootElRef, customClassNames, innerElRef, innerContent) => (
                <td ref={rootElRef} class={classNames.concat(customClassNames).join(' ')} data-time={props.isoTimeStr}>
                  <div data-fc-width-all={1}>
                    <span data-fc-width-content={1} ref={innerElRef}>
                      {innerContent}
                    </span>
                  </div>
                </td>
              )}
            </RenderHook>
          )
        }
      }}
    </ComponentContextType.Consumer>
  )
}


function renderInnerContent(props) { // TODO: add types
  return props.text
}


export interface TimeSlatMeta {
  date: DateMarker
  time: Duration
  isoTimeStr: string
  isLabeled: boolean
}

export function buildSlatMetas(dateProfile: DateProfile, labelIntervalInput, slotDuration: Duration, dateEnv: DateEnv) {
  let dayStart = startOfDay(dateProfile.renderRange.start)
  let slatTime = dateProfile.slotMinTime
  let slatIterator = createDuration(0)
  let labelInterval = getLabelInterval(labelIntervalInput, slotDuration)
  let metas: TimeSlatMeta[] = []

  while (asRoughMs(slatTime) < asRoughMs(dateProfile.slotMaxTime)) {
    let date = dateEnv.add(dayStart, slatTime)
    let isLabeled = wholeDivideDurations(slatIterator, labelInterval) !== null

    metas.push({
      date,
      time: slatTime,
      isoTimeStr: formatIsoTimeString(date),
      isLabeled
    })

    slatTime = addDurations(slatTime, slotDuration)
    slatIterator = addDurations(slatIterator, slotDuration)
  }

  return metas
}


function getLabelInterval(optionInput, slotDuration: Duration) {

  // might be an array value (for TimelineView).
  // if so, getting the most granular entry (the last one probably).
  if (Array.isArray(optionInput)) {
    optionInput = optionInput[optionInput.length - 1]
  }

  return optionInput ?
    createDuration(optionInput) :
    computeLabelInterval(slotDuration)
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
