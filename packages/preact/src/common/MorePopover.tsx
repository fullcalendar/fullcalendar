import { DateComponent } from '../component/DateComponent'
import { DateRange, DateMarker, formatDayString, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { DateProfile } from '../DateProfileGenerator'
import { Hit } from '../interactions/hit'
import { Dictionary } from '../options'
import { type ReactNode, createRef } from 'react'
import { createPortal } from 'react-dom'
import { getDateMeta } from '../component-util/date-rendering'
import { memoize } from '../util/memoize'
import { generateClassName } from '../content-inject/ContentContainer'
import { ContentContainer } from '../content-inject/ContentContainer'
import { DayCellInfo, DayHeaderInfo } from '../api/structs'
import classNames from '../styles.module.css'
import { joinClassNames } from '../util/html'
import { applyStyle, computeElIsRtl, getAppendableRoot, getEventTargetViaRoot } from '../util/dom-manip'
import { createAriaClickAttrs } from '../util/dom-event'
import { computeClippedClientRect } from '../util/dom-geom'
import { findDayNumberText, findMonthText, findWeekdayText } from '../util/date-format'

export interface MorePopoverProps {
  id: string
  titleId: string
  startDate: DateMarker
  endDate: DateMarker
  dateProfile: DateProfile
  alignEl: HTMLElement
  alignParentTop?: string
  forceTimed?: boolean
  todayRange: DateRange
  dateSpanProps: Dictionary
  children: ReactNode
  onClose?: () => void
}

const SPACE_FROM_VIEWPORT = 10
const ROW_BORDER_WIDTH = 1

export class MorePopover extends DateComponent<MorePopoverProps> {
  // memo
  private getDateMeta = memoize(getDateMeta)

  // ref
  private rootEl: HTMLElement
  private closeRef = createRef<HTMLDivElement>()
  private focusStartRef = createRef<HTMLDivElement>()
  private focusEndRef = createRef<HTMLDivElement>()

  render() {
    let { props, context } = this
    let { options, dateEnv, viewApi } = context
    let { startDate, todayRange, dateProfile } = props
    let dateMeta = this.getDateMeta(startDate, dateEnv, dateProfile, todayRange)
    let textParts = dateEnv.formatToParts(startDate, options.popoverFormat)
    let text = joinDateTimeFormatParts(textParts)

    const dayHeaderRenderProps: DayHeaderInfo = {
      ...dateMeta,
      isMajor: false,
      isNarrow: false,
      isSticky: false,
      inPopover: true,
      level: 0,
      hasNavLink: false,
      text,
      textParts,
      get weekdayText() { return findWeekdayText(textParts) },
      get dayNumberText() { return findDayNumberText(textParts) },
      view: viewApi,
      // TODO: should know about the resource!
    }
    const dayCellRenderProps: DayCellInfo = {
      ...dateMeta,
      isMajor: false,
      isNarrow: false,
      inPopover: true,
      hasNavLink: false,
      get weekdayText() { return findWeekdayText(textParts) },
      get dayNumberText() { return findDayNumberText(textParts) },
      get monthText() { return findMonthText(textParts) },
      view: viewApi,
      text: '',
      textParts: [],
      options: { businessHours: Boolean(options.businessHours) },
    }

    const fullDateStr = formatDayString(startDate)

    /*
    TODO: DRY with TimelineHeaderCell
    */
    const { dayHeaderAlign } = options
    const align =
      typeof dayHeaderAlign === 'function'
        ? dayHeaderAlign({ level: 0, inPopover: true, isNarrow: false })
        : dayHeaderAlign

    const isRtl = computeElIsRtl(props.alignEl)

    return createPortal(
      <div
        data-date={fullDateStr}
        id={props.id}
        role='dialog'
        aria-labelledby={props.titleId}
        className={joinClassNames(
          options.popoverClass,
          classNames.flexCol,
          classNames.popoverZ,
          classNames.abs,
          classNames.borderBoxRoot,
          classNames.internalPopover,
        )}
        style={{
          // positioning is mutated directly in updateSize, HOWEVER, we don't want popover to start
          // low on screen because might cause unnecessary scrollbars
          top: 0,
          left: 0,
        }}
        // HACK because of portal
        dir={isRtl ? 'rtl' : undefined}
        data-color-scheme={options.colorScheme || undefined}
        ref={this.handleRootEl}
      >
        <div
          tabIndex={0}
          style={{ outline: 'none' }} // TODO: className?
          ref={this.focusStartRef}
        />
        <div
          className={joinClassNames(
            generateClassName(options.dayHeaderClass, dayHeaderRenderProps),
            classNames.flexCol,
            classNames.borderOnlyB,
            align === 'center' ? classNames.alignCenter :
              align === 'end' ? classNames.alignEnd :
                classNames.alignStart,
          )}
        >
          <div>{/* be similar to DayGridHeaderCell */}
            <ContentContainer
              tag="div"
              attrs={{
                id: props.titleId,
                // NOTE: more-popover never has nav-links
              }}
              generatorName="dayHeaderContent"
              renderProps={dayHeaderRenderProps}
              customGenerator={options.dayHeaderContent}
              defaultGenerator={renderText}
              classNameGenerator={options.dayHeaderInnerClass}
              didMount={options.dayHeaderDidMount}
              willUnmount={options.dayHeaderWillUnmount}
            />
          </div>
          <ContentContainer
            tag='button'
            attrs={{
              'aria-label': options.closeHint,
              ...createAriaClickAttrs(this.handleClose)
            }}
            elRef={this.closeRef}
            className={joinClassNames(
              options.popoverCloseClass,
              classNames.flexRow,
              classNames.cursorPointer,
            )}
            renderProps={{}}
            customGenerator={options.popoverCloseContent}
            generatorName='popoverCloseContent'
          />
        </div>
        <div
          className={joinClassNames(
            generateClassName(options.dayCellClass, dayCellRenderProps),
            classNames.flexCol,
            classNames.borderNone,
          )}
        >
          <div className={generateClassName(options.dayCellInnerClass, dayCellRenderProps)}>
            {props.children}
          </div>
        </div>
        <div
          tabIndex={0}
          style={{ outline: 'none' }} // TODO: className?
          ref={this.focusEndRef}
        />
      </div>,
      getAppendableRoot(props.alignEl) as HTMLElement,
    )
  }

  handleRootEl = (rootEl: HTMLElement | null) => {
    this.rootEl = rootEl

    if (rootEl) {
      this.context.registerInteractiveComponent(this, {
        el: rootEl,
        useEventCenter: false,
      })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }

  queryHit(isRtl: boolean, positionLeft: number, positionTop: number, elWidth: number, elHeight: number): Hit {
    let { rootEl, props } = this

    if (
      positionLeft >= 0 && positionLeft < elWidth &&
      positionTop >= 0 && positionTop < elHeight
    ) {
      return {
        dateProfile: props.dateProfile,
        dateSpan: {
          allDay: !props.forceTimed,
          range: {
            start: props.startDate,
            end: props.endDate,
          },
          ...props.dateSpanProps,
        },
        getDayEl: () => rootEl,
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

  componentDidMount() {
    document.addEventListener('mousedown', this.handleDocumentMouseDown)
    document.addEventListener('keydown', this.handleDocumentKeyDown)

    this.focusStartRef.current.addEventListener('focus', this.handleClose)
    this.focusEndRef.current.addEventListener('focus', this.handleClose)
    this.closeRef.current.focus({ preventScroll: true })

    this.updateSize()
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleDocumentMouseDown)
    document.removeEventListener('keydown', this.handleDocumentKeyDown)

    this.focusStartRef.current.removeEventListener('focus', this.handleClose)
    this.focusEndRef.current.removeEventListener('focus', this.handleClose)
  }

  // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
  handleDocumentMouseDown = (ev) => {
    // only hide the popover if the click happened outside the popover
    const target = getEventTargetViaRoot(ev) as HTMLElement
    if (!this.rootEl.contains(target)) {
      this.handleClose()
    }
  }

  handleDocumentKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape') {
      this.handleClose()
    }
  }

  // for many different close techniques
  // cannot accept params because might receive a browser Event
  handleClose = () => {
    let { onClose } = this.props
    if (onClose) {
      onClose()
    }
  }

  private updateSize() {
    let { alignEl, alignParentTop } = this.props
    let { rootEl: popoverEl } = this

    const isRtl = computeElIsRtl(alignEl)

    // position relative to viewport
    const alignmentRect = computeClippedClientRect(alignEl)

    if (alignmentRect) {
      let popoverDims = popoverEl.getBoundingClientRect()

      // position relative to viewport
      let popoverVPTop = alignParentTop
        // HACK: subtract 1 for DayGrid, which has borders on row-bottom. Only view that uses alignParentTop
        ? alignEl.closest(alignParentTop).getBoundingClientRect().top - ROW_BORDER_WIDTH
        : alignmentRect.top
      let popoverVPLeft = isRtl ? alignmentRect.right - popoverDims.width : alignmentRect.left

      // constrain
      popoverVPTop = Math.max(popoverVPTop, SPACE_FROM_VIEWPORT)
      popoverVPLeft = Math.min(popoverVPLeft, document.documentElement.clientWidth - SPACE_FROM_VIEWPORT - popoverDims.width)
      popoverVPLeft = Math.max(popoverVPLeft, SPACE_FROM_VIEWPORT)

      const { offsetParent } = popoverEl

      // final popover position, relative to offsetParent
      let top: number
      let left: number

      // TODO: account for RTL
      if (!offsetParent || offsetParent === document.body) {
        top = popoverVPTop + window.scrollY
        left = popoverVPLeft + window.scrollX
      } else {
        const offsetParentRect = offsetParent.getBoundingClientRect()
        top = popoverVPTop - offsetParentRect.top + offsetParent.scrollTop
        left = popoverVPLeft - offsetParentRect.left + offsetParent.scrollLeft
      }

      applyStyle(popoverEl, { top, left })
    }
  }
}

// TODO: DRY
function renderText(renderProps: DayHeaderInfo): ReactNode {
  return renderProps.text
}
