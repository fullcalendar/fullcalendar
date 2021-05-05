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
  Fragment,
  getSegMeta,
} from '@fullcalendar/common'
import { TableSegPlacement } from './event-placement'
import { hasListItemDisplay } from './event-rendering'
import { TableBlockEvent } from './TableBlockEvent'
import { TableListItemEvent } from './TableListItemEvent'
import { TableSeg } from './TableSeg'

export interface TableCellMoreLinkProps {
  allDayDate: DateMarker
  singlePlacements: TableSegPlacement[]
  marginTop: number
  alignmentElRef: RefObject<HTMLElement>
  extraDateSpan?: Dictionary
  dateProfile: DateProfile
  todayRange: DateRange
  eventSelection: string
  eventDrag: EventSegUiInteractionState | null
  eventResize: EventSegUiInteractionState | null
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
          popoverContent={() => {
            let hiddenInstances =
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
                        visibility: hiddenInstances[instanceId] ? 'hidden' : ('' as any),
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
      </div>
    )
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
