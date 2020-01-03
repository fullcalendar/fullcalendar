import {
  h, createRef,
  View,
  ViewProps,
  Scroller,
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
  subrenderer,
  getViewClassNames
} from '@fullcalendar/core'
import ListViewEvents from './ListViewEvents'

/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export default class ListView extends View {

  private computeDateVars = memoize(computeDateVars)
  private eventStoreToSegs = memoize(this._eventStoreToSegs)
  private renderEvents = subrenderer(ListViewEvents)
  private scrollerElRef = createRef<HTMLDivElement>()
  private eventRenderer: ListViewEvents


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let classNames = getViewClassNames(props.viewSpec).concat('fc-list-view')
    let themeClassName = context.theme.getClass('listView')

    if (themeClassName) {
      classNames.push(themeClassName)
    }

    return (
      <div ref={this.setRootEl} class={classNames.join(' ')}>
        <Scroller
          elRef={this.scrollerElRef}
          vGrow={!props.isHeightAuto}
          overflowX='hidden'
          overflowY='auto'
        />
      </div>
    )
  }


  setRootEl = (rootEl: HTMLDivElement | null) => {
    if (rootEl) {
      this.context.calendar.registerInteractiveComponent(this, { // TODO: make aware that it doesn't do Hits
        el: rootEl
      })
    } else {
      this.context.calendar.unregisterInteractiveComponent(this)
      this.subrenderDestroy()
    }
  }


  componentDidMount() {
    this.subrender()
    this.handleSizing(false)
    this.context.addResizeHandler(this.handleSizing)
  }


  componentDidUpdate() {
    this.subrender()
    this.handleSizing(false)
  }


  componentWillUnmount() {
    this.context.removeResizeHandler(this.handleSizing)
  }


  subrender() {
    let { props } = this
    let { dayDates, dayRanges } = this.computeDateVars(props.dateProfile)

    this.eventRenderer = this.renderEvents({
      segs: this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges),
      dayDates,
      contentEl: this.scrollerElRef.current,
      selectedInstanceId: props.eventSelection, // TODO: rename
      hiddenInstances: // TODO: more convenient
        (props.eventDrag ? props.eventDrag.affectedEvents.instances : null) ||
        (props.eventResize ? props.eventResize.affectedEvents.instances : null),
      isDragging: false,
      isResizing: false,
      isSelecting: false
    })
  }


  handleSizing = (forced: boolean) => {
    this.eventRenderer.computeSizes(forced, this)
    this.eventRenderer.assignSizes(forced, this)
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
