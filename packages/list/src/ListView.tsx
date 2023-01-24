import { ViewApi, EventRenderRange } from '@fullcalendar/core'
import {
  ViewProps,
  Scroller,
  DateMarker,
  addDays,
  startOfDay,
  DateRange,
  intersectRanges,
  DateProfile,
  EventUiHash,
  sliceEventStore,
  EventStore,
  memoize,
  Seg,
  sortEventSegs,
  getSegMeta,
  NowTimer,
  ViewContainer,
  DateComponent,
  MountArg,
  getUniqueDomId,
  formatDayString,
  ContentContainer,
} from '@fullcalendar/core/internal'
import {
  ComponentChild,
  createElement,
  VNode,
} from '@fullcalendar/core/preact'
import { ListViewHeaderRow } from './ListViewHeaderRow.js'
import { ListViewEventRow } from './ListViewEventRow.js'

export interface NoEventsContentArg {
  text: string
  view: ViewApi
}

export type NoEventsMountArg = MountArg<NoEventsContentArg>

/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export class ListView extends DateComponent<ViewProps> {
  private computeDateVars = memoize(computeDateVars)
  private eventStoreToSegs = memoize(this._eventStoreToSegs)
  state = {
    timeHeaderId: getUniqueDomId(),
    eventHeaderId: getUniqueDomId(),
    dateHeaderIdRoot: getUniqueDomId(),
  }

  render() {
    let { props, context } = this
    let { dayDates, dayRanges } = this.computeDateVars(props.dateProfile)
    let eventSegs = this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges)

    return (
      <ViewContainer
        elRef={this.setRootEl}
        elClasses={[
          'fc-list',
          context.theme.getClass('table'), // just for the outer border. will be on div
          context.options.stickyHeaderDates !== false ?
            'fc-list-sticky' :
            '',
        ]}
        viewSpec={context.viewSpec}
      >
        <Scroller
          liquid={!props.isHeightAuto}
          overflowX={props.isHeightAuto ? 'visible' : 'hidden'}
          overflowY={props.isHeightAuto ? 'visible' : 'auto'}
        >
          {eventSegs.length > 0 ?
            this.renderSegList(eventSegs, dayDates) :
            this.renderEmptyMessage()}
        </Scroller>
      </ViewContainer>
    )
  }

  setRootEl = (rootEl: HTMLElement | null) => {
    if (rootEl) {
      this.context.registerInteractiveComponent(this, { // TODO: make aware that it doesn't do Hits
        el: rootEl,
      })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }

  renderEmptyMessage() {
    let { options, viewApi } = this.context
    let renderProps: NoEventsContentArg = {
      text: options.noEventsText,
      view: viewApi,
    }

    return (
      <ContentContainer
        elTag="div"
        elClasses={['fc-list-empty']}
        renderProps={renderProps}
        generatorName="noEventsContent"
        customGenerator={options.noEventsContent}
        defaultGenerator={renderNoEventsInner}
        classNameGenerator={options.noEventsClassNames}
        didMount={options.noEventsDidMount}
        willUnmount={options.noEventsWillUnmount}
      >
        {(InnerContent) => (
          <InnerContent
            elTag="div"
            elClasses={['fc-list-empty-cushion']}
          />
        )}
      </ContentContainer>
    )
  }

  renderSegList(allSegs: Seg[], dayDates: DateMarker[]) {
    let { theme, options } = this.context
    let { timeHeaderId, eventHeaderId, dateHeaderIdRoot } = this.state
    let segsByDay = groupSegsByDay(allSegs) // sparse array

    return (
      <NowTimer unit="day">
        {(nowDate: DateMarker, todayRange: DateRange) => {
          let innerNodes: VNode[] = []

          for (let dayIndex = 0; dayIndex < segsByDay.length; dayIndex += 1) {
            let daySegs = segsByDay[dayIndex]

            if (daySegs) { // sparse array, so might be undefined
              let dayStr = formatDayString(dayDates[dayIndex])
              let dateHeaderId = dateHeaderIdRoot + '-' + dayStr

              // append a day header
              innerNodes.push(
                <ListViewHeaderRow
                  key={dayStr}
                  cellId={dateHeaderId}
                  dayDate={dayDates[dayIndex]}
                  todayRange={todayRange}
                />,
              )

              daySegs = sortEventSegs(daySegs, options.eventOrder)

              for (let seg of daySegs) {
                innerNodes.push(
                  <ListViewEventRow
                    key={dayStr + ':' + seg.eventRange.instance.instanceId /* are multiple segs for an instanceId */}
                    seg={seg}
                    isDragging={false}
                    isResizing={false}
                    isDateSelecting={false}
                    isSelected={false}
                    timeHeaderId={timeHeaderId}
                    eventHeaderId={eventHeaderId}
                    dateHeaderId={dateHeaderId}
                    {...getSegMeta(seg, todayRange, nowDate)}
                  />,
                )
              }
            }
          }

          return (
            <table className={'fc-list-table ' + theme.getClass('table')}>
              <thead>
                <tr>
                  <th scope="col" id={timeHeaderId}>{options.timeHint}</th>
                  <th scope="col" aria-hidden />
                  <th scope="col" id={eventHeaderId}>{options.eventHint}</th>
                </tr>
              </thead>
              <tbody>{innerNodes}</tbody>
            </table>
          )
        }}
      </NowTimer>
    )
  }

  _eventStoreToSegs(eventStore: EventStore, eventUiBases: EventUiHash, dayRanges: DateRange[]): Seg[] {
    return this.eventRangesToSegs(
      sliceEventStore(
        eventStore,
        eventUiBases,
        this.props.dateProfile.activeRange,
        this.context.options.nextDayThreshold,
      ).fg,
      dayRanges,
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
    let { nextDayThreshold } = this.context.options
    let range = eventRange.range
    let allDay = eventRange.def.allDay
    let dayIndex
    let segRange
    let seg
    let segs = []

    for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex += 1) {
      segRange = intersectRanges(range, dayRanges[dayIndex])

      if (segRange) {
        seg = {
          component: this,
          eventRange,
          start: segRange.start,
          end: segRange.end,
          isStart: eventRange.isStart && segRange.start.valueOf() === range.start.valueOf(),
          isEnd: eventRange.isEnd && segRange.end.valueOf() === range.end.valueOf(),
          dayIndex,
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
              nextDayThreshold,
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

function renderNoEventsInner(renderProps: NoEventsContentArg): ComponentChild {
  return renderProps.text
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
      end: addDays(dayStart, 1),
    })

    dayStart = addDays(dayStart, 1)
  }

  return { dayDates, dayRanges }
}

// Returns a sparse array of arrays, segs grouped by their dayIndex
function groupSegsByDay(segs): Seg[][] {
  let segsByDay = [] // sparse array
  let i
  let seg

  for (i = 0; i < segs.length; i += 1) {
    seg = segs[i];
    (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = []))
      .push(seg)
  }

  return segsByDay
}
