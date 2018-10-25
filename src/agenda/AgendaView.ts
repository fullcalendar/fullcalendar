import { htmlEscape } from '../util/html'
import { copyOwnProps, assignTo } from '../util/object'
import { findElements, createElement } from '../util/dom-manip'
import {
  matchCellWidths,
  uncompensateScroll,
  compensateScroll,
  subtractInnerElHeight
} from '../util/misc'
import ScrollComponent from '../common/ScrollComponent'
import View from '../View'
import TimeGrid from './TimeGrid'
import DayGrid from '../basic/DayGrid'
import { createDuration } from '../datelib/duration'
import { createFormatter } from '../datelib/formatting'
import { EventStore, filterEventStoreDefs } from '../structs/event-store'
import { EventInteractionUiState } from '../interactions/event-interaction-state'
import reselector from '../util/reselector'
import { EventUiHash, hasBgRendering } from '../component/event-rendering'
import { buildGotoAnchorHtml, getAllDayHtml } from '../component/date-rendering'
import { DateComponentProps } from '../component/DateComponent'
import { DateMarker } from '../datelib/marker'

const AGENDA_ALL_DAY_EVENT_LIMIT = 5
const WEEK_HEADER_FORMAT = createFormatter({ week: 'short' })

let agendaTimeGridMethods
let agendaDayGridMethods


