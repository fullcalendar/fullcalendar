import {
  DateComponent,
  DateMarker,
  createElement,
  EventInstanceHash,
  addDays,
  DateRange,
  getSegMeta,
  DayCellRoot,
  DayCellContent,
  DateProfile,
  Hit,
} from '@fullcalendar/common'
import { TableSeg } from './TableSeg'
import { TableBlockEvent } from './TableBlockEvent'
import { TableListItemEvent } from './TableListItemEvent'
import { Popover } from './Popover'
import { hasListItemDisplay } from './event-rendering'

export interface MorePopoverProps {
  date: DateMarker
  dateProfile: DateProfile
  segs: TableSeg[]
  selectedInstanceId: string
  hiddenInstances: EventInstanceHash
  alignmentEl: HTMLElement
  topAlignmentEl?: HTMLElement
  onCloseClick?: () => void
  todayRange: DateRange
}

export class MorePopover extends DateComponent<MorePopoverProps> {
  rootEl: HTMLElement

  render() {
    let { options, dateEnv } = this.context
    let { props } = this
    let { date, hiddenInstances, todayRange, dateProfile, selectedInstanceId } = props
    let title = dateEnv.format(date, options.dayPopoverFormat)

    return (
      <DayCellRoot date={date} dateProfile={dateProfile} todayRange={todayRange} elRef={this.handleRootEl}>
        {(rootElRef, dayClassNames, dataAttrs) => (
          <Popover
            elRef={rootElRef}
            title={title}
            extraClassNames={['fc-more-popover'].concat(dayClassNames)}
            extraAttrs={dataAttrs}
            onClose={props.onCloseClick}
            alignmentEl={props.alignmentEl}
            topAlignmentEl={props.topAlignmentEl}
          >
            <DayCellContent date={date} dateProfile={dateProfile} todayRange={todayRange}>
              {(innerElRef, innerContent) => (
                innerContent &&
                  <div className="fc-more-popover-misc" ref={innerElRef}>{innerContent}</div>
              )}
            </DayCellContent>
            {props.segs.map((seg) => {
              let instanceId = seg.eventRange.instance.instanceId
              return (
                <div
                  className="fc-daygrid-event-harness"
                  key={instanceId}
                  style={{
                    visibility: hiddenInstances[instanceId] ? 'hidden' : ('' as any),
                  }}
                >
                  {hasListItemDisplay(seg) ? (
                    <TableListItemEvent
                      seg={seg}
                      isDragging={false}
                      isSelected={instanceId === selectedInstanceId}
                      defaultDisplayEventEnd={false}
                      {...getSegMeta(seg, todayRange)}
                    />
                  ) : (
                    <TableBlockEvent
                      seg={seg}
                      isDragging={false}
                      isResizing={false}
                      isDateSelecting={false}
                      isSelected={instanceId === selectedInstanceId}
                      defaultDisplayEventEnd={false}
                      {...getSegMeta(seg, todayRange)}
                    />
                  )}
                </div>
              )
            })}
          </Popover>
        )}
      </DayCellRoot>
    )
  }

  handleRootEl = (rootEl: HTMLDivElement | null) => {
    this.rootEl = rootEl
    if (rootEl) {
      this.context.registerInteractiveComponent(this, { el: rootEl })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }

  queryHit(positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit {
    let { rootEl, props } = this
    let { date } = props

    if (
      positionLeft >= 0 && positionLeft < elWidth &&
      positionTop >= 0 && positionTop < elHeight
    ) {
      return {
        dateProfile: props.dateProfile,
        dateSpan: {
          resourceId: '',
          allDay: true,
          range: { start: date, end: addDays(date, 1) },
        },
        dayEl: rootEl,
        rect: {
          left: 0,
          top: 0,
          right: elWidth,
          bottom: elHeight,
        },
        layer: 1, // important when comparing with hits from other components
      }
    }

    return null
  }
}
