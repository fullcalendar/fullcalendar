import Component, { ComponentContext } from '../component/Component'
import { htmlToElement, removeElement } from '../util/dom-manip'
import { DateMarker } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { createFormatter } from '../datelib/formatting'
import { computeFallbackHeaderFormat, renderDateCell } from './table-utils'
import { memoizeRendering } from '../component/memoized-rendering'

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

  private renderSkeleton = memoizeRendering(this._renderSkeleton, this._unrenderSkeleton)


  constructor(parentEl: HTMLElement) {
    super()

    this.parentEl = parentEl
  }


  render(props: DayTableHeaderProps, context: ComponentContext) {
    let { dates, datesRepDistinctDays } = props
    let parts = []

    this.renderSkeleton(context)

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

    this.thead.innerHTML = '<tr>' + parts.join('') + '</tr>'
  }


  destroy() {
    super.destroy()

    this.renderSkeleton.unrender()
  }


  _renderSkeleton(context: ComponentContext) {
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


  _unrenderSkeleton() {
    removeElement(this.el)
  }

}
