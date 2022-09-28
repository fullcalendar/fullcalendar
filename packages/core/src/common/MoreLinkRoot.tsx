import { EventApi } from '../api/EventApi.js'
import { Seg } from '../component/DateComponent.js'
import { DateRange } from '../datelib/date-range.js'
import { addDays, DateMarker } from '../datelib/marker.js'
import { DateProfile } from '../DateProfileGenerator.js'
import { Dictionary } from '../options.js'
import { elementClosest, getUniqueDomId } from '../util/dom-manip.js'
import { formatWithOrdinals } from '../util/misc.js'
import { ComponentChildren, createElement, createRef, Fragment, Ref, RefObject, VNode } from '../preact.js'
import { BaseComponent } from '../vdom-util.js'
import { ViewApi } from '../ViewApi.js'
import { ViewContext, ViewContextType } from '../ViewContext.js'
import { MorePopover } from './MorePopover.js'
import { MountArg, RenderHook } from './render-hook.js'

export type MoreLinkChildren = (
  rootElRef: Ref<any>,
  classNames: string[],
  innerElRef: Ref<any>,
  innerContent: ComponentChildren,
  handleClick: (ev: MouseEvent) => void,
  title: string, // for a11y
  isExpanded: boolean,
  popoverId: string,
) => ComponentChildren

export interface MoreLinkRootProps { // what the MoreLinkRoot component receives
  dateProfile: DateProfile
  todayRange: DateRange
  allDayDate: DateMarker | null
  moreCnt: number // can't always derive from hiddenSegs. some hiddenSegs might be due to lack of dimensions
  allSegs: Seg[]
  hiddenSegs: Seg[]
  extraDateSpan?: Dictionary
  alignmentElRef: RefObject<HTMLElement> // for popover
  alignGridTop?: boolean // for popover
  topAlignmentElRef?: RefObject<HTMLElement>
  defaultContent?: (hookProps: MoreLinkContentArg) => ComponentChildren
  popoverContent: () => VNode
  children: MoreLinkChildren
}

export interface MoreLinkContentArg { // what the render-hooks receive
  num: number
  text: string
  shortText: string
  view: ViewApi
}

export type MoreLinkMountArg = MountArg<MoreLinkContentArg>

interface MoreLinkRootState {
  isPopoverOpen: boolean
  popoverId: string
}

export class MoreLinkRoot extends BaseComponent<MoreLinkRootProps, MoreLinkRootState> {
  private linkElRef = createRef<HTMLElement>()
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
          let title = formatWithOrdinals(options.moreLinkHint, [moreCnt], text)
          let hookProps: MoreLinkContentArg = {
            num: moreCnt,
            shortText: `+${moreCnt}`, // TODO: offer hook or i18n?
            text,
            view: viewApi,
          }

          return (
            <Fragment>
              {Boolean(props.moreCnt) && (
                <RenderHook<MoreLinkContentArg>
                  elRef={this.linkElRef}
                  hookProps={hookProps}
                  classNames={options.moreLinkClassNames}
                  content={options.moreLinkContent}
                  defaultContent={props.defaultContent || renderMoreLinkInner}
                  didMount={options.moreLinkDidMount}
                  willUnmount={options.moreLinkWillUnmount}
                >
                  {(rootElRef, customClassNames, innerElRef, innerContent) => props.children(
                    rootElRef,
                    ['fc-more-link'].concat(customClassNames),
                    innerElRef,
                    innerContent,
                    this.handleClick,
                    title,
                    state.isPopoverOpen,
                    state.isPopoverOpen ? state.popoverId : '',
                  )}
                </RenderHook>
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
                  alignmentEl={props.alignmentElRef.current}
                  alignGridTop={props.alignGridTop}
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

  updateParentEl() {
    if (this.linkElRef.current) {
      this.parentEl = elementClosest(this.linkElRef.current, '.fc-view-harness')
    }
  }

  handleClick = (ev: MouseEvent) => {
    let { props, context } = this
    let { moreLinkClick } = context.options
    let date = computeRange(props).start

    function buildPublicSeg(seg: Seg) {
      let { def, instance, range } = seg.eventRange
      return {
        event: new EventApi(context, def, instance),
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

function computeRange(props: MoreLinkRootProps): DateRange {
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
