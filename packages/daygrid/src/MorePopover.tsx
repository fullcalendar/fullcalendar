import { DateComponent, DateMarker, h, EventInstanceHash, ComponentContext, createFormatter, Hit, addDays, DateRange, getDateMeta, getDayClassNames, getSegMeta } from '@fullcalendar/core'
import TableSeg from './TableSeg'
import TableEvent from './TableEvent'
import Popover from './Popover'


export interface MorePopoverProps {
  date: DateMarker
  segs: TableSeg[]
  selectedInstanceId: string
  hiddenInstances: EventInstanceHash
  alignmentEl: HTMLElement
  topAlignmentEl?: HTMLElement
  onCloseClick?: () => void
  todayRange: DateRange
}


export default class MorePopover extends DateComponent<MorePopoverProps> {

  private popoverEl: HTMLElement


  render(props: MorePopoverProps, state: {}, context: ComponentContext) {
    let { options, dateEnv } = context
    let { date, hiddenInstances, todayRange } = props
    let title = dateEnv.format(date, createFormatter(options.dayPopoverFormat)) // TODO: cache formatter

    let contentClassNames = [ 'fc-more-popover-content' ].concat(
      getDayClassNames(
        getDateMeta(date, todayRange),
        context.theme
      )
    )

    return (
      <Popover
        elRef={this.handlePopoverEl}
        title={title}
        onClose={props.onCloseClick}
        alignmentEl={props.alignmentEl}
        topAlignmentEl={props.topAlignmentEl}
      >
        <div className={contentClassNames.join(' ')}>
          {props.segs.map((seg) => {
            let { eventRange } = seg
            let instanceId = eventRange.instance.instanceId

            return (
              <div
                class='fc-daygrid-event-harness'
                key={instanceId}
                style={{
                  visibility: hiddenInstances[instanceId] ? 'hidden' : ''
                }}
              >
                <TableEvent
                  seg={seg}
                  isDragging={false}
                  isResizing={false}
                  isDateSelecting={false}
                  isSelected={instanceId === props.selectedInstanceId}
                  {...getSegMeta(seg, todayRange)}
                />
              </div>
            )
          })}
        </div>
      </Popover>
    )
  }


  handlePopoverEl = (popoverEl: HTMLElement | null) => {
    this.popoverEl = popoverEl

    if (popoverEl) {
      this.context.calendar.registerInteractiveComponent(this, {
        el: popoverEl,
        useEventCenter: false
      })
    } else {
      this.context.calendar.unregisterInteractiveComponent(this)
    }
  }


  queryHit(positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit | null {
    let date = this.props.date

    if (positionLeft < elWidth && positionTop < elHeight) {
      return {
        component: this,
        dateSpan: {
          allDay: true,
          range: { start: date, end: addDays(date, 1) }
        },
        dayEl: this.popoverEl,
        rect: {
          left: 0,
          top: 0,
          right: elWidth,
          bottom: elHeight
        },
        layer: 1
      }
    }
  }


  isPopover() {
    return true // gross
  }

}
