import { EventApi } from '../api/EventApi'
import { Seg } from '../component/DateComponent'
import { DateMarker } from '../datelib/marker'
import { ComponentChildren, createElement, Ref, RefObject } from '../vdom'
import { BaseComponent } from '../vdom-util'
import { ViewApi } from '../ViewApi'
import { ViewContext, ViewContextType } from '../ViewContext'
import { MountArg, RenderHook } from './render-hook'

export type MoreLinkChildren = (
  rootElRef: Ref<any>,
  classNames: string[],
  innerElRef: Ref<any>,
  innerContent: ComponentChildren,
  handleClick: (ev: MouseEvent) => void,
) => ComponentChildren

export interface MoreLinkRootProps { // what the MoreLinkRoot component receives
  allDayDate: DateMarker | null
  allSegs: Seg[]
  hiddenSegs: Seg[]
  positionElRef: RefObject<HTMLElement>
  defaultContent?: (hookProps: MoreLinkContentArg) => ComponentChildren // not used by anyone yet
  children: MoreLinkChildren
}

export interface MoreLinkContentArg { // what the render-hooks receive
  num: number
  text: string
  shortText: string
  view: ViewApi
}

export type MoreLinkMountArg = MountArg<MoreLinkContentArg>

export class MoreLinkRoot extends BaseComponent<MoreLinkRootProps> {
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
            <RenderHook<MoreLinkContentArg>
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
          )
        }}
      </ViewContextType.Consumer>
    )
  }

  handleClick = (ev: MouseEvent) => {
    let { props, context } = this
    let { moreLinkClick } = context.options
    let allDay = Boolean(props.allDayDate)
    let date = allDay ? context.dateEnv.toDate(props.allDayDate) :
      context.dateEnv.toDate(getEarliestSeg(props.hiddenSegs).eventRange.range.start)

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
        allDay,
        allSegs: props.allSegs.map(buildPublicSeg),
        hiddenSegs: props.hiddenSegs.map(buildPublicSeg),
        jsEvent: ev,
        view: context.viewApi,
      }) as string | undefined
    }

    if (!moreLinkClick || moreLinkClick === 'popover') {
      console.log('open popover', date, props.hiddenSegs, props.positionElRef.current)
      /*
      (!props.forPrint && (
        <MorePopover
          ref={this.morePopoverRef}
          date={morePopoverState.date}
          dateProfile={dateProfile}
          segs={morePopoverState.allSegs}
          alignmentEl={morePopoverState.dayEl}
          topAlignmentEl={rowCnt === 1 ? props.headerAlignElRef.current : null}
          selectedInstanceId={props.eventSelection}
          hiddenInstances={// yuck
            (props.eventDrag ? props.eventDrag.affectedInstances : null) ||
            (props.eventResize ? props.eventResize.affectedInstances : null) ||
            {}
          }
          todayRange={todayRange}
        />
      )

      let morePopoverHit = morePopover ? morePopover.positionToHit(leftPosition, topPosition, this.rootEl) : null
      let { morePopoverState } = this.state
      if (morePopoverHit) {
        return {
          row: morePopoverState.fromRow,
          col: morePopoverState.fromCol,
          ...morePopoverHit,
        }
      }
      */

    } else if (typeof moreLinkClick === 'string') { // a view name
      context.calendarApi.zoomTo(date, moreLinkClick)
    }
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
