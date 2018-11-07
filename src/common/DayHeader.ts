import Component, { ComponentContext } from '../component/Component'
import { htmlToElement, removeElement } from '../util/dom-manip'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat, renderDateCell } from './table-utils'

export interface DayTableHeaderProps {
  dates: DateMarker[]
  dateProfile: DateProfile
  datesRepDistinctDays: boolean
  renderIntroHtml?: () => string
}

export default class DayHeader extends Component<DayTableHeaderProps> {

  el: HTMLElement
  thead: HTMLElement

  constructor(context: ComponentContext, parentEl: HTMLElement) {
    super(context)

    parentEl.innerHTML = '' // because might be nbsp
    parentEl.appendChild(
      this.el = htmlToElement(
        '<div class="fc-row ' + this.theme.getClass('headerRow') + '">' +
          '<table class="' + this.theme.getClass('tableGrid') + '">' +
            '<thead></thead>' +
          '</table>' +
        '</div>'
      )
    )

    this.thead = this.el.querySelector('thead')
  }

  destroy() {
    removeElement(this.el)
  }

  render(props: DayTableHeaderProps) {
    let { dates, datesRepDistinctDays } = props
    let parts = []

    if (props.renderIntroHtml) {
      parts.push(props.renderIntroHtml())
    }

    let colHeadFormat = createFormatter(
      this.opt('columnHeaderFormat') ||
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
          this.context
        )
      )
    }

    if (this.isRtl) {
      parts.reverse()
    }

    this.thead.innerHTML = '<tr>' + parts.join('') + '</tr>'
  }

}
