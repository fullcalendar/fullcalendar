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
  createRef,
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
  private rootElRef = createRef<HTMLElement>()

  render() {
    let { options, dateEnv } = this.context
    let { props } = this
    let { date, hiddenInstances, todayRange, dateProfile, selectedInstanceId } = props
    let title = dateEnv.format(date, options.dayPopoverFormat)

    return (
      <DayCellRoot date={date} dateProfile={dateProfile} todayRange={todayRange} elRef={this.rootElRef}>
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

  positionToHit(positionLeft: number, positionTop: number, originEl: HTMLElement) {
    let rootEl = this.rootElRef.current

    if (!originEl || !rootEl) { // why?
      return null
    }

    let originRect = originEl.getBoundingClientRect()
    let elRect = rootEl.getBoundingClientRect()
    let newOriginLeft = elRect.left - originRect.left
    let newOriginTop = elRect.top - originRect.top
    let localLeft = positionLeft - newOriginLeft
    let localTop = positionTop - newOriginTop
    let date = this.props.date

    if ( // ugly way to detect intersection
      localLeft >= 0 && localLeft < elRect.width &&
      localTop >= 0 && localTop < elRect.height
    ) {
      return {
        dateSpan: {
          allDay: true,
          range: { start: date, end: addDays(date, 1) },
        },
        dayEl: rootEl,
        relativeRect: {
          left: newOriginLeft,
          top: newOriginTop,
          right: elRect.width,
          bottom: elRect.height,
        },
        layer: 1, // important when comparing with hits from other components
      }
    }

    return null
  }
}
