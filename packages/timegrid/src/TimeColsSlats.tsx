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
  memoize,
  Fragment,
  RefMap
} from '@fullcalendar/core'


export interface TimeColsSlatsProps {
  dateProfile: DateProfile
  slotDuration: Duration
  onReceiveSlatEls?: (slatEls: HTMLElement[] | null) => void
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

  private slatElRefs = new RefMap<HTMLTableRowElement>()
  private getLabelInterval = memoize(getLabelInterval)
  private getLabelFormat = memoize(getLabelFormat)


  render(props: TimeColsSlatsProps, state: {}, context: ComponentContext) {
    let { dateEnv, theme, isRtl, options } = context
    let { dateProfile, slotDuration } = props

    let labelInterval = this.getLabelInterval(options.slotLabelInterval, slotDuration)
    let labelFormat = this.getLabelFormat(options.slotLabelFormat)

    let dayStart = startOfDay(dateProfile.renderRange.start)
    let slotTime = dateProfile.minTime
    let slotIterator = createDuration(0)
    let slotDate // will be on the view's first day, but we only care about its time
    let isLabeled
    let rowsNodes: VNode[] = []
    let i = 0

    // Calculate the time for each slot
    while (asRoughMs(slotTime) < asRoughMs(dateProfile.maxTime)) {
      slotDate = dateEnv.add(dayStart, slotTime)
      isLabeled = wholeDivideDurations(slotIterator, labelInterval) !== null

      let classNames = [ 'fc-axis', 'fc-time', theme.getClass('tableCellNormal') ]
      let axisNode =
        isLabeled ?
          <td class={classNames.concat('shrink').join(' ')}>
            <div data-fc-width-all={1}>
              <span data-fc-width-content={1}>
                {dateEnv.format(slotDate, labelFormat)}
              </span>
            </div>
          </td>
          :
          <td class={classNames.join(' ')} />

      rowsNodes.push(
        <tr
          ref={this.slatElRefs.createRef(i)}
          data-time={formatIsoTimeString(slotDate)}
          class={isLabeled ? '' : 'fc-minor'}
        >
          {!isRtl && axisNode}
          <td class={theme.getClass('tableCellNormal')}></td>
          {isRtl && axisNode}
        </tr>
      )

      slotTime = addDurations(slotTime, slotDuration)
      slotIterator = addDurations(slotIterator, slotDuration)
      i++
    }

    return (<Fragment>{rowsNodes}</Fragment>)
  }


  componentDidMount() {
    this.sendDom()
  }


  componentDidUpdate() {
    this.sendDom()
  }


  componentWillUnmount() {
    let { onReceiveSlatEls } = this.props
    if (onReceiveSlatEls) {
      onReceiveSlatEls(null)
    }
  }


  sendDom() {
    let { onReceiveSlatEls } = this.props
    if (onReceiveSlatEls) {
      onReceiveSlatEls(this.slatElRefs.collect())
    }
  }

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


function getLabelFormat(optionInput) {
  return createFormatter(optionInput || {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: true,
    meridiem: 'short'
  })
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

TimeColsSlats.addPropsEquality({
  onReceiveSlatEls: true
})
