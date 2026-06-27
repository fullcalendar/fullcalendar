import { afterSize } from '../../component-util/resize-observer'
import { BaseComponent } from '../../vdom-util'
import { DateMarker, DateRange } from '@full-ui/headless-calendar'
import { DateProfile } from '../../DateProfileGenerator'
import { DayTableCell, DayGridRange } from '../../common/DayTableModel'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { Hit } from '../../interactions/hit'
import { RefMap } from '../../util/RefMap'
import { Scroller } from '../../scrollgrid/Scroller'
import { ViewContainer } from '../../common/ViewContainer'
import { EventRangeProps } from '../../component-util/event-rendering'
import { joinClassNames } from '../../util/html'
import { generateClassName } from '../../content-inject/ContentContainer'
import { createRef } from 'react'
import { DayGridLayoutNormal } from './DayGridLayoutNormal'
import { DayGridLayoutPannable } from './DayGridLayoutPannable'
import { computeTopFromDate } from './util'
import { RowConfig } from '../header-tier'
import classNames from '../../styles.module.css'
import { computeViewBorderless } from '../../util/misc'

export interface DayGridLayoutProps {
  labelId: string | undefined
  labelStr: string | undefined

  dateProfile: DateProfile
  todayRange: DateRange
  cellRows: DayTableCell[][]
  forPrint: boolean
  isHitComboAllowed?: (hit0: Hit, hit1: Hit) => boolean
  className: string

  // header content
  headerTiers: RowConfig<any, { text: string, isDisabled: boolean }>[]

  // body content
  fgEventSegs: (DayGridRange & EventRangeProps)[]
  bgEventSegs: (DayGridRange & EventRangeProps)[]
  businessHourSegs: (DayGridRange & EventRangeProps)[]
  dateSelectionSegs: (DayGridRange & EventRangeProps)[]
  eventDrag: EventSegUiInteractionState<DayGridRange> | null
  eventResize: EventSegUiInteractionState<DayGridRange> | null
  eventSelection: string
}

export class DayGridLayout extends BaseComponent<DayGridLayoutProps> {
  // ref
  private scrollerRef = createRef<Scroller>()
  private rowHeightRefMap = new RefMap<string, number>(() => {
    afterSize(this.updateScrollY)
  })

  // internal
  private _isUnmounting: boolean
  private scrollDate: DateMarker | null = null

  render() {
    const { props, context } = this
    const { options } = context
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options)
    const businessHourSegs = props.forPrint ? [] : props.businessHourSegs
    const dateSelectionSegs = props.forPrint ? [] : props.dateSelectionSegs
    const eventDrag = props.forPrint ? null : props.eventDrag
    const eventResize = props.forPrint ? null : props.eventResize

    const commonLayoutProps = {
      ...props,
      businessHourSegs,
      dateSelectionSegs,
      eventDrag,
      eventResize,
      scrollerRef: this.scrollerRef,
      rowHeightRefMap: this.rowHeightRefMap,
    }

    return (
      <ViewContainer
        viewSpec={context.viewSpec}
        attrs={{
          role: 'grid',
          'aria-rowcount': props.headerTiers.length + props.cellRows.length,
          'aria-colcount': props.cellRows[0].length,
          'aria-labelledby': props.labelId,
          'aria-label': props.labelStr,
        }}
        className={joinClassNames(
          props.className,
          classNames.printRoot, // either flexCol or table
          generateClassName(options.tableClass, {
            borderlessX,
            borderlessTop,
            borderlessBottom,
            multiMonthColumns: 0,
          }),
        )}
      >
        {options.dayMinWidth ? (
          <DayGridLayoutPannable {...commonLayoutProps} dayMinWidth={options.dayMinWidth} />
        ) : (
          <DayGridLayoutNormal {...commonLayoutProps} />
        )}
      </ViewContainer>
    )
  }

  // Lifecycle
  // -----------------------------------------------------------------------------------------------

  componentDidMount() {
    this._isUnmounting = false
    this.resetScroll()
    this.scrollerRef.current.addScrollEndListener(this.handleScrollEnd)
  }

  componentDidUpdate(prevProps: DayGridLayoutProps) {
    if (prevProps.dateProfile !== this.props.dateProfile && this.context.options.scrollTimeReset) {
      this.resetScroll()
    }
  }

  componentWillUnmount() {
    this._isUnmounting = true
    this.scrollerRef.current.removeScrollEndListener(this.handleScrollEnd)
  }

  // Scrolling
  // -----------------------------------------------------------------------------------------------

  resetScroll() {
    this.scrollDate = this.props.dateProfile.currentDate
    this.updateScrollY()

    const scroller = this.scrollerRef.current
    scroller.scrollTo({ x: 0 })
  }

  updateScrollY = () => {
    if (this._isUnmounting) return
    const rowHeightMap = this.rowHeightRefMap.current
    const scroller = this.scrollerRef.current

    // Since updateScrollY is called by rowHeightRefMap, could be called with null during cleanup,
    // and the scroller might not exist
    if (scroller && this.scrollDate) {
      let scrollTop = computeTopFromDate(
        this.scrollDate,
        this.props.cellRows,
        rowHeightMap,
      )

      if (scrollTop != null) {
        if (scrollTop) {
          scrollTop++ // clear top border
        }
        scroller.scrollTo({ y: scrollTop })
      }
    }
  }

  handleScrollEnd = (isDevice: boolean) => {
    if (isDevice) {
      this.scrollDate = null
    }
  }
}
