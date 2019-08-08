import {
  htmlToElement,
  createElement,
  htmlEscape,
  subtractInnerElHeight,
  View,
  ViewProps,
  ScrollComponent,
  DateMarker,
  addDays,
  startOfDay,
  createFormatter,
  DateRange,
  intersectRanges,
  DateProfileGenerator,
  DateProfile,
  buildGotoAnchorHtml,
  ComponentContext,
  ViewSpec,
  EventUiHash,
  EventRenderRange,
  sliceEventStore,
  EventStore,
  memoize,
  MemoizedRendering,
  memoizeRendering,
  Seg
} from '@fullcalendar/core'
import ListEventRenderer from './ListEventRenderer'

/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export default class ListView extends View {

  scroller: ScrollComponent
  contentEl: HTMLElement

  dayDates: DateMarker[] // TOOD: kill this. only have it because ListEventRenderer

  private computeDateVars = memoize(computeDateVars)
  private eventStoreToSegs = memoize(this._eventStoreToSegs)
  private renderContent: MemoizedRendering<[Seg[]]>


  constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement) {
    super(context, viewSpec, dateProfileGenerator, parentEl)

    let eventRenderer = this.eventRenderer = new ListEventRenderer(this)
    this.renderContent = memoizeRendering(
      eventRenderer.renderSegs.bind(eventRenderer),
      eventRenderer.unrender.bind(eventRenderer)
    )

    this.el.classList.add('fc-list-view')

    let listViewClassNames = (this.theme.getClass('listView') || '').split(' ') // wish we didn't have to do this
    for (let listViewClassName of listViewClassNames) {
      if (listViewClassName) { // in case input was empty string
        this.el.classList.add(listViewClassName)
      }
    }

    this.scroller = new ScrollComponent(
      'hidden', // overflow x
      'auto' // overflow y
    )

    this.el.appendChild(this.scroller.el)
    this.contentEl = this.scroller.el // shortcut

    context.calendar.registerInteractiveComponent(this, {
      el: this.el
      // TODO: make aware that it doesn't do Hits
    })
  }


  render(props: ViewProps) {
    let { dayDates, dayRanges } = this.computeDateVars(props.dateProfile)
    this.dayDates = dayDates

    this.renderContent(
      this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges)
    )
  }


  destroy() {
    super.destroy()

    this.renderContent.unrender()
    this.scroller.destroy() // will remove the Grid too
    this.calendar.unregisterInteractiveComponent(this)
  }


  updateSize(isResize, viewHeight, isAuto) {
    super.updateSize(isResize, viewHeight, isAuto)

    this.eventRenderer.computeSizes(isResize)
    this.eventRenderer.assignSizes(isResize)

    this.scroller.clear() // sets height to 'auto' and clears overflow

    if (!isAuto) {
      this.scroller.setHeight(this.computeScrollerHeight(viewHeight))
    }
  }


  computeScrollerHeight(viewHeight) {
    return viewHeight -
      subtractInnerElHeight(this.el, this.scroller.el) // everything that's NOT the scroller
  }


  _eventStoreToSegs(eventStore: EventStore, eventUiBases: EventUiHash, dayRanges: DateRange[]): Seg[] {
    return this.eventRangesToSegs(
      sliceEventStore(
        eventStore,
        eventUiBases,
        this.props.dateProfile.activeRange,
        this.nextDayThreshold
      ).fg,
      dayRanges
    )
  }


  eventRangesToSegs(eventRanges: EventRenderRange[], dayRanges: DateRange[]) {
    let segs = []

    for (let eventRange of eventRanges) {
      segs.push(...this.eventRangeToSegs(eventRange, dayRanges))
    }

    return segs
  }


  eventRangeToSegs(eventRange: EventRenderRange, dayRanges: DateRange[]) {
    let { dateEnv, nextDayThreshold } = this
    let range = eventRange.range
    let allDay = eventRange.def.allDay
    let dayIndex
    let segRange
    let seg
    let segs = []

    for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex++) {
      segRange = intersectRanges(range, dayRanges[dayIndex])

      if (segRange) {
        seg = {
          component: this,
          eventRange,
          start: segRange.start,
          end: segRange.end,
          isStart: eventRange.isStart && segRange.start.valueOf() === range.start.valueOf(),
          isEnd: eventRange.isEnd && segRange.end.valueOf() === range.end.valueOf(),
          dayIndex: dayIndex
        }

        segs.push(seg)

        // detect when range won't go fully into the next day,
        // and mutate the latest seg to the be the end.
        if (
          !seg.isEnd && !allDay &&
          dayIndex + 1 < dayRanges.length &&
          range.end <
            dateEnv.add(
              dayRanges[dayIndex + 1].start,
              nextDayThreshold
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


  // called by ListEventRenderer
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

        daySegs = this.eventRenderer.sortEventSegs(daySegs)

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
    let { dateEnv } = this
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
        buildGotoAnchorHtml(
          this,
          dayDate,
          { 'class': 'fc-list-heading-main' },
          htmlEscape(dateEnv.format(dayDate, mainFormat)) // inner HTML
        ) :
        '') +
      (altFormat ?
        buildGotoAnchorHtml(
          this,
          dayDate,
          { 'class': 'fc-list-heading-alt' },
          htmlEscape(dateEnv.format(dayDate, altFormat)) // inner HTML
        ) :
        '') +
    '</td>') as HTMLTableRowElement
  }

}

ListView.prototype.fgSegSelector = '.fc-list-item' // which elements accept event actions


function computeDateVars(dateProfile: DateProfile) {
  let dayStart = startOfDay(dateProfile.renderRange.start)
  let viewEnd = dateProfile.renderRange.end
  let dayDates: DateMarker[] = []
  let dayRanges: DateRange[] = []

  while (dayStart < viewEnd) {

    dayDates.push(dayStart)

    dayRanges.push({
      start: dayStart,
      end: addDays(dayStart, 1)
    })

    dayStart = addDays(dayStart, 1)
  }

  return { dayDates, dayRanges }
}
