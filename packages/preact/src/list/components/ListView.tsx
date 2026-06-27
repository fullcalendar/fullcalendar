import type { EventRenderRange } from '../../component-util/event-rendering'
import { ViewApi } from '../../api/ViewApi'
import { joinClassNames } from '../../util/html'
import { addDays } from '@full-ui/headless-calendar'
import { ContentContainer } from '../../content-inject/ContentContainer'
import { DateComponent } from '../../component/DateComponent'
import type { DateMarker, DateRange } from '@full-ui/headless-calendar'
import type { DateProfile } from '../../DateProfileGenerator'
import type { EventRangeProps } from '../../component-util/event-rendering'
import type { EventStore } from '../../structs/event-store'
import type { EventUiHash } from '../../component-util/event-ui'
import { formatDayString } from '@full-ui/headless-calendar'
import { generateClassName } from '../../content-inject/ContentContainer'
import { getIsHeightAuto } from '../../scrollgrid/util'
import { intersectRanges } from '@full-ui/headless-calendar'
import { memoize } from '../../util/memoize'
import { NowTimer } from '../../NowTimer'
import { Scroller } from '../../scrollgrid/Scroller'
import { sliceEventStore } from '../../component-util/event-rendering'
import { startOfDay } from '@full-ui/headless-calendar'
import { ViewContainer } from '../../common/ViewContainer'
import type { ViewProps } from '../../component-util/View'
import classNames from '../../styles.module.css'
import { type ReactNode, type ReactElement } from 'react'
import { ListDay, ListSeg } from './ListDay'

export interface NoEventsInfo {
  text: string
  view: ViewApi
}

/*
Responsible for the scroller, and forwarding event-related actions into the "grid".
*/
export class ListView extends DateComponent<ViewProps> {
  // memo
  private computeDateVars = memoize(computeDateVars)
  private eventStoreToSegs = memoize(this._eventStoreToSegs)

  render() {
    let { props, context } = this
    let { options } = context

    let { dayDates, dayRanges } = this.computeDateVars(props.dateProfile)
    let eventSegs = this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges)
    let verticalScrolling = !props.forPrint && !getIsHeightAuto(options)

