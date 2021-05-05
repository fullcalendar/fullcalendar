import { EventApi } from '../api/EventApi'
import { Seg } from '../component/DateComponent'
import { DateRange } from '../datelib/date-range'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { Dictionary } from '../options'
import { elementClosest } from '../util/dom-manip'
import { memoize } from '../util/memoize'
import { ComponentChildren, createElement, createRef, Fragment, Ref, RefObject, VNode } from '../vdom'
import { BaseComponent } from '../vdom-util'
import { ViewApi } from '../ViewApi'
import { ViewContext, ViewContextType } from '../ViewContext'
import { MorePopover } from './MorePopover'
import { MountArg, RenderHook } from './render-hook'

export type MoreLinkChildren = (
  rootElRef: Ref<any>,
  classNames: string[],
  innerElRef: Ref<any>,
  innerContent: ComponentChildren,
  handleClick: (ev: MouseEvent) => void,
) => ComponentChildren

export interface MoreLinkRootProps { // what the MoreLinkRoot component receives
  dateProfile: DateProfile
  todayRange: DateRange
  allDayDate: DateMarker | null
  allSegs: Seg[]
  hiddenSegs: Seg[]
  extraDateSpan?: Dictionary
  alignmentElRef: RefObject<HTMLElement>
  defaultContent?: (hookProps: MoreLinkContentArg) => ComponentChildren // not used by anyone yet
  popoverContent?: () => VNode
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
}

export class MoreLinkRoot extends BaseComponent<MoreLinkRootProps, MoreLinkRootState> {
  linkElRef = createRef<HTMLElement>()
  computeDate = memoize(computeDate)

  state = {
    isPopoverOpen: false
  }

  render(props: MoreLinkRootProps) {
    return (
      <ViewContextType.Consumer>
        {(context: ViewContext) => {
          let { viewApi, options, calendarApi } = context
          let { moreLinkText } = options
          let { hiddenSegs } = props
          let moreCnt = hiddenSegs.length

          let hookProps: MoreLinkContentArg = {
            num: moreCnt,
            shortText: `+${moreCnt}`, // TODO: offer hook or i18n?
            text: typeof moreLinkText === 'function'
              ? moreLinkText.call(calendarApi, moreCnt)
              : `+${moreCnt} ${moreLinkText}`,
            view: viewApi,
          }

          return (
            <Fragment>
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
                  rootElRef, ['fc-event-more'].concat(customClassNames), innerElRef, innerContent, this.handleClick
                )}
              </RenderHook>
              {this.state.isPopoverOpen && (
                <MorePopover
                  date={this.computeDate(props.allDayDate, props.hiddenSegs, context)}
                  dateProfile={props.dateProfile}
                  todayRange={props.todayRange}
                  extraDateSpan={props.extraDateSpan}
                  parentEl={elementClosest(this.linkElRef.current, '.fc-view-harness') /* TODO: don't access DOM here. but wasn't ready in ref callback */}
                  alignmentEl={props.alignmentElRef.current}
                  onClose={this.handlePopoverClose}
                >
                  {props.popoverContent && props.popoverContent()}
                </MorePopover>
              )}
            </Fragment>
          )
        }}
      </ViewContextType.Consumer>
    )
  }

  handleClick = (ev: MouseEvent) => {
    let { props, context } = this
    let { moreLinkClick } = context.options
    let date = context.dateEnv.toDate(this.computeDate(props.allDayDate, props.hiddenSegs, context))

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

function getEarliestSeg(segs: Seg[]): Seg {
  return segs.reduce(getEarlierSeg)
}

function getEarlierSeg(seg0, seg1) {
  return seg0.eventRange.range.start < seg1.eventRange.range.start ? seg0 : seg1
}

function computeDate(allDayDate: DateMarker, segs: Seg[], context: ViewContext) {
  return allDayDate ? context.dateEnv.toDate(allDayDate) :
    context.dateEnv.toDate(getEarliestSeg(segs).eventRange.range.start)
}
