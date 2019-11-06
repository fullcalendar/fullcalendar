import { Component, DomLocation } from '../view-framework'
import ComponentContext from '../component/ComponentContext'
import { htmlToElement } from '../util/dom-manip'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat, renderDateCell } from './table-utils'

export interface DayHeaderProps extends DomLocation {
  dates: DateMarker[]
  dateProfile: DateProfile
  datesRepDistinctDays: boolean
  renderIntroHtml?: () => string
}

export default class DayHeader extends Component<DayHeaderProps> {


  render(props: DayHeaderProps, context: ComponentContext) {
    let { theme } = context
    let { dates, datesRepDistinctDays } = props
    let parts = []

    if (props.renderIntroHtml) {
      parts.push(props.renderIntroHtml())
    }

    let colHeadFormat = createFormatter(
      context.options.columnHeaderFormat ||
      computeFallbackHeaderFormat(datesRepDistinctDays, dates.length)
    )

    for (let date of dates) {
      parts.push(
        renderDateCell(
          date,
          props.dateProfile,
          datesRepDistinctDays,
          dates.length,
          colHeadFormat,
          context
        )
      )
    }

    if (context.isRtl) {
      parts.reverse()
    }

    return htmlToElement(
      '<div class="fc-row ' + theme.getClass('headerRow') + '">' +
        '<table class="' + theme.getClass('tableGrid') + '">' +
          '<thead>' +
            '<tr>' + parts.join('') + '</tr>' +
          '</thead>' +
        '</table>' +
      '</div>'
    )
  }

}
