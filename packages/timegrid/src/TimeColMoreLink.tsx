import {
  createElement, MoreLinkContentArg, MoreLinkRoot, BaseComponent, createRef, setRef,
  Dictionary, DateProfile, DateRange, DateMarker, EventSegUiInteractionState, CssDimValue,
} from '@fullcalendar/common'
import { renderPlainFgSegs } from './TimeCol'
import { TimeColsSeg } from './TimeColsSeg'

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
  rootElRef = createRef<HTMLElement>()

  render() {
    let { props } = this
    return (
      <MoreLinkRoot
        allDayDate={null}
        moreCnt={props.hiddenSegs.length}
        allSegs={props.hiddenSegs}
        hiddenSegs={props.hiddenSegs}
        alignmentElRef={this.rootElRef}
        defaultContent={renderMoreLinkInner}
        extraDateSpan={props.extraDateSpan}
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        popoverContent={() => renderPlainFgSegs(props.hiddenSegs, props)}
      >
        {(rootElRef, classNames, innerElRef, innerContent, handleClick) => (
          <a
            ref={(el: HTMLElement | null) => {
              setRef(rootElRef, el)
              setRef(this.rootElRef, el)
            }}
            className={['fc-timegrid-more-link'].concat(classNames).join(' ')}
            style={{ top: props.top, bottom: props.bottom }}
            onClick={handleClick}
          >
            <div ref={innerElRef} className="fc-timegrid-more-link-inner fc-sticky">
              {innerContent}
            </div>
          </a>
        )}
      </MoreLinkRoot>
    )
  }
}

function renderMoreLinkInner(props: MoreLinkContentArg) {
  return props.shortText
}
