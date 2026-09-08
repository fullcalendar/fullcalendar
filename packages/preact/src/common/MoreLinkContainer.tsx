import { EventImpl } from '../api/EventImpl'
import { DateRange, addDays, DateMarker } from '@full-ui/headless-calendar'
import { DateProfile } from '../DateProfileGenerator'
import { Dictionary } from '../options'

import { formatWithOrdinals } from '../util/misc'
import { type ReactNode, type RefObject } from 'react'
import { joinClassNames } from '../util/html'
import { BaseComponent, setRef } from '../vdom-util'
import { ViewApi } from '../api/ViewApi'
import { ViewContext } from '../ViewContext'
import { MorePopover } from './MorePopover'
import { ContentContainer, generateClassName } from '../content-inject/ContentContainer'
import { ElAttrsProps } from '../content-inject/ContentInjector'
import { createAriaClickAttrs } from '../util/dom-event'
import { EventRangeProps } from '../component-util/event-rendering'
import { computeEarliestStart, computeLatestEnd, SlicedCoordRange } from '../coord-range'
import { buildRangeEdgeOutput } from '../structs/event-instance'
import classNames from '../styles.module.css'

/*
TODO: simplify this interface. don't need all el attrs
*/
export interface MoreLinkContainerProps extends Partial<ElAttrsProps> {
  dateProfile: DateProfile
  todayRange: DateRange
  allDayDate: DateMarker | null
  segs: EventRangeProps[]
  hiddenSegs: EventRangeProps[]
  dateSpanProps?: Dictionary
  alignElRef?: RefObject<HTMLElement> // will use click-target if unspecified
  alignParentTop?: string // for popover
  forceTimed?: boolean // for popover
  popoverContent: () => ReactNode
  isNarrow: boolean
  isMicro: boolean
  display: 'row' | 'column'
}

export interface MoreLinkInfo {
  num: number
  numericText: string
  longText: string
  text: string
  isNarrow: boolean
  view: ViewApi
}

export interface MoreLinkTriggerProps extends Partial<ElAttrsProps> {
  num: number
  isNarrow: boolean
  isMicro: boolean
  display: 'row' | 'column'
  didMount?: (renderProps: MoreLinkInfo & { el: HTMLElement }) => void
  willUnmount?: (renderProps: MoreLinkInfo & { el: HTMLElement }) => void
}

interface MoreLinkContainerState {
  isPopoverOpen: boolean
}

/*
Renders only the themed, customizable more-link presentation. Interaction,
popover state, and date-range semantics belong to MoreLinkContainer.
*/
export class MoreLinkTrigger extends BaseComponent<MoreLinkTriggerProps> {
  render() {
    const { props, context } = this
    const { options } = context
    const renderProps = buildMoreLinkRenderProps(
      props.num,
      props.isNarrow,
      props.isMicro,
      props.display,
      context,
    )

    return (
      <ContentContainer
        tag='div'
        elRef={props.elRef}
        className={joinClassNames(
          generateClassName(
            props.display === 'row'
              ? options.rowMoreLinkClass
              : options.columnMoreLinkClass,
            renderProps,
          ),
          props.className,
          props.display === 'row'
            ? classNames.flexRow
            : classNames.flexCol,
          classNames.internalMoreLink,
          classNames.cursorPointer,
        )}
        style={props.style}
        attrs={props.attrs}
        renderProps={renderProps}
        generatorName="moreLinkContent"
        customGenerator={options.moreLinkContent}
        defaultGenerator={renderMoreLinkText}
        classNameGenerator={options.moreLinkClass}
        didMount={props.didMount}
        willUnmount={props.willUnmount}
      >
        {(InnerContent) => (
          <InnerContent
            tag='div'
            className={joinClassNames(
              generateClassName(options.moreLinkInnerClass, renderProps),
              generateClassName(
                props.display === 'row'
                  ? options.rowMoreLinkInnerClass
                  : options.columnMoreLinkInnerClass,
                renderProps,
              ),
              props.display === 'row'
                ? classNames.stickyS
                : classNames.stickyT,
            )}
          />
        )}
      </ContentContainer>
    )
  }
}

export class MoreLinkContainer extends BaseComponent<MoreLinkContainerProps, MoreLinkContainerState> {
  private linkEl: HTMLElement

  state = {
    isPopoverOpen: false,
  }

