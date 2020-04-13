import { DateComponent, DateMarker, h, EventInstanceHash, ComponentContext, createFormatter, Hit, addDays, DateRange, getSegMeta, DayCellRoot, DayCellContent } from '@fullcalendar/core'
import TableSeg from './TableSeg'
import TableBlockEvent from './TableBlockEvent'
import TableDotEvent from './TableDotEvent'
import Popover from './Popover'
import { isDotRendering } from './event-rendering'


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

    return (
      <DayCellRoot date={date} todayRange={todayRange} elRef={this.handlePopoverEl}>
        {(rootElRef, dayClassNames, dataAttrs) => (
          <Popover
            elRef={rootElRef}
            title={title}
            extraClassNames={[ 'fc-more-popover' ].concat(dayClassNames)}
            extraAttrs={dataAttrs}
            onClose={props.onCloseClick}
            alignmentEl={props.alignmentEl}
            topAlignmentEl={props.topAlignmentEl}
          >
            <DayCellContent date={date} todayRange={todayRange}>
              {(innerElRef, innerContent) => (
                innerContent &&
                  <div class='fc-more-popover-misc' ref={innerElRef}>{innerContent}</div>
              )}
            </DayCellContent>
            {props.segs.map((seg) => {
              let { eventRange } = seg
              let instanceId = eventRange.instance.instanceId

              return (
                <div
                  className='fc-daygrid-event-harness'
                  key={instanceId}
                  style={{
                    visibility: hiddenInstances[instanceId] ? 'hidden' : ''
                  }}
                >
                  {isDotRendering(eventRange) ?
                    <TableDotEvent
                      seg={seg}
                      isDragging={false}
                      isSelected={instanceId === props.selectedInstanceId}
                      defaultDisplayEventEnd={false}
                      {...getSegMeta(seg, todayRange)}
                    /> :
                    <TableBlockEvent
                      seg={seg}
                      isDragging={false}
                      isResizing={false}
                      isDateSelecting={false}
                      isSelected={instanceId === props.selectedInstanceId}
                      defaultDisplayEventEnd={false}
                      {...getSegMeta(seg, todayRange)}
                    />
                  }
                </div>
              )
            })}
          </Popover>
        )}
      </DayCellRoot>
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
