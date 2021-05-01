import {
  createElement,
  MoreLinkRoot,
  RefObject,
  BaseComponent,
  memoize,
  DateMarker,
  Dictionary,
} from '@fullcalendar/common'
import { TableSegPlacement } from './event-placement'
import { TableSeg } from './TableSeg'

export interface TableCellMoreLinkProps {
  allDayDate: DateMarker
  singlePlacements: TableSegPlacement[]
  marginTop: number
  positionElRef: RefObject<HTMLElement>
  extraDateSpan?: Dictionary
}

export class TableCellMoreLink extends BaseComponent<TableCellMoreLinkProps> {
  compileSegs = memoize(compileSegs)

  render(props: TableCellMoreLinkProps) {
    let { allSegs, hiddenSegs } = this.compileSegs(props.singlePlacements)

    return Boolean(hiddenSegs.length) && (
      <div className="fc-daygrid-day-bottom" style={{ marginTop: props.marginTop }}>
        <MoreLinkRoot
          allDayDate={props.allDayDate}
          allSegs={allSegs}
          hiddenSegs={hiddenSegs}
          positionElRef={props.positionElRef}
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
