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
  EventSegUiInteractionState,
  getSegMeta,
  Fragment,
} from '@fullcalendar/common'
import { TableSegPlacement } from './event-placement'
import { hasListItemDisplay } from './event-rendering'
import { TableBlockEvent } from './TableBlockEvent'
import { TableListItemEvent } from './TableListItemEvent'
import { TableSeg } from './TableSeg'

export interface TableCellMoreLinkProps {
  allDayDate: DateMarker
  singlePlacements: TableSegPlacement[]
  moreCnt: number
  alignmentElRef: RefObject<HTMLElement> // for popover
  alignGridTop: boolean // for popover
  extraDateSpan?: Dictionary
  dateProfile: DateProfile
  todayRange: DateRange
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
}

export class TableCellMoreLink extends BaseComponent<TableCellMoreLinkProps> {
  compileSegs = memoize(compileSegs)

  render() {
    let { props } = this
    let { allSegs, invisibleSegs } = this.compileSegs(props.singlePlacements)

    return (
      <MoreLinkRoot
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        allDayDate={props.allDayDate}
        moreCnt={props.moreCnt}
        allSegs={allSegs}
        hiddenSegs={invisibleSegs}
        alignmentElRef={props.alignmentElRef}
        alignGridTop={props.alignGridTop}
        extraDateSpan={props.extraDateSpan}
        popoverContent={() => {
          let isForcedInvisible =
            (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
            (props.eventResize ? props.eventResize.affectedInstances : null) ||
            {}
          return (
            <Fragment>
              {allSegs.map((seg) => {
                let instanceId = seg.eventRange.instance.instanceId
                return (
                  <div
                    className="fc-daygrid-event-harness"
                    key={instanceId}
                    style={{
                      visibility: isForcedInvisible[instanceId] ? 'hidden' : ('' as any),
                    }}
                  >
                    {hasListItemDisplay(seg) ? (
                      <TableListItemEvent
                        seg={seg}
                        isDragging={false}
                        isSelected={instanceId === props.eventSelection}
                        defaultDisplayEventEnd={false}
                        {...getSegMeta(seg, props.todayRange)}
                      />
                    ) : (
                      <TableBlockEvent
                        seg={seg}
                        isDragging={false}
                        isResizing={false}
                        isDateSelecting={false}
                        isSelected={instanceId === props.eventSelection}
                        defaultDisplayEventEnd={false}
                        {...getSegMeta(seg, props.todayRange)}
                      />
                    )}
                  </div>
                )
              })}
            </Fragment>
          )
        }}
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
    )
  }
}

function compileSegs(singlePlacements: TableSegPlacement[]): {
  allSegs: TableSeg[]
  invisibleSegs: TableSeg[]
} {
  let allSegs: TableSeg[] = []
  let invisibleSegs: TableSeg[] = []

  for (let placement of singlePlacements) {
    allSegs.push(placement.seg)

    if (!placement.isVisible) {
      invisibleSegs.push(placement.seg)
    }
  }

  return { allSegs, invisibleSegs }
}
