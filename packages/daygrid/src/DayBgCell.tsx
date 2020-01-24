import {
  h,
  ComponentContext,
  DateMarker,
  getDayClasses,
  rangeContainsMarker,
  DateProfile,
  BaseComponent,
  Ref,
  setRef
} from '@fullcalendar/core'


export interface DayBgCellProps {
  date: DateMarker
  dateProfile: DateProfile
  otherAttrs?: object
  elRef?: Ref<HTMLTableCellElement>
}


export default class DayBgCell extends BaseComponent<DayBgCellProps> {


  render(props: DayBgCellProps, state: {}, context: ComponentContext) {
    let { date, dateProfile, otherAttrs } = props
    let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow
    let classes = getDayClasses(date, dateProfile, context)
    let dateStr = context.dateEnv.formatIso(date, { omitTime: true })
    let dataAttrs = isDateValid ? { 'data-date': dateStr } : {}

    classes.unshift('fc-day')

    return (
      <td
        ref={this.handleEl}
        key={dateStr /* fresh rerender for new date, mostly because of dayRender
          TODO: only do if there are dayRender triggers!!! */}
        class={classes.join(' ')}
        { ...dataAttrs }
        { ...otherAttrs }
      />
    )
  }


  handleEl = (el: HTMLElement | null) => {
    let { props } = this

    if (el) {
      let { calendar, view, dateEnv } = this.context

      calendar.publiclyTrigger('dayRender', [
        {
          date: dateEnv.toDate(props.date),
          el,
          view
        }
      ])
    }

    setRef(props.elRef, el)
  }

}
