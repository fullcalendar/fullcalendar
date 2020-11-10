import {
  DateMarker, BaseComponent, createElement,
  DateRange, DayCellContent, DateProfile,
} from '@fullcalendar/common'

export interface TimeColMiscProps { // should be given nowDate too??
  dateProfile: DateProfile
  date: DateMarker
  todayRange: DateRange
  extraHookProps?: any
}

export class TimeColMisc extends BaseComponent<TimeColMiscProps> {
  render() {
    let { props } = this

    return (
      <DayCellContent date={props.date} dateProfile={props.dateProfile} todayRange={props.todayRange} extraHookProps={props.extraHookProps}>
        {(innerElRef, innerContent) => (
          innerContent &&
            <div className="fc-timegrid-col-misc" ref={innerElRef}>{innerContent}</div>
        )}
      </DayCellContent>
    )
  }
}
