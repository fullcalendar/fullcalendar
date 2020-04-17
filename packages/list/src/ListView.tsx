import {
  h,
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
  ViewRoot,
  RenderHook,
  DateComponent
} from '@fullcalendar/core'
import { ListViewHeaderRow } from './ListViewHeaderRow'
import { ListViewEventRow } from './ListViewEventRow'


/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export class ListView extends DateComponent<ViewProps> {

  private computeDateVars = memoize(computeDateVars)
  private eventStoreToSegs = memoize(this._eventStoreToSegs)


  render(props: ViewProps, state: {}, context: ComponentContext) {
    let extraClassNames = [
      'fc-list',
      context.theme.getClass('bordered'),
      context.options.stickyHeaderDates !== false ? 'fc-list-sticky' : ''
    ]

    let { dayDates, dayRanges } = this.computeDateVars(context.dateProfile)
    let eventSegs = this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges)

    return (
      <ViewRoot viewSpec={context.viewSpec} elRef={this.setRootEl}>
        {(rootElRef, classNames) => (
          <div ref={rootElRef} class={extraClassNames.concat(classNames).join(' ')}>
            <Scroller
              liquid={!props.isHeightAuto}
              overflowX={props.isHeightAuto ? 'visible' : 'hidden'}
              overflowY={props.isHeightAuto ? 'visible' : 'auto'}
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
    let { context } = this
    let hookProps = {
      text: context.options.noEventsText,
      view: context.viewApi
    }

    return (
      <RenderHook name='noEvents' hookProps={hookProps} defaultContent={renderNoEventsInner}>
        {(rootElRef, classNames, innerElRef, innerContent) => (
          <div className={[ 'fc-list-empty' ].concat(classNames).join(' ')} ref={rootElRef}>
            <div className='fc-list-empty-cushion' ref={innerElRef}>
              {innerContent}
            </div>
          </div>
        )}
      </RenderHook>
    )
  }


  renderSegList(allSegs: Seg[], dayDates: DateMarker[]) {
    let { theme, computedOptions } = this.context
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

            daySegs = sortEventSegs(daySegs, computedOptions.eventOrderSpecs)

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
        this.context.dateProfile.activeRange,
        this.context.computedOptions.nextDayThreshold
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
    let { dateEnv } = this.context
    let { nextDayThreshold } = this.context.computedOptions
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


function renderNoEventsInner(hookProps) {
  return hookProps.text
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
