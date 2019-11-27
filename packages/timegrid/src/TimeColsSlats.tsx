import {
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
  findElements,
  guid
} from '@fullcalendar/core'
import { h, VNode } from 'preact'

export interface TimeColsSlatsProps {
  dateProfile: DateProfile
  slotDuration: Duration
  handleDom?: (rootEl: HTMLElement | null, slatEls: HTMLElement[] | null) => void
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

    // Calculate the time for each slot
    while (asRoughMs(slotTime) < asRoughMs(dateProfile.maxTime)) {
      slotDate = dateEnv.add(dayStart, slotTime)
      isLabeled = wholeDivideDurations(slotIterator, labelInterval) !== null

      let axisNode =
        <td class={'fc-axis fc-time ' + theme.getClass('widgetContent')}>
          {isLabeled &&
            <span>
              {dateEnv.format(slotDate, labelFormat)}
            </span>
          }
        </td>

      rowsNodes.push(
        <tr data-time={formatIsoTimeString(slotDate)} class={isLabeled ? 'fc-minor' : ''}>
          {!isRtl && axisNode}
          <td class={theme.getClass('widgetContent')}></td>
          {isRtl && axisNode}
        </tr>
      )

      slotTime = addDurations(slotTime, slotDuration)
      slotIterator = addDurations(slotIterator, slotDuration)
    }

    return ( // guid rerenders whole DOM every time
      <div class='fc-slats' ref={this.handleRootEl} key={guid()}>
        <table class={theme.getClass('tableGrid')}>
          {rowsNodes}
        </table>
      </div>
    )
  }


  handleRootEl = (rootEl: HTMLElement | null) => {
    let { handleDom } = this.props
    let slatEls = null

    if (rootEl) {
      slatEls = findElements(rootEl, 'tr')
    }

    if (handleDom) {
      handleDom(rootEl, slatEls)
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
