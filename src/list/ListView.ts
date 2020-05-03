import * as $ from 'jquery'
import { htmlEscape, subtractInnerElHeight } from '../util'
import UnzonedRange from '../models/UnzonedRange'
import View from '../View'
import Scroller from '../common/Scroller'
import ListEventRenderer from './ListEventRenderer'
import ListEventPointing from './ListEventPointing'

/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export default class ListView extends View {

  // initialized after the class
  eventRendererClass: any
  eventPointingClass: any

  segSelector: any = '.fc-list-item' // which elements accept event actions

  scroller: any
  contentEl: any

  dayDates: any // localized ambig-time moment array
  dayRanges: any // UnzonedRange[], of start-end of each day


  constructor(calendar, viewSpec) {
    super(calendar, viewSpec)

    this.scroller = new Scroller({
      overflowX: 'hidden',
      overflowY: 'auto'
    })
  }


  renderSkeleton() {
    this.el.addClass(
      'fc-list-view ' +
      this.calendar.theme.getClass('listView')
    )

    this.scroller.render()
    this.scroller.el.appendTo(this.el)

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
    let calendar = this.calendar
    let dayStart = calendar.msToUtcMoment(dateProfile.renderUnzonedRange.startMs, true)
    let viewEnd = calendar.msToUtcMoment(dateProfile.renderUnzonedRange.endMs, true)
    let dayDates = []
    let dayRanges = []

    while (dayStart < viewEnd) {

      dayDates.push(dayStart.clone())

      dayRanges.push(new UnzonedRange(
        dayStart,
        dayStart.clone().add(1, 'day')
      ))

      dayStart.add(1, 'day')
    }

    this.dayDates = dayDates
    this.dayRanges = dayRanges

    // all real rendering happens in EventRenderer
  }


  // slices by day
  componentFootprintToSegs(footprint) {
    let dayRanges = this.dayRanges
    let dayIndex
    let segRange
    let seg
    let segs = []

    for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex++) {
      segRange = footprint.unzonedRange.intersect(dayRanges[dayIndex])

      if (segRange) {
        seg = {
          startMs: segRange.startMs,
          endMs: segRange.endMs,
          isStart: segRange.isStart,
          isEnd: segRange.isEnd,
          dayIndex: dayIndex
        }

        segs.push(seg)

        // detect when footprint won't go fully into the next day,
        // and mutate the latest seg to the be the end.
        if (
          !seg.isEnd && !footprint.isAllDay &&
          dayIndex + 1 < dayRanges.length &&
          footprint.unzonedRange.endMs < dayRanges[dayIndex + 1].startMs + this.nextDayThreshold
        ) {
          seg.endMs = footprint.unzonedRange.endMs
          seg.isEnd = true
          break
        }
      }
    }

    return segs
  }


  renderEmptyMessage() {
    this.contentEl.html(
      '<div class="fc-list-empty-wrap2">' + // TODO: try less wraps
      '<div class="fc-list-empty-wrap1">' +
      '<div class="fc-list-empty">' +
        htmlEscape(this.opt('noEventsMessage')) +
      '</div>' +
      '</div>' +
      '</div>'
    )
  }


  // render the event segments in the view
  renderSegList(allSegs) {
    let segsByDay = this.groupSegsByDay(allSegs) // sparse array
    let dayIndex
    let daySegs
    let i
    let tableEl = $('<table class="fc-list-table ' + this.calendar.theme.getClass('tableList') + '"><tbody></tbody></table>')
    let tbodyEl = tableEl.find('tbody')

    for (dayIndex = 0; dayIndex < segsByDay.length; dayIndex++) {
      daySegs = segsByDay[dayIndex]

      if (daySegs) { // sparse array, so might be undefined

        // append a day header
        tbodyEl.append(this.dayHeaderHtml(this.dayDates[dayIndex]))

        this.eventRenderer.sortEventSegs(daySegs)

        for (i = 0; i < daySegs.length; i++) {
          tbodyEl.append(daySegs[i].el) // append event row
        }
      }
    }

    this.contentEl.empty().append(tableEl)
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
  dayHeaderHtml(dayDate) {
    let mainFormat = this.opt('listDayFormat')
    let altFormat = this.opt('listDayAltFormat')

    return '<tr class="fc-list-heading" data-date="' + dayDate.format('YYYY-MM-DD') + '">' +
      '<td class="' + (
        this.calendar.theme.getClass('tableListHeading') ||
        this.calendar.theme.getClass('widgetHeader')
      ) + '" colspan="3">' +
        (mainFormat ?
          this.buildGotoAnchorHtml(
            dayDate,
            { 'class': 'fc-list-heading-main' },
            htmlEscape(dayDate.format(mainFormat)) // inner HTML
          ) :
          '') +
        (altFormat ?
          this.buildGotoAnchorHtml(
            dayDate,
            { 'class': 'fc-list-heading-alt' },
            htmlEscape(dayDate.format(altFormat)) // inner HTML
          ) :
          '') +
      '</td>' +
    '</tr>'
  }

}

ListView.prototype.eventRendererClass = ListEventRenderer
ListView.prototype.eventPointingClass = ListEventPointing
