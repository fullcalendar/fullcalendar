import { EventImpl } from '../api/EventImpl'
import { DateRange, addDays, DateMarker } from '@full-ui/headless-calendar'
import { DateProfile } from '../DateProfileGenerator'
import { Dictionary } from '../options'

import { formatWithOrdinals } from '../util/misc'
import { type ReactNode, type RefObject } from 'react'
import { joinClassNames } from '../util/html'
import { BaseComponent, setRef } from '../vdom-util'
import { ViewApi } from '../api/ViewApi'
import { ViewContextType } from '../ViewContext'
import { MorePopover } from './MorePopover'
import { ContentContainer, generateClassName } from '../content-inject/ContentContainer'
import { ElAttrsProps } from '../content-inject/ContentInjector'
import { createAriaClickAttrs } from '../util/dom-event'
import { EventRangeProps } from '../component-util/event-rendering'
import { computeEarliestStart, computeLatestEnd, SlicedCoordRange } from '../coord-range'
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

interface MoreLinkContainerState {
  isPopoverOpen: boolean
}

/*
IMPORTANT: caller is responsible for injecting moreLinkInnerClass,
either on root `classNames` or within inner element
*/
export class MoreLinkContainer extends BaseComponent<MoreLinkContainerProps, MoreLinkContainerState> {
  private linkEl: HTMLElement

  state = {
    isPopoverOpen: false,
  }

  render() {
    let { props, state } = this
    return (
      <ViewContextType.Consumer
        children={(context) => {
          let { viewApi, options, calendarApi, baseId } = context
          let { moreLinkText } = options
          let moreCnt = props.hiddenSegs.length
          let range = computeRange(props)
          let popoverId = baseId + 'popover-' + range.start.toISOString()

          let numericText = `+${moreCnt}` // TODO: offer hook or i18n?
          let longText = typeof moreLinkText === 'function' // TODO: eventually use formatWithOrdinals
            ? moreLinkText.call(calendarApi, moreCnt)
            : `${numericText} ${moreLinkText}`
          let hint = formatWithOrdinals(options.moreLinkHint, [moreCnt], longText)

          let renderProps: MoreLinkInfo = {
            num: moreCnt,
            numericText,
            longText,
            text: (props.isMicro || props.display === 'column') ? numericText : longText,
            isNarrow: props.isNarrow,
            view: viewApi,
          }

          return (
            <>
              {Boolean(moreCnt) && (
                <ContentContainer
                  tag='div'
                  elRef={this.handleLinkEl}
                  className={joinClassNames(
                    generateClassName( // will added to moreLinkClass
                      props.display === 'row'
                        ? options.rowMoreLinkClass // row
                        : options.columnMoreLinkClass, // column
                      renderProps
                    ),
                    props.className,
                    props.display === 'row'
                      ? classNames.flexRow
                      : classNames.flexCol,
                    classNames.internalMoreLink,
                    classNames.cursorPointer,
                  )}
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
                  renderProps={renderProps}
                  generatorName="moreLinkContent"
                  customGenerator={options.moreLinkContent}
                  defaultGenerator={renderMoreLinkText}
                  classNameGenerator={options.moreLinkClass}
                  didMount={options.moreLinkDidMount}
                  willUnmount={options.moreLinkWillUnmount}
                >
                  {(InnerContent) => (
                    <InnerContent
                      tag='div'
                      className={joinClassNames(
                        generateClassName(options.moreLinkInnerClass, renderProps),
                        generateClassName(
                          props.display === 'row'
                            ? options.rowMoreLinkInnerClass // row
                            : options.columnMoreLinkInnerClass, // column
                          renderProps
                        ),
                        props.display === 'row'
                          ? classNames.stickyS
                          : classNames.stickyT,
                      )}
                    />
                  )}
                </ContentContainer>
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
                  alignEl={
                    props.alignElRef ?
                      props.alignElRef.current :
                      this.linkEl
                  }
                  alignParentTop={props.alignParentTop}
                  forceTimed={props.forceTimed}
                  onClose={this.handlePopoverClose}
                  children={props.popoverContent()}
                />
              )}
            </>
          )
        }}
      />
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
      return {
        event: new EventImpl(context, def, instance),
        start: dateEnv.toDate(range.start),
        end: dateEnv.toDate(range.end),
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
