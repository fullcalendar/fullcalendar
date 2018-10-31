import { ComponentContext } from "../component/Component"
import { DateMarker } from "../datelib/marker"
import { getDayClasses } from "../component/date-rendering";
import { rangeContainsMarker } from "../datelib/date-range";
import { DateProfile } from "../DateProfileGenerator";

export interface DayBgRowProps {
  dates: DateMarker[]
  dateProfile: DateProfile
  renderIntroHtml?: () => string
}

export default class DayBgRow {

  context: ComponentContext

  constructor(context: ComponentContext) {
    this.context = context
  }

  renderHtml(props: DayBgRowProps) {
    let parts = []

    if (props.renderIntroHtml) {
      parts.push(props.renderIntroHtml())
    }

    for (let date of props.dates) {
      parts.push(
        this.renderCellHtml(date, props.dateProfile)
      )
    }

    if (this.context.options.dir === 'rtl') {
      parts.reverse()
    }

    return '<tr>' + parts.join('') + '</tr>'
  }

  renderCellHtml(date: DateMarker, dateProfile: DateProfile) {
    return renderCellHtml(
      date,
      dateProfile,
      this.context
    )
  }

}

function renderCellHtml(date: DateMarker, dateProfile: DateProfile, context: ComponentContext, otherAttrs?) {
  let { dateEnv, theme } = context
  let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
  let classes = getDayClasses(date, dateProfile, context)

  classes.unshift('fc-day', theme.getClass('widgetContent'))

  return '<td class="' + classes.join(' ') + '"' +
    (isDateValid ?
      ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
      '') +
    (otherAttrs ?
      ' ' + otherAttrs :
      '') +
    '></td>'
}
