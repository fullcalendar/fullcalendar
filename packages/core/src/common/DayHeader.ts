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

  parentEl: HTMLElement
  el: HTMLElement
  thead: HTMLElement

  constructor(parentEl: HTMLElement) {
    super()

    this.parentEl = parentEl
  }

  setContext(context: ComponentContext) {
    super.setContext(context)

    let { theme } = context
    let { parentEl } = this

    parentEl.innerHTML = '' // because might be nbsp
    parentEl.appendChild(
      this.el = htmlToElement(
        '<div class="fc-row ' + theme.getClass('headerRow') + '">' +
          '<table class="' + theme.getClass('tableGrid') + '">' +
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
      this.context.options.columnHeaderFormat ||
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

    if (this.context.isRtl) {
      parts.reverse()
    }

    this.thead.innerHTML = '<tr>' + parts.join('') + '</tr>'
  }

}
