import {
  subtractInnerElHeight,
  View,
  ViewProps,
  ScrollComponent,
  DateMarker,
  addDays,
  startOfDay,
  DateRange,
  intersectRanges,
  DateProfile,
  ComponentContext,
  EventUiHash,
  EventRenderRange,
  sliceEventStore,
  EventStore,
  memoize,
  Seg,
  ViewSpec,
  renderer,
  renderViewEl
} from '@fullcalendar/core'
import ListEventRenderer from './ListEventRenderer'

/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export default class ListView extends View {

  private computeDateVars = memoize(computeDateVars)
  private eventStoreToSegs = memoize(this._eventStoreToSegs)
  private renderSkeleton = renderer(renderSkeleton)
  private renderScroller = renderer(ScrollComponent)
  private renderEvents = renderer(ListEventRenderer)

  // for sizing
  private eventRenderer: ListEventRenderer
  private scroller: ScrollComponent


  render(props: ViewProps) {
    let { dayDates, dayRanges } = this.computeDateVars(props.dateProfile)

    let rootEl = this.renderSkeleton({
      viewSpec: props.viewSpec
    })

    this.scroller = this.renderScroller(rootEl, {
      overflowX: 'hidden',
      overflowY: 'auto'
    })

    this.eventRenderer = this.renderEvents({
      segs: this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges),
      dayDates,
      contentEl: this.scroller.el,
      selectedInstanceId: props.eventSelection, // TODO: rename
      hiddenInstances: // TODO: more convenient
        (props.eventDrag ? props.eventDrag.affectedEvents.instances : null) ||
        (props.eventResize ? props.eventResize.affectedEvents.instances : null)
    })

    return rootEl
  }


  componentDidMount() {
    this.context.calendar.registerInteractiveComponent(this, {
      el: this.mountedEls[0]
      // TODO: make aware that it doesn't do Hits
    })
  }


  componentWillUnmount() {
    this.context.calendar.unregisterInteractiveComponent(this)
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
      subtractInnerElHeight(this.mountedEls[0], this.scroller.el) // everything that's NOT the scroller
  }


  _eventStoreToSegs(eventStore: EventStore, eventUiBases: EventUiHash, dayRanges: DateRange[]): Seg[] {
    return this.eventRangesToSegs(
      sliceEventStore(
        eventStore,
        eventUiBases,
        this.props.dateProfile.activeRange,
        this.context.nextDayThreshold
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
    let { dateEnv, nextDayThreshold } = this.context
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

}

ListView.prototype.fgSegSelector = '.fc-list-item' // which elements accept event actions


function renderSkeleton(props: { viewSpec: ViewSpec }, context: ComponentContext) {
  let rootEl = renderViewEl(props.viewSpec.type)
  rootEl.classList.add('fc-list-view')

  let listViewClassNames = (context.theme.getClass('listView') || '').split(' ') // wish we didn't have to do this
  for (let listViewClassName of listViewClassNames) {
    if (listViewClassName) { // in case input was empty string
      rootEl.classList.add(listViewClassName)
    }
  }

  return rootEl
}


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
