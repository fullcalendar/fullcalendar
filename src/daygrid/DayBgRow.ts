import {
  ComponentContext,
  DateMarker,
  getDayClasses,
  rangeContainsMarker,
  DateProfile
} from '@fullcalendar/core'

export interface DayBgCell {
  date: DateMarker
  htmlAttrs?: string
}

export interface DayBgRowProps {
  cells: DayBgCell[]
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

    for (let cell of props.cells) {
      parts.push(
        renderCellHtml(
          cell.date,
          props.dateProfile,
          this.context,
          cell.htmlAttrs
        )
      )
    }

    if (!props.cells.length) {
      parts.push('<td class="fc-day ' + this.context.theme.getClass('widgetContent') + '"></td>')
    }

    if (this.context.options.dir === 'rtl') {
      parts.reverse()
    }

    return '<tr>' + parts.join('') + '</tr>'
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
