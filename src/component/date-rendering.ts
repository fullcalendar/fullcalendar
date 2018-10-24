import { htmlEscape, attrsToStr } from '../util/html'
import { DateMarker, startOfDay, addDays, DAY_IDS } from '../datelib/marker'
import { rangeContainsMarker } from '../datelib/date-range'
import Component from '../component/Component'
import DateComponent from './DateComponent'


// Generates HTML for an anchor to another view into the calendar.
// Will either generate an <a> tag or a non-clickable <span> tag, depending on enabled settings.
// `gotoOptions` can either be a date input, or an object with the form:
// { date, type, forceOff }
// `type` is a view-type like "day" or "week". default value is "day".
// `attrs` and `innerHtml` are use to generate the rest of the HTML tag.
export function buildGotoAnchorHtml(component: Component<any>, gotoOptions, attrs, innerHtml?) {
  let { dateEnv } = component
  let date
  let type
  let forceOff
  let finalOptions

  if (gotoOptions instanceof Date || typeof gotoOptions !== 'object') {
    date = gotoOptions // a single date-like input
  } else {
    date = gotoOptions.date
    type = gotoOptions.type
    forceOff = gotoOptions.forceOff
  }
  date = dateEnv.createMarker(date) // if a string, parse it

  finalOptions = { // for serialization into the link
    date: dateEnv.formatIso(date, { omitTime: true }),
    type: type || 'day'
  }

  if (typeof attrs === 'string') {
    innerHtml = attrs
    attrs = null
  }

  attrs = attrs ? ' ' + attrsToStr(attrs) : '' // will have a leading space
  innerHtml = innerHtml || ''

  if (!forceOff && component.opt('navLinks')) {
    return '<a' + attrs +
      ' data-goto="' + htmlEscape(JSON.stringify(finalOptions)) + '">' +
      innerHtml +
      '</a>'
  } else {
    return '<span' + attrs + '>' +
      innerHtml +
      '</span>'
  }
}


export function getAllDayHtml(component: Component<any>) {
  return component.opt('allDayHtml') || htmlEscape(component.opt('allDayText'))
}


// Computes HTML classNames for a single-day element
export function getDayClasses(component: DateComponent, date: DateMarker, noThemeHighlight?) {
  let view = this.view
  let classes = []
  let todayStart: DateMarker
  let todayEnd: DateMarker

  if (!rangeContainsMarker(this.dateProfile.activeRange, date)) {
    classes.push('fc-disabled-day') // TODO: jQuery UI theme?
  } else {
    classes.push('fc-' + DAY_IDS[date.getUTCDay()])

    if (view.isDateInOtherMonth(date, this.dateProfile)) { // TODO: use DateComponent subclass somehow
      classes.push('fc-other-month')
    }

    todayStart = startOfDay(view.calendar.getNow())
    todayEnd = addDays(todayStart, 1)

    if (date < todayStart) {
      classes.push('fc-past')
    } else if (date >= todayEnd) {
      classes.push('fc-future')
    } else {
      classes.push('fc-today')

      if (noThemeHighlight !== true) {
        classes.push(view.calendar.theme.getClass('today'))
      }
    }
  }

  return classes
}