    return (
      <ViewContainer
        viewSpec={context.viewSpec}
        className={joinClassNames(props.className, classNames.flexCol)}
        elRef={this.setRootEl}
      >
        {eventSegs.length ? (
          <Scroller // TODO: don't need heavyweight component
            vertical={verticalScrolling}
            className={joinClassNames(
              classNames.flexCol,
              verticalScrolling ? classNames.liquid : '',
            )}
          >
            {this.renderSegList(eventSegs, dayDates)}
          </Scroller>
        ) : this.renderEmptyMessage()}

      </ViewContainer>
    )
  }

  setRootEl = (rootEl: HTMLElement | null) => {
    if (rootEl) {
      this.context.registerInteractiveComponent(this, {
        el: rootEl,
        disableHits: true, // HACK to not do date-clicking/selecting
      })
    } else {
      this.context.unregisterInteractiveComponent(this)
    }
  }

  renderEmptyMessage() {
    let { options, viewApi } = this.context
    let renderProps: NoEventsInfo = {
      text: options.noEventsText,
      view: viewApi,
    }

    return (
      <ContentContainer
        tag="div"
        attrs={{
          role: 'status', // does a polite announcement
        }}
        renderProps={renderProps}
        generatorName="noEventsContent"
        customGenerator={options.noEventsContent}
        defaultGenerator={renderNoEventsInner}
        classNameGenerator={options.noEventsClass}
        className={classNames.grow}
        didMount={options.noEventsDidMount}
        willUnmount={options.noEventsWillUnmount}
      >
        {(InnerContent) => (
          <InnerContent
            tag="div"
            className={generateClassName(options.noEventsInnerClass, renderProps)}
          />
        )}
      </ContentContainer>
    )
  }

  renderSegList(allSegs: (ListSeg & EventRangeProps)[], dayDates: DateMarker[]) {
    let { options } = this.context
    let segsByDay = groupSegsByDay(allSegs) // sparse array

    return (
      <div
        role="list"
        aria-labelledby={this.props.labelId}
        aria-label={this.props.labelStr}
        className={joinClassNames(
          classNames.flexCol,
          joinClassNames(options.listDaysClass),
        )}
      >
        <NowTimer unit="day">
          {(nowDate: DateMarker, todayRange: DateRange) => {
            const dayNodes: ReactElement[] = []
            const populatedDayCount = segsByDay.reduce(
              (count, daySegs) => count + (daySegs ? 1 : 0),
              0,
            )
            let populatedDayIndex = 0

            for (let dayIndex = 0; dayIndex < segsByDay.length; dayIndex += 1) {
              let daySegs = segsByDay[dayIndex]

              if (daySegs) { // sparse array, so might be undefined
                const dayDate = dayDates[dayIndex]
                const key = formatDayString(dayDate)
                const isFirst = populatedDayIndex === 0
                const isLast = populatedDayIndex === populatedDayCount - 1

                dayNodes.push(
                  <ListDay
                    key={key}
                    dayDate={dayDate}
                    nowDate={nowDate}
                    todayRange={todayRange}
                    segs={daySegs}
                    isFirst={isFirst}
                    isLast={isLast}
                    forPrint={this.props.forPrint}
                  />,
                )

                populatedDayIndex += 1
              }
            }

            return (
              <>{dayNodes}</>
            )
          }}
        </NowTimer>
      </div>
    )
  }

  _eventStoreToSegs(
    eventStore: EventStore,
    eventUiBases: EventUiHash,
    dayRanges: DateRange[],
  ): (ListSeg & EventRangeProps)[] {
    return this.eventRangesToSegs(
      sliceEventStore(
        eventStore,
        eventUiBases,
        // HACKY to reference internal state...
        this.props.dateProfile.activeRange,
        this.context.options.nextDayThreshold, // activates all-day slicing
      ).fg,
      dayRanges,
    )
  }

  eventRangesToSegs(
    fullDayEventRanges: EventRenderRange[],
    dayRanges: DateRange[],
  ): (ListSeg & EventRangeProps)[] {
    let segs: (ListSeg & EventRangeProps)[] = []

    for (let fullDayEventRange of fullDayEventRanges) {
      segs.push(...this.eventRangeToSegs(fullDayEventRange, dayRanges))
    }

    return segs
  }

  eventRangeToSegs(
    fullDayEventRange: EventRenderRange,
    dayRanges: DateRange[],
  ): (ListSeg & EventRangeProps)[] {
    let fullDayRange = fullDayEventRange.range
    let dayIndex: number
    let segs: (ListSeg & EventRangeProps)[] = []

    for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex += 1) {
      const slicedFullDayRange = intersectRanges(fullDayRange, dayRanges[dayIndex])

      if (slicedFullDayRange) {
        segs.push({
          eventRange: fullDayEventRange,
          slicedStart: slicedFullDayRange.start,
          slicedEnd: slicedFullDayRange.end,
          isStart: fullDayEventRange.isStart && fullDayRange.start.valueOf() === slicedFullDayRange.start.valueOf(),
          isEnd: fullDayEventRange.isEnd && fullDayRange.end.valueOf() === slicedFullDayRange.end.valueOf(),
          dayIndex,
        })
      }
    }

    return segs
  }
}

function renderNoEventsInner(renderProps: NoEventsInfo): ReactNode {
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
function groupSegsByDay(
  segs: (ListSeg & EventRangeProps)[],
): (ListSeg & EventRangeProps)[][] {
  let segsByDay: (ListSeg & EventRangeProps)[][] = [] // sparse array
  let i: number
  let seg: ListSeg & EventRangeProps

  for (i = 0; i < segs.length; i += 1) {
    seg = segs[i];
    (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = []))
      .push(seg)
  }

  return segsByDay
}
