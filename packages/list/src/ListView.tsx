import {
  h,
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
  VNode,
  sortEventSegs,
  getSegMeta,
  NowTimer,
  ViewRoot
} from '@fullcalendar/core'
import ListViewHeaderRow from './ListViewHeaderRow'
import ListViewEventRow from './ListViewEventRow'


/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export default class ListView extends View {

  private computeDateVars = memoize(computeDateVars)
  private eventStoreToSegs = memoize(this._eventStoreToSegs)


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let extraClassNames = [ 'fc-list-view' ]
    let themeClassName = context.theme.getClass('bordered')
    if (themeClassName) {
      extraClassNames.push(themeClassName)
    }

    let { dayDates, dayRanges } = this.computeDateVars(props.dateProfile)
    let eventSegs = this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges)

    return (
      <ViewRoot viewSpec={props.viewSpec} elRef={this.setRootEl}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} class={extraClassNames.concat(classNames).join(' ')}>
            <Scroller
              vGrow={!props.isHeightAuto}
              overflowX='hidden'
              overflowY='auto'
            >
              {eventSegs.length > 0 ?
                this.renderSegList(eventSegs, dayDates) :
                this.renderEmptyMessage()
              }
            </Scroller>
          </div>
        )}
      </ViewRoot>
    )
  }


  setRootEl = (rootEl: HTMLDivElement | null) => {
    if (rootEl) {
      this.context.calendar.registerInteractiveComponent(this, { // TODO: make aware that it doesn't do Hits
        el: rootEl
      })
    } else {
      this.context.calendar.unregisterInteractiveComponent(this)
    }
  }


  renderEmptyMessage() {
    return (
      <div class='fc-list-empty-wrap2'>
        <div class='fc-list-empty-wrap1'>
          <div class='fc-list-empty'>
            {this.context.options.noEventsMessage}
          </div>
        </div>
      </div>
    )
  }


  renderSegList(allSegs: Seg[], dayDates: DateMarker[]) {
    let { theme, eventOrderSpecs } = this.context
    let segsByDay = groupSegsByDay(allSegs) // sparse array

    return (
      <NowTimer unit='day' content={(nowDate: DateMarker, todayRange: DateRange) => {
        let innerNodes: VNode[] = []

        for (let dayIndex = 0; dayIndex < segsByDay.length; dayIndex++) {
          let daySegs = segsByDay[dayIndex]

          if (daySegs) { // sparse array, so might be undefined

            // append a day header
            innerNodes.push(
              <ListViewHeaderRow
                dayDate={dayDates[dayIndex]}
                todayRange={todayRange}
              />
            )

            daySegs = sortEventSegs(daySegs, eventOrderSpecs)

            for (let seg of daySegs) {
              innerNodes.push(
                <ListViewEventRow
                  seg={seg}
                  isDragging={false}
                  isResizing={false}
                  isDateSelecting={false}
                  isSelected={false}
                  {...getSegMeta(seg, todayRange, nowDate)}
                />
              )
            }
          }
        }

        return (
          <table class={'fc-list-table ' + theme.getClass('table')}>
            <tbody>{innerNodes}</tbody>
          </table>
        )
      }} />
    )
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


// Returns a sparse array of arrays, segs grouped by their dayIndex
function groupSegsByDay(segs) {
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
