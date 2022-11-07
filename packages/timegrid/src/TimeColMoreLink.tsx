import {
  MoreLinkContentArg, MoreLinkRoot, BaseComponent,
  Dictionary, DateProfile, DateRange, DateMarker, EventSegUiInteractionState, CssDimValue,
} from '@fullcalendar/core'
import {
  createElement,
  createRef,
} from '@fullcalendar/core/preact'
import { renderPlainFgSegs } from './TimeCol.js'
import { TimeColsSeg } from './TimeColsSeg.js'

export interface TimeColMoreLinkProps {
  hiddenSegs: TimeColsSeg[]
  top: CssDimValue
  bottom: CssDimValue
  extraDateSpan?: Dictionary
  dateProfile: DateProfile
  todayRange: DateRange
  nowDate: DateMarker
  eventSelection: string
  eventDrag: EventSegUiInteractionState
  eventResize: EventSegUiInteractionState
}

export class TimeColMoreLink extends BaseComponent<TimeColMoreLinkProps> {
  elRef = createRef<HTMLElement & SVGElement>()

  render() {
    let { props } = this

    return (
      <MoreLinkRoot
        elRef={this.elRef}
        elClasses={['fc-timegrid-more-link']}
        elStyle={{
          top: props.top,
          bottom: props.bottom,
        }}
        allDayDate={null}
        moreCnt={props.hiddenSegs.length}
        allSegs={props.hiddenSegs}
        hiddenSegs={props.hiddenSegs}
        alignmentElRef={this.elRef}
        extraDateSpan={props.extraDateSpan}
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        popoverContent={() => renderPlainFgSegs(props.hiddenSegs, props)}
        defaultGenerator={renderMoreLinkInner}
      >
        {(InnerContent) => (
          <InnerContent elClasses={['fc-timegrid-more-link-inner', 'fc-sticky']} />
        )}
      </MoreLinkRoot>
    )
  }
}

function renderMoreLinkInner(props: MoreLinkContentArg) {
  return props.shortText
}
