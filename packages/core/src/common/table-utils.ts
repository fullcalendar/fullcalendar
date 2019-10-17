import { rangeContainsMarker } from '../datelib/date-range'
import { htmlEscape } from '../util/html'
import { buildGotoAnchorHtml, getDayClasses } from '../component/date-rendering'
import { DateMarker, DAY_IDS } from '../datelib/marker'
import { DateProfile } from '../DateProfileGenerator'
import { ComponentContext } from '../component/Component'

// Computes a default column header formatting string if `colFormat` is not explicitly defined
export function computeFallbackHeaderFormat(datesRepDistinctDays: boolean, dayCnt: number) {
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

export function renderDateCell(
  dateMarker: DateMarker,
  dateProfile: DateProfile,
  datesRepDistinctDays,
  colCnt,
  colHeadFormat,
  context: ComponentContext,
  colspan?,
  otherAttrs?
): string {
  let { dateEnv, theme, options } = context
  let isDateValid = rangeContainsMarker(dateProfile.activeRange, dateMarker) // TODO: called too frequently. cache somehow.
  let classNames = [
    'fc-day-header',
    theme.getClass('widgetHeader')
  ]
  let innerHtml

  if (typeof options.columnHeaderHtml === 'function') {
    innerHtml = options.columnHeaderHtml(
      dateEnv.toDate(dateMarker)
    )
  } else if (typeof options.columnHeaderText === 'function') {
    innerHtml = htmlEscape(
      options.columnHeaderText(
        dateEnv.toDate(dateMarker)
      )
    )
  } else {
    innerHtml = htmlEscape(dateEnv.format(dateMarker, colHeadFormat))
  }

  // if only one row of days, the classNames on the header can represent the specific days beneath
  if (datesRepDistinctDays) {
    classNames = classNames.concat(
      // includes the day-of-week class
      // noThemeHighlight=true (don't highlight the header)
      getDayClasses(dateMarker, dateProfile, context, true)
    )
  } else {
    classNames.push('fc-' + DAY_IDS[dateMarker.getUTCDay()]) // only add the day-of-week class
  }

  return '' +
    '<th class="' + classNames.join(' ') + '"' +
      ((isDateValid && datesRepDistinctDays) ?
        ' data-date="' + dateEnv.formatIso(dateMarker, { omitTime: true }) + '"' :
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
          options,
          dateEnv,
          { date: dateMarker, forceOff: !datesRepDistinctDays || colCnt === 1 },
          innerHtml
        ) :
        // if not valid, display text, but no link
        innerHtml
      ) +
    '</th>'
}
