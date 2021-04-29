import { ComponentChildren, createElement, Ref, RefObject } from '../vdom'
import { BaseComponent } from '../vdom-util'
import { ViewApi } from '../ViewApi'
import { ViewContext, ViewContextType } from '../ViewContext'
import { EventSegment } from './more-link'
import { MountArg, RenderHook } from './render-hook'

export type MoreLinkChildren = (
  rootElRef: Ref<any>,
  classNames: string[],
  innerElRef: Ref<any>,
  innerContent: ComponentChildren,
  handleClick: () => void,
) => ComponentChildren

export interface MoreLinkRootProps { // what the MoreLinkRoot component receives
  allSegs: EventSegment[]
  hiddenSegs: EventSegment[]
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

  handleClick = () => {
    console.log('handle click', this.props.hiddenSegs, this.props.positionElRef.current)
  }
}

function renderMoreLinkInner(props: MoreLinkContentArg) {
  return props.text
}

/*
let { props, context } = this
let { options, dateEnv } = context
let { moreLinkClick } = options
let allSegs: EventSegment[] = []
let hiddenSegs: EventSegment[] = []

function segForPublic(seg: TableSeg) {
  let { def, instance, range } = seg.eventRange
  return {
    event: new EventApi(context, def, instance),
    start: dateEnv.toDate(range.start),
    end: dateEnv.toDate(range.end),
    isStart: seg.isStart,
    isEnd: seg.isEnd,
  }
}

for (let placement of props.singlePlacements) {
  let publicSeg = segForPublic(placement.seg)
  allSegs.push(publicSeg)
  if (!placement.isVisible) {
    hiddenSegs.push(publicSeg)
  }
}

if (typeof moreLinkClick === 'function') {
  moreLinkClick = moreLinkClick({
    date: context.dateEnv.toDate(props.date),
    allDay: true,
    allSegs,
    hiddenSegs,
    jsEvent: ev,
    view: context.viewApi,
  }) as string | undefined
}

if (!moreLinkClick || moreLinkClick === 'popover') {
  console.log('TODO: open popover', allSegs, this.rootEl)

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

} else if (typeof moreLinkClick === 'string') { // a view name
  context.calendarApi.zoomTo(props.date, moreLinkClick)
}
*/

// TODO: address ticket where event refreshing closes popover
