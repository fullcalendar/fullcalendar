import { CssDimValue } from '../../scrollgrid/util'
import { joinClassNames } from '../../util/html'
import { MoreLinkContainer } from '../../common/MoreLinkContainer'
import { BaseComponent } from '../../vdom-util'
import { Dictionary } from '../../options'
import { DateProfile } from '../../DateProfileGenerator'
import { DateRange, DateMarker } from '@full-ui/headless-calendar'
import { EventSegUiInteractionState } from '../../component/DateComponent'
import { EventRangeProps } from '../../component-util/event-rendering'
import classNames from '../../styles.module.css'
import { renderPlainFgSegs } from './TimeGridCol' // BAD
import { TimeGridRange } from '../TimeColsSeg'

export interface TimeGridMoreLinkProps {
  hiddenSegs: (TimeGridRange & EventRangeProps)[]
  top: CssDimValue
  height: CssDimValue
  dateSpanProps?: Dictionary
  dateProfile: DateProfile
  todayRange: DateRange
  nowDate: DateMarker
  nowMs?: number
  eventSelection: string
  eventDrag: EventSegUiInteractionState<TimeGridRange>
  eventResize: EventSegUiInteractionState<TimeGridRange>
  isNarrow: boolean
  isMicro: boolean
}

export class TimeGridMoreLink extends BaseComponent<TimeGridMoreLinkProps> {
  render() {
    let { props } = this

    return (
      <div // the "harness"
        className={joinClassNames(
          classNames.abs,
          classNames.flexCol,
          classNames.end0,
          classNames.z9999,
        )}
        style={{
          top: props.top,
          height: props.height,
        }}
      >
        <MoreLinkContainer
          className={classNames.liquid}
          display='column'
          allDayDate={null}
          segs={props.hiddenSegs}
          hiddenSegs={props.hiddenSegs}
          dateSpanProps={props.dateSpanProps}
          dateProfile={props.dateProfile}
          todayRange={props.todayRange}
          popoverContent={() => renderPlainFgSegs(props.hiddenSegs, props, /* isMirror = */ false)}
          forceTimed={true}
          isNarrow={props.isNarrow}
          isMicro={props.isMicro}
        />
      </div>
    )
  }
}
