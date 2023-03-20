import { MoreLinkContentArg, CssDimValue } from '@fullcalendar/core'
import {
  MoreLinkContainer, BaseComponent,
  Dictionary, DateProfile, DateRange, DateMarker, EventSegUiInteractionState,
} from '@fullcalendar/core/internal'
import { createElement } from '@fullcalendar/core/preact'
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
  render() {
    let { props } = this

    return (
      <MoreLinkContainer
        elClasses={['fc-timegrid-more-link']}
        elStyle={{
          top: props.top,
          bottom: props.bottom,
        }}
        allDayDate={null}
        moreCnt={props.hiddenSegs.length}
        allSegs={props.hiddenSegs}
        hiddenSegs={props.hiddenSegs}
        extraDateSpan={props.extraDateSpan}
        dateProfile={props.dateProfile}
        todayRange={props.todayRange}
        popoverContent={() => renderPlainFgSegs(props.hiddenSegs, props)}
        defaultGenerator={renderMoreLinkInner}
        forceTimed={true}
      >
        {(InnerContent) => (
          <InnerContent
            elTag="div"
            elClasses={['fc-timegrid-more-link-inner', 'fc-sticky']}
          />
        )}
      </MoreLinkContainer>
    )
  }
}

function renderMoreLinkInner(props: MoreLinkContentArg) {
  return props.shortText
}
