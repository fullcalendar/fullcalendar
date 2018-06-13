import { htmlToElement, createElement } from '../util/dom-manip'
import { htmlEscape } from '../util/html'
import { subtractInnerElHeight } from '../util/misc'
import UnzonedRange from '../models/UnzonedRange'
import View from '../View'
import Scroller from '../common/Scroller'
import ListEventRenderer from './ListEventRenderer'
import ListEventPointing from './ListEventPointing'
import { DateMarker, addDays, startOfDay } from '../datelib/marker'
import { createFormatter } from '../datelib/formatting'

/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export default class ListView extends View {

  // initialized after the class
  eventRendererClass: any
  eventPointingClass: any

  segSelector: any = '.fc-list-item' // which elements accept event actions

  scroller: Scroller
  contentEl: HTMLElement

  dayDates: DateMarker[]
  dayRanges: UnzonedRange[] // start/end of each day


  constructor(calendar, viewSpec) {
    super(calendar, viewSpec)

    this.scroller = new Scroller({
      overflowX: 'hidden',
      overflowY: 'auto'
    })
  }


  renderSkeleton() {
    this.el.classList.add('fc-list-view')

    let themeClass = this.calendar.theme.getClass('listView')
    if (themeClass) {
      this.el.classList.add(themeClass)
    }

    this.scroller.render()
    this.el.appendChild(this.scroller.el)

    this.contentEl = this.scroller.scrollEl // shortcut
  }


  unrenderSkeleton() {
    this.scroller.destroy() // will remove the Grid too
  }


  updateSize(totalHeight, isAuto, isResize) {
    super.updateSize(totalHeight, isAuto, isResize)

    this.scroller.clear() // sets height to 'auto' and clears overflow

    if (!isAuto) {
      this.scroller.setHeight(this.computeScrollerHeight(totalHeight))
    }
  }


  computeScrollerHeight(totalHeight) {
    return totalHeight -
      subtractInnerElHeight(this.el, this.scroller.el) // everything that's NOT the scroller
  }


  renderDates(dateProfile) {
    let dayStart = startOfDay(dateProfile.renderUnzonedRange.start)
    let viewEnd = dateProfile.renderUnzonedRange.end
    let dayDates = []
    let dayRanges = []

    while (dayStart < viewEnd) {

      dayDates.push(dayStart)

      dayRanges.push(new UnzonedRange(
        dayStart,
        addDays(dayStart, 1)
      ))

      dayStart = addDays(dayStart, 1)
    }

    this.dayDates = dayDates
    this.dayRanges = dayRanges

    // all real rendering happens in EventRenderer
  }


  // slices by day
  rangeToSegs(range: UnzonedRange, isAllDay: boolean) {
    const dateEnv = this.calendar.dateEnv
    let dayRanges = this.dayRanges
    let dayIndex
    let segRange
    let seg
    let segs = []

    for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex++) {
      segRange = range.intersect(dayRanges[dayIndex])

      if (segRange) {
        seg = {
          start: segRange.start,
          end: segRange.end,
          isStart: segRange.isStart,
          isEnd: segRange.isEnd,
          dayIndex: dayIndex
        }

        segs.push(seg)

        // detect when range won't go fully into the next day,
        // and mutate the latest seg to the be the end.
        if (
          !seg.isEnd && !isAllDay &&
          dayIndex + 1 < dayRanges.length &&
          range.end <
            dateEnv.add(
              dayRanges[dayIndex + 1].start,
              this.nextDayThreshold
            )
        ) {
          seg.end = range.end
          seg.isEnd = true
          break
        }
      }
    }

    return segs
  }


  renderEmptyMessage() {
    this.contentEl.innerHTML =
      '<div class="fc-list-empty-wrap2">' + // TODO: try less wraps
      '<div class="fc-list-empty-wrap1">' +
      '<div class="fc-list-empty">' +
        htmlEscape(this.opt('noEventsMessage')) +
      '</div>' +
      '</div>' +
      '</div>'
  }


  // render the event segments in the view
  renderSegList(allSegs) {
    let segsByDay = this.groupSegsByDay(allSegs) // sparse array
    let dayIndex
    let daySegs
    let i
    let tableEl = htmlToElement('<table class="fc-list-table ' + this.calendar.theme.getClass('tableList') + '"><tbody></tbody></table>')
    let tbodyEl = tableEl.querySelector('tbody')

    for (dayIndex = 0; dayIndex < segsByDay.length; dayIndex++) {
      daySegs = segsByDay[dayIndex]

      if (daySegs) { // sparse array, so might be undefined

        // append a day header
        tbodyEl.appendChild(this.buildDayHeaderRow(this.dayDates[dayIndex]))

        this.eventRenderer.sortEventSegs(daySegs)

        for (i = 0; i < daySegs.length; i++) {
          tbodyEl.appendChild(daySegs[i].el) // append event row
        }
      }
    }

    this.contentEl.innerHTML = ''
    this.contentEl.appendChild(tableEl)
  }


  // Returns a sparse array of arrays, segs grouped by their dayIndex
  groupSegsByDay(segs) {
    let segsByDay = [] // sparse array
    let i
    let seg

    for (i = 0; i < segs.length; i++) {
      seg = segs[i];
      (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = []))
        .push(seg)
    }

    return segsByDay
  }


  // generates the HTML for the day headers that live amongst the event rows
  buildDayHeaderRow(dayDate) {
    const dateEnv = this.calendar.dateEnv
    let mainFormat = createFormatter(this.opt('listDayFormat')) // TODO: cache
    let altFormat = createFormatter(this.opt('listDayAltFormat')) // TODO: cache

    return createElement('tr', {
      className: 'fc-list-heading',
      'data-date': dateEnv.formatIso(dayDate, { omitTime: true })
    }, '<td class="' + (
      this.calendar.theme.getClass('tableListHeading') ||
      this.calendar.theme.getClass('widgetHeader')
    ) + '" colspan="3">' +
      (mainFormat ?
        this.buildGotoAnchorHtml(
          dayDate,
          { 'class': 'fc-list-heading-main' },
          htmlEscape(dateEnv.format(dayDate, mainFormat)) // inner HTML
        ) :
        '') +
      (altFormat ?
        this.buildGotoAnchorHtml(
          dayDate,
          { 'class': 'fc-list-heading-alt' },
          htmlEscape(dateEnv.format(dayDate, altFormat)) // inner HTML
        ) :
        '') +
    '</td>') as HTMLTableRowElement
  }

}

ListView.prototype.eventRendererClass = ListEventRenderer
ListView.prototype.eventPointingClass = ListEventPointing

/*
export default class ListEventPointing extends EventPointing {

  // for events with a url, the whole <tr> should be clickable,
  // but it's impossible to wrap with an <a> tag. simulate this.
  handleClick(seg, ev) {
    let url

    super.handleClick(seg, ev) // might prevent the default action

    // not clicking on or within an <a> with an href
    if (!elementClosest(ev.target, 'a[href]')) {
      url = seg.footprint.eventDef.url

      if (url && !ev.isDefaultPrevented()) { // jsEvent not cancelled in handler
        window.location.href = url // simulate link click
      }
    }
  }

}
*/
