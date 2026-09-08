import { DayGridRow, DayGridRowProps } from '../../daygrid/components/DayGridRow'
import { computeColFromPosition, getCellEl } from '../../daygrid/components/util'
import { addDays } from '@full-ui/headless-calendar'
import { DateComponent } from '../../component/DateComponent'
import { Hit } from '../../interactions/hit'
import { createRef } from 'react'
import { MoreLinkTrigger } from '../../common/MoreLinkContainer'
import { resolveDayGridPlacementMode } from '../../daygrid/seg-placement-adapter'
import { watchHeight } from '../../component-util/resize-observer'
import classNames from '../../styles.module.css'

export interface TimeGridAllDayLaneProps extends DayGridRowProps {
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
}

interface TimeGridAllDayLaneState {
  moreLinkHeight?: number
}

export class TimeGridAllDayLane extends DateComponent<TimeGridAllDayLaneProps, TimeGridAllDayLaneState> {
  state: TimeGridAllDayLaneState = {}

  // ref
  private rootEl: HTMLElement
  private heightRef = createRef<number>()
  private disconnectMoreLinkHeight?: () => void
  private _isUnmounting: boolean

  render() {
    const { props, state } = this
    const needsMoreLinkProbe = !props.forPrint && resolveDayGridPlacementMode(
      props.dayMaxEvents,
      props.dayMaxEventRows,
    ) === 'auto'

    return (
      <>
        <DayGridRow
          {...props}
          moreLinkHeight={state.moreLinkHeight}

          /* BAD: these overwrite the props! caller might want to pass them */
          rootElRef={this.handleRootEl}
          heightRef={this.heightRef} /* ALSO, BAD because it simply watches natural height of row-root-el */
        />
        {/* Intrinsic width: row more-link height must not depend on text wrapping. */}
        {needsMoreLinkProbe && (
          <MoreLinkTrigger
            num={1}
            display='row'
            isNarrow={props.cellIsNarrow}
            isMicro={props.cellIsMicro}
            elRef={this.handleMoreLinkEl}
            className={classNames.offscreen}
            attrs={{
              'aria-hidden': true,
              inert: '',
            }}
          />
        )}
      </>
    )
  }

  private handleMoreLinkEl = (el: HTMLElement | null) => {
    this.disconnectMoreLinkHeight?.()
    this.disconnectMoreLinkHeight = undefined

    if (el) {
      this.disconnectMoreLinkHeight = watchHeight(el, (height) => {
        if (this._isUnmounting) return
        this.setState({ moreLinkHeight: height })
      })
    }
  }

  componentDidMount(): void {
    this._isUnmounting = false
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
    this.disconnectMoreLinkHeight?.()
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
