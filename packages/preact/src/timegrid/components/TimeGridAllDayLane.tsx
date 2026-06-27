import { DayGridRow, DayGridRowProps } from '../../daygrid/components/DayGridRow'
import { computeColFromPosition, getCellEl } from '../../daygrid/components/util'
import { addDays } from '@full-ui/headless-calendar'
import { DateComponent } from '../../component/DateComponent'
import { Hit } from '../../interactions/hit'
import { createRef } from 'react'

export interface TimeGridAllDayLaneProps extends DayGridRowProps {
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
}

export class TimeGridAllDayLane extends DateComponent<TimeGridAllDayLaneProps> {
  // ref
  private rootEl: HTMLElement
  private heightRef = createRef<number>()

  render() {
    return (
      <DayGridRow
        {...this.props}

        /* BAD: these overwrite the props! caller might want to pass them */
        rootElRef={this.handleRootEl}
        heightRef={this.heightRef} /* ALSO, BAD because it simply watches natural height of row-root-el */
      />
    )
  }

  handleRootEl = (rootEl: HTMLDivElement) => {
    this.rootEl = rootEl

    if (rootEl) {
      this.context.registerInteractiveComponent(this, {
        el: rootEl,
      })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }

  queryHit(isRtl: boolean, positionLeft: number, positionTop: number, elWidth: number): Hit {
    const { props, heightRef } = this

    const colCount = props.cells.length
    const { col, left, right } = computeColFromPosition(
      positionLeft,
      elWidth,
      props.colWidth,
      colCount,
      isRtl
    )
    const cell = props.cells[col]
    const cellStartDate = cell.date
    const cellEndDate = addDays(cellStartDate, 1)

    return {
      dateProfile: props.dateProfile,
      dateSpan: {
        range: {
          start: cellStartDate,
          end: cellEndDate,
        },
        allDay: true,
        ...cell.dateSpanProps,
      },
      getDayEl: () => getCellEl(this.rootEl, col),
      rect: {
        left,
        right,
        top: 0,
        bottom: heightRef.current,
      },
      layer: 0,
    }
  }
}
