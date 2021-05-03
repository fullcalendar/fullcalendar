import {
  createElement,
  MoreLinkRoot,
  RefObject,
  BaseComponent,
  memoize,
  DateMarker,
  Dictionary,
  DateProfile,
  DateRange,
} from '@fullcalendar/common'
import { TableSegPlacement } from './event-placement'
import { TableSeg } from './TableSeg'

export interface TableCellMoreLinkProps {
  allDayDate: DateMarker
  singlePlacements: TableSegPlacement[]
  marginTop: number
  alignmentElRef: RefObject<HTMLElement>
  extraDateSpan?: Dictionary
  dateProfile: DateProfile
  todayRange: DateRange
}

export class TableCellMoreLink extends BaseComponent<TableCellMoreLinkProps> {
  compileSegs = memoize(compileSegs)

  render(props: TableCellMoreLinkProps) {
    let { allSegs, hiddenSegs } = this.compileSegs(props.singlePlacements)

    return Boolean(hiddenSegs.length) && (
      <div className="fc-daygrid-day-bottom" style={{ marginTop: props.marginTop }}>
        <MoreLinkRoot
          dateProfile={props.dateProfile}
          todayRange={props.todayRange}
          allDayDate={props.allDayDate}
          allSegs={allSegs}
          hiddenSegs={hiddenSegs}
          alignmentElRef={props.alignmentElRef}
          extraDateSpan={props.extraDateSpan}
        >
          {(rootElRef, classNames, innerElRef, innerContent, handleClick) => (
            <a
              ref={rootElRef}
              className={['fc-daygrid-more-link'].concat(classNames).join(' ')}
              onClick={handleClick}
            >
              {innerContent}
            </a>
          )}
        </MoreLinkRoot>
      </div>
    )

    /*
      (!props.forPrint && (
        <MorePopover
          ref={this.morePopoverRef}
          date={morePopoverState.date}
          dateProfile={dateProfile}
          segs={morePopoverState.allSegs}
          alignmentEl={morePopoverState.dayEl}
          topAlignmentEl={rowCnt === 1 ? props.headerAlignElRef.current : null}
          selectedInstanceId={props.eventSelection}
          hiddenInstances={// yuck
            (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
            (props.eventResize ? props.eventResize.affectedInstances : null) ||
            {}
          }
          todayRange={todayRange}
        />
      )

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
      */
  }
}

function compileSegs(singlePlacements: TableSegPlacement[]): {
  allSegs: TableSeg[]
  hiddenSegs: TableSeg[]
} {
  let allSegs: TableSeg[] = []
  let hiddenSegs: TableSeg[] = []

  for (let placement of singlePlacements) {
    allSegs.push(placement.seg)

    if (!placement.isVisible) {
      hiddenSegs.push(placement.seg)
    }
  }

  return { allSegs, hiddenSegs }
}
