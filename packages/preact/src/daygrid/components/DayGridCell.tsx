import { ViewApi } from '../../api/ViewApi'
import { DayCellInfo } from '../../render-hook-misc'
import { joinClassNames } from '../../util/html'
import { DateMarker, DateRange, DateEnv, addMs, DateFormatter, formatDayString } from '@full-ui/headless-calendar'
import { joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { DateComponent, EventSegUiInteractionState } from '../../component/DateComponent'
import { DateProfile } from '../../DateProfileGenerator'
import { Dictionary } from '../../options'
import { setRef } from '../../vdom-util'
import { SlicedCoordRange } from '../../coord-range'
import { watchSize } from '../../component-util/resize-observer'
import { isDimsEqual } from '../../component-util/rendering-misc'
import { getDateMeta, DateMeta } from '../../component-util/date-rendering'
import { buildDateStr, buildNavLinkAttrs } from '../../common/nav-link'
import { memoize, memoizeObjArg } from '../../util/memoize'
import { ContentContainer, generateClassName } from '../../content-inject/ContentContainer'
import { findDayNumberText, findMonthText, findWeekdayText } from '../../util/date-format'
import classNames from '../../styles.module.css'
import {
  type Ref,
  type ReactNode,
  createRef,
} from 'react'
import { DayGridMoreLink } from './DayGridMoreLink'
import { DayRowEventRange, DayRowEventRangePart } from '../TableSeg'

export interface DayGridCellProps {
  dateProfile: DateProfile
  todayRange: DateRange
  date: DateMarker
  isMajor: boolean
  showDayNumber: boolean
  isNarrow: boolean
  isMicro: boolean
  borderStart: boolean

  // content
  segs: DayRowEventRangePart[] // for +more link popover content
  hiddenSegs: DayRowEventRange[] // "
  fgLiquidHeight: boolean
  fg: ReactNode
  eventDrag: EventSegUiInteractionState<SlicedCoordRange> | null
  eventResize: EventSegUiInteractionState<SlicedCoordRange> | null
  eventSelection: string

  // render hooks
  renderProps?: Dictionary
  dateSpanProps?: Dictionary
  attrs?: Dictionary
  className?: string

  // dimensions
  fgHeight: number | undefined
  width?: number | string

  // refs
  headerHeightRef?: Ref<number>
  mainHeightRef?: Ref<number> // will only fire if fgLiquidHeight
}

export class DayGridCell extends DateComponent<DayGridCellProps> {
  // memo
  private getDateMeta = memoize(getDateMeta)
  private refineRenderProps = memoizeObjArg(refineRenderProps)

  // ref
  private rootElRef = createRef<HTMLElement>()

  // internal
  private headerHeight?: number
  private disconnectBodyHeight?: () => void
  private _isUnmounting: boolean

  render() {
    let { props, context } = this
    let { options, dateEnv } = context

    // TODO: memoize this
    const isMonthStart = props.showDayNumber &&
      shouldDisplayMonthStart(props.date, props.dateProfile.currentRange, dateEnv)

    const dateMeta = this.getDateMeta(props.date, dateEnv, props.dateProfile, props.todayRange)

    const baseClassName = joinClassNames(
      props.borderStart ? classNames.borderOnlyS : classNames.borderNone,
      props.width != null ? '' : classNames.liquid,
      classNames.flexCol,
      classNames.noMargin,
      classNames.noPadding,
    )

    const hasNavLink = options.navLinks
    const renderProps = this.refineRenderProps({
      date: props.date,
      isMajor: props.isMajor,
      isNarrow: props.isNarrow,
      dateMeta: dateMeta,
      hasLabel: props.showDayNumber,
      hasMonthLabel: isMonthStart,
      hasNavLink,
      renderProps: props.renderProps,
      viewApi: context.viewApi,
      dateEnv: context.dateEnv,
      monthStartFormat: options.monthStartFormat,
      dayCellFormat: options.dayCellFormat,
      businessHours: Boolean(options.businessHours),
    })

    if (dateMeta.isDisabled) {
      return (
        <div
          role='gridcell'
          aria-disabled
          className={joinClassNames(
            generateClassName(options.dayCellClass, renderProps),
            props.className,
            baseClassName,
          )}
          style={{
            width: props.width
          }}
        />
      )
    }

    const fullDateStr = buildDateStr(context, props.date)

    return (
      <ContentContainer
        tag="div"
        elRef={this.rootElRef}
        className={joinClassNames(props.className, baseClassName)}
        attrs={{
          ...props.attrs,
          role: 'gridcell',
          'aria-label': fullDateStr,
          ...(renderProps.isToday ? { 'aria-current': 'date' } : {}),
          'data-date': formatDayString(props.date),
        }}
        style={{
          width: props.width,
        }}
        renderProps={renderProps}
        generatorName="dayCellTopContent" // !!! for top
        customGenerator={options.dayCellTopContent /* !!! for top */}
        defaultGenerator={renderTopInner}
        classNameGenerator={options.dayCellClass}
        didMount={options.dayCellDidMount}
        willUnmount={options.dayCellWillUnmount}
      >
        {(InnerContent) => (
          <>
            <div
              className={joinClassNames(
                classNames.rel, // puts it above bg-fills, which are positioned on TOP of this component :|
                generateClassName(options.dayCellTopClass, renderProps),
              )}
              // TODO: prevent margins!? for measurements
            >
              {props.showDayNumber && (
                <InnerContent // the dayCellTopContent
                  tag='div'
                  attrs={
                    hasNavLink
                      ? buildNavLinkAttrs(context, props.date, undefined, fullDateStr)
                      : { 'aria-hidden': true } // label already on cell
                  }
                  className={generateClassName(options.dayCellTopInnerClass, renderProps)}
                />
              )}
            </div>
            <div
              className={joinClassNames(
                classNames.flexCol,
                props.fgLiquidHeight ? classNames.liquid : classNames.grow,
              )}
              ref={this.handleBodyEl}
            >
              <div
                className={generateClassName(options.dayCellInnerClass, renderProps)}
                style={{ minHeight: props.fgHeight }}
                // TODO: prevent margins/padding!?
              >
                {props.fg}
              </div>
              <DayGridMoreLink
                className={classNames.rel} // puts it above bg-fills, which are positioned on TOP of this component :|
                allDayDate={props.date}
                segs={props.segs}
                hiddenSegs={props.hiddenSegs}
                alignElRef={this.rootElRef}
                alignParentTop={
                  props.showDayNumber
                    ? '[role=row]'
                    : `.${classNames.internalView}`
                }
                dateSpanProps={props.dateSpanProps}
                dateProfile={props.dateProfile}
                eventSelection={props.eventSelection}
                eventDrag={props.eventDrag}
                eventResize={props.eventResize}
                todayRange={props.todayRange}
                isNarrow={props.isNarrow}
                isMicro={props.isMicro}
              />
            </div>
            <div
              className={joinClassNames(
                classNames.rel, // puts it above bg-fills
                generateClassName(options.dayCellBottomClass, renderProps),
              )}
            />
          </>
        )}
      </ContentContainer>
    )
  }

  handleBodyEl = (bodyEl: HTMLElement | null) => {
    if (this.disconnectBodyHeight) {
      this.disconnectBodyHeight()
      this.disconnectBodyHeight = undefined
      setRef(this.props.headerHeightRef, null)
      setRef(this.props.mainHeightRef, null)
    }

    if (bodyEl) {
      // we want to fire on ANY size change, because we do more advanced stuff
      this.disconnectBodyHeight = watchSize(bodyEl, (_bodyWidth, bodyHeight) => {
        if (this._isUnmounting) return
        const { props } = this
        const mainRect = bodyEl.getBoundingClientRect()
        const rootRect = this.rootElRef.current.getBoundingClientRect()
        const headerHeight = mainRect.top - rootRect.top

        if (!isDimsEqual(this.headerHeight, headerHeight)) {
          this.headerHeight = headerHeight
          setRef(props.headerHeightRef, headerHeight)
        }

        if (props.fgLiquidHeight) {
          setRef(props.mainHeightRef, bodyHeight)
        }
      })
    }
  }

  componentDidMount(): void {
    this._isUnmounting = false
  }

  componentWillUnmount(): void {
    this._isUnmounting = true
  }
}

// Utils
// -------------------------------------------------------------------------------------------------

function renderTopInner(props: DayCellInfo): ReactNode {
  return props.text || <>&nbsp;</> // TODO: DRY?
}

function shouldDisplayMonthStart(date: DateMarker, currentRange: DateRange, dateEnv: DateEnv): boolean {
  const { start: currentStart, end: currentEnd } = currentRange
  const currentEndIncl = addMs(currentEnd, -1)
  const currentFirstYear = dateEnv.getYear(currentStart)
  const currentFirstMonth = dateEnv.getMonth(currentStart)
  const currentLastYear = dateEnv.getYear(currentEndIncl)
  const currentLastMonth = dateEnv.getMonth(currentEndIncl)

  // spans more than one month?
  return !(currentFirstYear === currentLastYear && currentFirstMonth === currentLastMonth) &&
    Boolean(
      // first date in current view?
      date.valueOf() === currentStart.valueOf() ||
      // a month-start that's within the current range?
      (dateEnv.getDay(date) === 1 && date.valueOf() < currentEnd.valueOf()),
    )
}

interface DayCellRenderPropsInput {
  date: DateMarker // generic
  isMajor: boolean
  isNarrow: boolean
  dateMeta: DateMeta
  dateEnv: DateEnv
  viewApi: ViewApi
  dayCellFormat: DateFormatter
  monthStartFormat: DateFormatter
  hasLabel: boolean
  hasMonthLabel: boolean
  hasNavLink: boolean
  businessHours: boolean
  renderProps?: Dictionary // so can include a resource
}

function refineRenderProps(raw: DayCellRenderPropsInput): DayCellInfo {
  let { date, dateEnv, hasLabel, hasMonthLabel, hasNavLink, businessHours } = raw
  let textParts = []
  let text = ''

  if (hasLabel) {
    textParts = dateEnv.formatToParts(date, hasMonthLabel ? raw.monthStartFormat : raw.dayCellFormat)
    text = joinDateTimeFormatParts(textParts)
  }

  return {
    ...raw.dateMeta,
    ...raw.renderProps,
    text,
    textParts,
    isMajor: raw.isMajor,
    isNarrow: raw.isNarrow,
    inPopover: false,
    hasNavLink,
    get weekdayText() { return findWeekdayText(textParts) },
    get dayNumberText() { return findDayNumberText(textParts) },
    get monthText() { return findMonthText(textParts) },
    options: { businessHours },
    view: raw.viewApi,
  }
}