  render() {
    const { props, state, context } = this
    const { options, baseId } = context
    const moreCnt = props.hiddenSegs.length
    const range = computeRange(props)
    const popoverId = baseId + 'popover-' + range.start.toISOString()
    const renderProps = buildMoreLinkRenderProps(
      moreCnt,
      props.isNarrow,
      props.isMicro,
      props.display,
      context,
    )
    const hint = formatWithOrdinals(options.moreLinkHint, [moreCnt], renderProps.longText)

    return (
      <>
        {Boolean(moreCnt) && (
          <MoreLinkTrigger
            num={moreCnt}
            display={props.display}
            isNarrow={props.isNarrow}
            isMicro={props.isMicro}
            elRef={this.handleLinkEl}
            className={props.className}
            style={props.style}
            attrs={{
              ...props.attrs,
              ...createAriaClickAttrs(this.handleClick),
              title: hint,
              'role': 'button',
              'aria-haspopup': 'dialog',
              'aria-expanded': state.isPopoverOpen,
              'aria-controls': state.isPopoverOpen ? popoverId : undefined,
            }}
            didMount={options.moreLinkDidMount}
            willUnmount={options.moreLinkWillUnmount}
          />
        )}
        {state.isPopoverOpen && (
          <MorePopover
            id={popoverId}
            titleId={popoverId + '-title'}
            startDate={range.start}
            endDate={range.end}
            dateProfile={props.dateProfile}
            todayRange={props.todayRange}
            dateSpanProps={props.dateSpanProps}
            alignEl={props.alignElRef ? props.alignElRef.current : this.linkEl}
            alignParentTop={props.alignParentTop}
            forceTimed={props.forceTimed}
            onClose={this.handlePopoverClose}
            children={props.popoverContent()}
          />
        )}
      </>
    )
  }

  handleLinkEl = (linkEl: HTMLElement | null) => {
    this.linkEl = linkEl

    if (this.props.elRef) {
      setRef(this.props.elRef, linkEl)
    }
  }

  handleClick = (ev: MouseEvent) => {
    let { props, context } = this
    let { dateEnv, options } = context
    let { moreLinkClick } = options
    let date = computeRange(props).start

    function buildPublicSeg(seg: SlicedCoordRange & EventRangeProps) {
      let { def, instance, range } = seg.eventRange
      const start = buildRangeEdgeOutput(range.start, range.instantStartMs, dateEnv)
      const end = buildRangeEdgeOutput(range.end, range.instantEndMs, dateEnv)

      return {
        event: new EventImpl(context, def, instance),
        start: start.date,
        end: end.date,
        isStart: seg.isStart,
        isEnd: seg.isEnd,
      }
    }

    if (typeof moreLinkClick === 'function') {
      moreLinkClick = moreLinkClick({
        date: dateEnv.toDate(date),
        allDay: Boolean(props.allDayDate),
        allSegs: props.segs.map(buildPublicSeg),
        hiddenSegs: props.hiddenSegs.map(buildPublicSeg),
        jsEvent: ev,
        view: context.viewApi,
      }) as string | undefined
    }

    if (!moreLinkClick || moreLinkClick === 'popover') {
      this.setState({ isPopoverOpen: true })
    } else if (typeof moreLinkClick === 'string') { // a view name
      context.calendarApi.zoomTo(date, moreLinkClick)
    }
  }

  handlePopoverClose = () => {
    if (this.linkEl) { // was null sometimes when initiating drag-n-drop would hide the popover
      this.linkEl.focus()
    }
    this.setState({ isPopoverOpen: false })
  }
}

function renderMoreLinkText(props: MoreLinkInfo) {
  return props.text
}

function buildMoreLinkRenderProps(
  num: number,
  isNarrow: boolean,
  isMicro: boolean,
  display: 'row' | 'column',
  context: ViewContext,
): MoreLinkInfo {
  const { viewApi, options, calendarApi } = context
  const numericText = `+${num}` // TODO: offer hook or i18n?
  const longText = typeof options.moreLinkText === 'function' // TODO: eventually use formatWithOrdinals
    ? options.moreLinkText.call(calendarApi, num)
    : `${numericText} ${options.moreLinkText}`

  return {
    num,
    numericText,
    longText,
    text: (isMicro || display === 'column') ? numericText : longText,
    isNarrow,
    view: viewApi,
  }
}

function computeRange(props: MoreLinkContainerProps): DateRange {
  if (props.allDayDate) {
    return {
      start: props.allDayDate,
      end: addDays(props.allDayDate, 1),
    }
  }
  return {
    start: computeEarliestStart(props.hiddenSegs),
    end: computeLatestEnd(props.hiddenSegs),
  }
}
