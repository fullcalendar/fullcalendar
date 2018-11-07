import Component, { ComponentContext } from '../component/Component'
import { htmlToElement, removeElement } from '../util/dom-manip'
import { DateMarker, DAY_IDS } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { rangeContainsMarker } from '../datelib/date-range'
import { htmlEscape } from '../util/html'
import { buildGotoAnchorHtml, getDayClasses } from '../component/date-rendering'
import { createFormatter } from '../datelib/formatting'

export interface DayTableHeaderProps {
  dates: DateMarker[]
  dateProfile: DateProfile
  datesRepDistinctDays: boolean
  renderIntroHtml?: () => string
}

export default class DayTableHeader extends Component<DayTableHeaderProps> {

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

// Computes a default column header formatting string if `colFormat` is not explicitly defined
function computeFallbackHeaderFormat(datesRepDistinctDays: boolean, dayCnt: number) {
    // if more than one week row, or if there are a lot of columns with not much space,
    // put just the day numbers will be in each cell
    if (!datesRepDistinctDays || dayCnt > 10) {
      return { weekday: 'short' } // "Sat"
    } else if (dayCnt > 1) {
      return { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true } // "Sat 11/12"
    } else {
      return { weekday: 'long' } // "Saturday"
    }
}

function renderDateCell(
  date: DateMarker,
  dateProfile: DateProfile,
  datesRepDistinctDays,
  colCnt,
  colHeadFormat,
  context: ComponentContext,
  colspan?,
  otherAttrs?
): string {
  let { view, dateEnv, theme, options } = context
  let isDateValid = rangeContainsMarker(dateProfile.activeRange, date) // TODO: called too frequently. cache somehow.
  let classNames = [
    'fc-day-header',
    theme.getClass('widgetHeader')
  ]
  let innerHtml

  if (typeof options.columnHeaderHtml === 'function') {
    innerHtml = options.columnHeaderHtml(date)
  } else if (typeof options.columnHeaderText === 'function') {
    innerHtml = htmlEscape(
      options.columnHeaderText(date)
    )
  } else {
    innerHtml = htmlEscape(dateEnv.format(date, colHeadFormat))
  }

  // if only one row of days, the classNames on the header can represent the specific days beneath
  if (datesRepDistinctDays) {
    classNames = classNames.concat(
      // includes the day-of-week class
      // noThemeHighlight=true (don't highlight the header)
      getDayClasses(date, dateProfile, context, true)
    )
  } else {
    classNames.push('fc-' + DAY_IDS[date.getUTCDay()]) // only add the day-of-week class
  }

  return '' +
    '<th class="' + classNames.join(' ') + '"' +
      ((isDateValid && datesRepDistinctDays) ?
        ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
        '') +
        (colspan > 1 ?
          ' colspan="' + colspan + '"' :
          '') +
        (otherAttrs ?
          ' ' + otherAttrs :
          '') +
      '>' +
      (isDateValid ?
        // don't make a link if the heading could represent multiple days, or if there's only one day (forceOff)
        buildGotoAnchorHtml(
          view,
          { date: date, forceOff: !datesRepDistinctDays || colCnt === 1 },
          innerHtml
        ) :
        // if not valid, display text, but no link
        innerHtml
      ) +
    '</th>'
}
