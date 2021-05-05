import { EventApi } from '../api/EventApi'
import { Seg } from '../component/DateComponent'
import { DateRange } from '../datelib/date-range'
import { addDays, DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { Dictionary } from '../options'
import { elementClosest } from '../util/dom-manip'
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
}

export class MoreLinkRoot extends BaseComponent<MoreLinkRootProps, MoreLinkRootState> {
  linkElRef = createRef<HTMLElement>()

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
          let range = computeRange(props)

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
                  startDate={range.start}
                  endDate={range.end}
                  dateProfile={props.dateProfile}
                  todayRange={props.todayRange}
                  extraDateSpan={props.extraDateSpan}
                  parentEl={elementClosest(this.linkElRef.current, '.fc-view-harness') /* TODO: move to did mount. don't access DOM here. but wasn't ready in ref callback */}
                  alignmentEl={props.alignmentElRef.current}
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
    start: hiddenSegs[0].eventRange.range.start,
    end: hiddenSegs[hiddenSegs.length - 1].eventRange.range.end,
  }
}