/* An abstract class for all agenda-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

export default class AgendaView extends View {

  // initialized after class
  timeGridClass: any // class used to instantiate the timeGrid. subclasses can override
  dayGridClass: any // class used to instantiate the dayGrid. subclasses can override

  timeGrid: TimeGrid // the main time-grid subcomponent of this view
  dayGrid: DayGrid // the "all-day" subcomponent. if all-day is turned off, this will be null

  scroller: ScrollComponent
  axisWidth: any // the width of the time axis running down the side

  // reselectors
  filterEventsForTimeGrid: any
  filterEventsForDayGrid: any
  buildEventDragForTimeGrid: any
  buildEventDragForDayGrid: any
  buildEventResizeForTimeGrid: any
  buildEventResizeForDayGrid: any


  initialize() {

    this.filterEventsForTimeGrid = reselector(filterEventsForTimeGrid)
    this.filterEventsForDayGrid = reselector(filterEventsForDayGrid)
    this.buildEventDragForTimeGrid = reselector(buildInteractionForTimeGrid)
    this.buildEventDragForDayGrid = reselector(buildInteractionForDayGrid)
    this.buildEventResizeForTimeGrid = reselector(buildInteractionForTimeGrid)
    this.buildEventResizeForDayGrid = reselector(buildInteractionForDayGrid)

    this.el.classList.add('fc-agenda-view')
    this.el.innerHTML = this.renderSkeletonHtml()

    this.scroller = new ScrollComponent(
      'hidden', // overflow x
      'auto' // overflow y
    )

    let timeGridWrapEl = this.scroller.el
    this.el.querySelector('.fc-body > tr > td').appendChild(timeGridWrapEl)
    timeGridWrapEl.classList.add('fc-time-grid-container')
    let timeGridEl = createElement('div', { className: 'fc-time-grid' })
    timeGridWrapEl.appendChild(timeGridEl)

    this.timeGrid = this.instantiateTimeGrid(
      this.el.querySelector('.fc-head-container'),
      timeGridEl
    )

    if (this.opt('allDaySlot')) { // should we display the "all-day" area?
      this.dayGrid = this.instantiateDayGrid( // the all-day subcomponent of this view
        null, // headContainerEl
        this.el.querySelector('.fc-day-grid')
      )

      // have the day-grid extend it's coordinate area over the <hr> dividing the two grids
      this.dayGrid.bottomCoordPadding = (this.el.querySelector('.fc-divider') as HTMLElement).offsetHeight
    }
  }


  destroy() {
    super.destroy()

    this.timeGrid.destroy()

    if (this.dayGrid) {
      this.dayGrid.destroy()
    }

    this.scroller.destroy()
  }


  // Instantiates the TimeGrid object this view needs. Draws from this.timeGridClass
  instantiateTimeGrid(headerContainerEl: HTMLElement, el: HTMLElement) {
    let timeGrid = new this.timeGridClass(this.context, headerContainerEl, el)
    copyOwnProps(agendaTimeGridMethods, timeGrid)
    return timeGrid
  }


  // Instantiates the DayGrid object this view might need. Draws from this.dayGridClass
  instantiateDayGrid(headerContainerEl: HTMLElement, el: HTMLElement) {
    let dayGrid = new this.dayGridClass(this.context, headerContainerEl, el)
    copyOwnProps(agendaDayGridMethods, dayGrid)
    return dayGrid
  }


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Builds the HTML skeleton for the view.
  // The day-grid and time-grid components will render inside containers defined by this HTML.
  renderSkeletonHtml() {
    let { theme } = this

    return '' +
      '<table class="' + theme.getClass('tableGrid') + '">' +
        (this.opt('columnHeader') ?
          '<thead class="fc-head">' +
            '<tr>' +
              '<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
            '</tr>' +
          '</thead>' :
          ''
          ) +
        '<tbody class="fc-body">' +
          '<tr>' +
            '<td class="' + theme.getClass('widgetContent') + '">' +
              (this.opt('allDaySlot') ?
                '<div class="fc-day-grid"></div>' +
                '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" />' :
                ''
                ) +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
  }


  // Generates an HTML attribute string for setting the width of the axis, if it is known
  axisStyleAttr() {
    if (this.axisWidth != null) {
      return 'style="width:' + this.axisWidth + 'px"'
    }
    return ''
  }


  /* Render Delegation
  ------------------------------------------------------------------------------------------------------------------*/


  render(props: DateComponentProps) {
    super.render(props)

    let allDaySeletion = null
    let timedSelection = null

    if (props.dateSelection) {
      if (props.dateSelection.allDay) {
        allDaySeletion = props.dateSelection
      } else {
        timedSelection = props.dateSelection
      }
    }

    this.timeGrid.receiveProps(
      assignTo({}, props, {
        eventStore: this.filterEventsForTimeGrid(props.eventStore, props.eventUis),
        dateSelection: timedSelection,
        eventDrag: this.buildEventDragForTimeGrid(props.eventDrag),
        eventResize: this.buildEventResizeForTimeGrid(props.eventResize)
      })
    )

    if (this.dayGrid) {
      this.dayGrid.receiveProps(
        assignTo({}, props, {
          eventStore: this.filterEventsForDayGrid(props.eventStore, props.eventUis),
          dateSelection: allDaySeletion,
          eventDrag: this.buildEventDragForDayGrid(props.eventDrag),
          eventResize: this.buildEventResizeForDayGrid(props.eventResize)
        })
      )
    }
  }


  /* Now Indicator
  ------------------------------------------------------------------------------------------------------------------*/


  getNowIndicatorUnit() {
    return this.timeGrid.getNowIndicatorUnit()
  }


  renderNowIndicator(date: DateMarker) {
    this.timeGrid.renderNowIndicator(date)
  }


  unrenderNowIndicator() {
    this.timeGrid.unrenderNowIndicator()
  }


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  updateSize(viewHeight: number, isAuto: boolean, isResize: boolean) {
    super.updateSize(viewHeight, isAuto, isResize) // will call updateBaseSize. important that executes first

    this.timeGrid.updateSize(viewHeight, isAuto, isResize)

    if (this.dayGrid) {
      this.dayGrid.updateSize(viewHeight, isAuto, isResize)
    }
  }


  // Adjusts the vertical dimensions of the view to the specified values
  updateBaseSize(viewHeight, isAuto, isResize) {
    let eventLimit
    let scrollerHeight
    let scrollbarWidths

    // make all axis cells line up, and record the width so newly created axis cells will have it
    this.axisWidth = matchCellWidths(findElements(this.el, '.fc-axis'))

    // hack to give the view some height prior to timeGrid's columns being rendered
    // TODO: separate setting height from scroller VS timeGrid.
    if (!this.timeGrid.colEls) {
      if (!isAuto) {
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }
      return
    }

    // set of fake row elements that must compensate when scroller has scrollbars
    let noScrollRowEls: HTMLElement[] = findElements(this.el, '.fc-row').filter((node) => {
      return !this.scroller.el.contains(node)
    })

    // reset all dimensions back to the original state
    this.timeGrid.bottomRuleEl.style.display = 'none' // will be shown later if this <hr> is necessary
    this.scroller.clear() // sets height to 'auto' and clears overflow
    noScrollRowEls.forEach(uncompensateScroll)

    // limit number of events in the all-day area
    if (this.dayGrid) {
      this.dayGrid.removeSegPopover() // kill the "more" popover if displayed

      eventLimit = this.opt('eventLimit')
      if (eventLimit && typeof eventLimit !== 'number') {
        eventLimit = AGENDA_ALL_DAY_EVENT_LIMIT // make sure "auto" goes to a real number
      }
      if (eventLimit) {
        this.dayGrid.limitRows(eventLimit)
      }
    }

    if (!isAuto) { // should we force dimensions of the scroll container?

      scrollerHeight = this.computeScrollerHeight(viewHeight)
      this.scroller.setHeight(scrollerHeight)
      scrollbarWidths = this.scroller.getScrollbarWidths()

      if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?

        // make the all-day and header rows lines up
        noScrollRowEls.forEach(function(rowEl) {
          compensateScroll(rowEl, scrollbarWidths)
        })

        // the scrollbar compensation might have changed text flow, which might affect height, so recalculate
        // and reapply the desired height to the scroller.
        scrollerHeight = this.computeScrollerHeight(viewHeight)
        this.scroller.setHeight(scrollerHeight)
      }

      // guarantees the same scrollbar widths
      this.scroller.lockOverflow(scrollbarWidths)

      // if there's any space below the slats, show the horizontal rule.
      // this won't cause any new overflow, because lockOverflow already called.
      if (this.timeGrid.getTotalSlatHeight() < scrollerHeight) {
        this.timeGrid.bottomRuleEl.style.display = ''
      }
    }
  }


  // given a desired total height of the view, returns what the height of the scroller should be
  computeScrollerHeight(viewHeight) {
    return viewHeight -
      subtractInnerElHeight(this.el, this.scroller.el) // everything that's NOT the scroller
  }


  /* Scroll
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes the initial pre-configured scroll state prior to allowing the user to change it
  computeInitialDateScroll() {
    let scrollTime = createDuration(this.opt('scrollTime'))
    let top = this.timeGrid.computeTimeTop(scrollTime.milliseconds)

    // zoom can give weird floating-point values. rather scroll a little bit further
    top = Math.ceil(top)

    if (top) {
      top++ // to overcome top border that slots beyond the first have. looks better
    }

    return { top: top }
  }


  queryDateScroll() {
    return { top: this.scroller.getScrollTop() }
  }


  applyDateScroll(scroll) {
    if (scroll.top !== undefined) {
      this.scroller.setScrollTop(scroll.top)
    }
  }

}


AgendaView.prototype.timeGridClass = TimeGrid
AgendaView.prototype.dayGridClass = DayGrid


// Will customize the rendering behavior of the AgendaView's timeGrid
agendaTimeGridMethods = {

  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntroHtml(this: TimeGrid) {
    let { view, theme, dateEnv } = this
    let weekStart = this.props.dateProfile.renderRange.start
    let weekText

    if (this.opt('weekNumbers')) {
      weekText = dateEnv.format(weekStart, WEEK_HEADER_FORMAT)

      return '' +
        '<th class="fc-axis fc-week-number ' + theme.getClass('widgetHeader') + '" ' + (view as AgendaView).axisStyleAttr() + '>' +
          buildGotoAnchorHtml( // aside from link, important for matchCellWidths
            view,
            { date: weekStart, type: 'week', forceOff: this.colCnt > 1 },
            htmlEscape(weekText) // inner HTML
          ) +
        '</th>'
    } else {
      return '<th class="fc-axis ' + theme.getClass('widgetHeader') + '" ' + (view as AgendaView).axisStyleAttr() + '></th>'
    }
  },


  // Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
  renderBgIntroHtml(this: TimeGrid) {
    let { view, theme } = this

    return '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + (view as AgendaView).axisStyleAttr() + '></td>'
  },


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderIntroHtml(this: TimeGrid) {
    let { view } = this

    return '<td class="fc-axis" ' + (view as AgendaView).axisStyleAttr() + '></td>'
  }

}


// Will customize the rendering behavior of the AgendaView's dayGrid
agendaDayGridMethods = {

  // Generates the HTML that goes before the all-day cells
  renderBgIntroHtml(this: DayGrid) {
    let { view, theme } = this

    return '' +
      '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + (view as AgendaView).axisStyleAttr() + '>' +
        '<span>' + // needed for matchCellWidths
          getAllDayHtml(view) +
        '</span>' +
      '</td>'
  },


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
  renderIntroHtml(this: DayGrid) {
    let { view } = this

    return '<td class="fc-axis" ' + (view as AgendaView).axisStyleAttr() + '></td>'
  }

}

function filterEventsForTimeGrid(eventStore: EventStore, eventUis: EventUiHash): EventStore {
  return filterEventStoreDefs(eventStore, function(eventDef) {
    return !eventDef.allDay || hasBgRendering(eventUis[eventDef.defId])
  })
}

function filterEventsForDayGrid(eventStore: EventStore, eventUis: EventUiHash): EventStore {
  return filterEventStoreDefs(eventStore, function(eventDef) {
    return eventDef.allDay
  })
}

function buildInteractionForTimeGrid(state: EventInteractionUiState): EventInteractionUiState {
  if (state) {
    return {
      affectedEvents: state.affectedEvents,
      mutatedEvents: filterEventsForTimeGrid(state.mutatedEvents, state.eventUis),
      eventUis: state.eventUis,
      isEvent: state.isEvent,
      origSeg: state.origSeg
    }
  }
  return null
}

function buildInteractionForDayGrid(state: EventInteractionUiState): EventInteractionUiState {
  if (state) {
    return {
      affectedEvents: state.affectedEvents,
      mutatedEvents: filterEventsForDayGrid(state.mutatedEvents, state.eventUis),
      eventUis: state.eventUis,
      isEvent: state.isEvent,
      origSeg: state.origSeg
    }
  }
  return null
}

AgendaView.prototype.usesMinMaxTime = true // indicates that minTime/maxTime affects rendering
