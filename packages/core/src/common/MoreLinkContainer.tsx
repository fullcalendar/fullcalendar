import { EventImpl } from '../api/EventImpl.js'
import { Seg } from '../component/DateComponent.js'
import { DateRange } from '../datelib/date-range.js'
import { addDays, DateMarker } from '../datelib/marker.js'
import { DateProfile } from '../DateProfileGenerator.js'
import { Dictionary } from '../options.js'
import { elementClosest, getUniqueDomId } from '../util/dom-manip.js'
import { formatWithOrdinals } from '../util/misc.js'
import { createElement, Fragment, ComponentChild, RefObject } from '../preact.js'
import { BaseComponent, setRef } from '../vdom-util.js'
import { ViewApi } from '../api/ViewApi.js'
import { ViewContext, ViewContextType } from '../ViewContext.js'
import { MorePopover } from './MorePopover.js'
import { MountArg } from './render-hook.js'
import { ContentContainer, InnerContainerFunc } from '../content-inject/ContentContainer.js'
import { ElProps } from '../content-inject/ContentInjector.js'
import { createAriaClickAttrs } from '../util/dom-event.js'

export interface MoreLinkContainerProps extends Partial<ElProps> {
  dateProfile: DateProfile
  todayRange: DateRange
  allDayDate: DateMarker | null
  moreCnt: number // can't always derive from hiddenSegs. some hiddenSegs might be due to lack of dimensions
  allSegs: Seg[]
  hiddenSegs: Seg[]
  extraDateSpan?: Dictionary
  alignmentElRef?: RefObject<HTMLElement> // will use internal <a> if unspecified
  alignGridTop?: boolean // for popover
  forceTimed?: boolean // for popover
  popoverContent: () => ComponentChild
  defaultGenerator?: (renderProps: MoreLinkContentArg) => ComponentChild
  children?: InnerContainerFunc<MoreLinkContentArg>
}

export interface MoreLinkContentArg {
  num: number
  text: string
  shortText: string
  view: ViewApi
}

export type MoreLinkMountArg = MountArg<MoreLinkContentArg>

interface MoreLinkContainerState {
  isPopoverOpen: boolean
  popoverId: string
}

export class MoreLinkContainer extends BaseComponent<MoreLinkContainerProps, MoreLinkContainerState> {
  private linkEl: HTMLElement
  private parentEl: HTMLElement

  state = {
    isPopoverOpen: false,
    popoverId: getUniqueDomId(),
  }

  render() {
    let { props, state } = this
    return (
      <ViewContextType.Consumer>
        {(context: ViewContext) => {
          let { viewApi, options, calendarApi } = context
          let { moreLinkText } = options
          let { moreCnt } = props
          let range = computeRange(props)

          let text = typeof moreLinkText === 'function' // TODO: eventually use formatWithOrdinals
            ? moreLinkText.call(calendarApi, moreCnt)
            : `+${moreCnt} ${moreLinkText}`
          let hint = formatWithOrdinals(options.moreLinkHint, [moreCnt], text)

          let renderProps: MoreLinkContentArg = {
            num: moreCnt,
            shortText: `+${moreCnt}`, // TODO: offer hook or i18n?
            text,
            view: viewApi,
          }

          return (
            <Fragment>
              {Boolean(props.moreCnt) && (
                <ContentContainer
                  elTag={props.elTag || 'a'}
                  elRef={this.handleLinkEl}
                  elClasses={[
                    ...(props.elClasses || []),
                    'fc-more-link',
                  ]}
                  elStyle={props.elStyle}
                  elAttrs={{
                    ...props.elAttrs,
                    ...createAriaClickAttrs(this.handleClick),
                    title: hint,
                    'aria-expanded': state.isPopoverOpen,
                    'aria-controls': state.isPopoverOpen ? state.popoverId : '',
                  }}
                  renderProps={renderProps}
                  generatorName="moreLinkContent"
                  customGenerator={options.moreLinkContent}
                  defaultGenerator={props.defaultGenerator || renderMoreLinkInner}
                  classNameGenerator={options.moreLinkClassNames}
                  didMount={options.moreLinkDidMount}
                  willUnmount={options.moreLinkWillUnmount}
                >{props.children}</ContentContainer>
              )}
              {state.isPopoverOpen && (
                <MorePopover
                  id={state.popoverId}
                  startDate={range.start}
                  endDate={range.end}
                  dateProfile={props.dateProfile}
                  todayRange={props.todayRange}
                  extraDateSpan={props.extraDateSpan}
                  parentEl={this.parentEl}
                  alignmentEl={
                    props.alignmentElRef ?
                      props.alignmentElRef.current :
                      this.linkEl
                  }
                  alignGridTop={props.alignGridTop}
                  forceTimed={props.forceTimed}
                  onClose={this.handlePopoverClose}
                >
                  {props.popoverContent()}
                </MorePopover>
              )}
            </Fragment>
          )
        }}
      </ViewContextType.Consumer>
    )
  }

  componentDidMount() {
    this.updateParentEl()
  }

  componentDidUpdate() {
    this.updateParentEl()
  }

  handleLinkEl = (linkEl: HTMLElement | null) => {
    this.linkEl = linkEl

    if (this.props.elRef) {
      setRef(this.props.elRef, linkEl)
    }
  }

  updateParentEl() {
    if (this.linkEl) {
      this.parentEl = elementClosest(this.linkEl, '.fc-view-harness')
    }
  }

  handleClick = (ev: MouseEvent) => {
    let { props, context } = this
    let { moreLinkClick } = context.options
    let date = computeRange(props).start

    function buildPublicSeg(seg: Seg) {
      let { def, instance, range } = seg.eventRange
      return {
        event: new EventImpl(context, def, instance),
        start: context.dateEnv.toDate(range.start),
        end: context.dateEnv.toDate(range.end),
        isStart: seg.isStart,
        isEnd: seg.isEnd,
      }
    }

    if (typeof moreLinkClick === 'function') {
      moreLinkClick = moreLinkClick({
        date,
        allDay: Boolean(props.allDayDate),
        allSegs: props.allSegs.map(buildPublicSeg),
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
    this.setState({ isPopoverOpen: false })
  }
}

function renderMoreLinkInner(props: MoreLinkContentArg) {
  return props.text
}

function computeRange(props: MoreLinkContainerProps): DateRange {
  if (props.allDayDate) {
    return {
      start: props.allDayDate,
      end: addDays(props.allDayDate, 1),
    }
  }

  let { hiddenSegs } = props
  return {
    start: computeEarliestSegStart(hiddenSegs),
    end: computeLatestSegEnd(hiddenSegs),
  }
}

export function computeEarliestSegStart(segs: Seg[]): DateMarker {
  return segs.reduce(pickEarliestStart).eventRange.range.start
}

function pickEarliestStart(seg0: Seg, seg1: Seg): Seg {
  return seg0.eventRange.range.start < seg1.eventRange.range.start ? seg0 : seg1
}

function computeLatestSegEnd(segs: Seg[]): DateMarker {
  return segs.reduce(pickLatestEnd).eventRange.range.end
}

function pickLatestEnd(seg0: Seg, seg1: Seg): Seg {
  return seg0.eventRange.range.end > seg1.eventRange.range.end ? seg0 : seg1
}
