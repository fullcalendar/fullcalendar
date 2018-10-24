import Component, { ComponentContext } from './component/Component'
import { ViewSpec } from './structs/view-spec'
import View from './View'
import Toolbar from './Toolbar'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { prependToElement, createElement, removeElement, appendToElement, applyStyle } from './util/dom-manip'
import { rangeContainsMarker, DateRange } from './datelib/date-range';
import { assignTo } from './util/object';
import { EventStore } from './structs/event-store'
import { EventUiHash } from './component/event-rendering'
import { DateSpan } from './structs/date-span'
import { EventInteractionUiState } from './interactions/event-interaction-state'
import { BusinessHoursInput, parseBusinessHours } from './structs/business-hours'
import reselector from './util/reselector'
import { computeHeightAndMargins } from './util/dom-geom'
import { createFormatter } from './datelib/formatting'
import { diffWholeDays } from './datelib/marker'

export interface CalendarComponentProps {
  viewSpec: ViewSpec
  dateProfile: DateProfile | null // for the current view
  dateProfileGenerator: DateProfileGenerator // for the current view
  eventStore: EventStore
  eventUis: EventUiHash
  dateSelection: DateSpan | null
  eventSelection: string
  eventDrag: EventInteractionUiState | null
  eventResize: EventInteractionUiState | null
}

export default class CalendarComponent extends Component<CalendarComponentProps> {

  view: View
  header: Toolbar
  footer: Toolbar

  computeTitle: (dateProfile, viewOptions) => string
  parseBusinessHours: (input: BusinessHoursInput) => EventStore

  el: HTMLElement
  contentEl: HTMLElement

  isHeightAuto: boolean
  viewHeight: number


  constructor(context: ComponentContext, el: HTMLElement) {
    super(context)

    this.el = el

    prependToElement(
      el,
      this.contentEl = createElement('div', { className: 'fc-view-container' })
    )

    this.toggleElClassNames(true)

    this.computeTitle = reselector(computeTitle)

    this.parseBusinessHours = reselector((input) => {
      return parseBusinessHours(input, this.calendar)
    })
  }

  destroy() {
    if (this.header) {
      this.header.destroy()
    }

    if (this.footer) {
      this.footer.destroy()
    }

    if (this.view) {
      this.view.destroy()
    }

    removeElement(this.contentEl)
    this.toggleElClassNames(false)
    this.clearHeightVars()

    super.destroy()
  }

  toggleElClassNames(bool: boolean) {
    let classList = this.el.classList
    let dirClassName = 'fc-' + this.opt('dir')
    let themeClassName = this.theme.getClass('widget')

    if (bool) {
      classList.add('fc')
      classList.add(dirClassName)
      classList.add(themeClassName)
    } else {
      classList.remove('fc')
      classList.remove(dirClassName)
      classList.remove(themeClassName)
    }
  }

  render(props: CalendarComponentProps) {
    this.freezeContentHeight()

    let title = this.computeTitle(props.dateProfile, props.viewSpec.options)
    this.subrender('renderToolbars', [ props.viewSpec, props.dateProfile, props.dateProfileGenerator, title ])
    this.renderView(props, title)

    this.updateSize()
    this.thawContentHeight()
    this.view.popScroll()
  }

  renderToolbars(viewSpec: ViewSpec, dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator, title: string) {
    let headerLayout = this.opt('header')
    let footerLayout = this.opt('footer')

    let now = this.calendar.getNow()
    let todayInfo = dateProfileGenerator.build(now)
    let prevInfo = dateProfileGenerator.buildPrev(dateProfile)
    let nextInfo = dateProfileGenerator.buildNext(dateProfile)

    let toolbarProps = {
      title,
      activeButton: viewSpec.type,
      isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, now),
      isPrevEnabled: prevInfo.isValid,
      isNextEnabled: nextInfo.isValid
    }

    if (headerLayout) {
      if (!this.header) {
        this.header = new Toolbar(this.context, 'fc-header-toolbar')
        prependToElement(this.el, this.header.el)
      }
      this.header.receiveProps(
        assignTo({ layout: headerLayout }, toolbarProps)
      )
    } else if (this.header) {
      this.header.destroy()
      this.header = null
    }

    if (footerLayout) {
      if (!this.footer) {
        this.footer = new Toolbar(this.context, 'fc-footer-toolbar')
        appendToElement(this.el, this.footer.el)
      }
      this.footer.receiveProps(
        assignTo({ layout: footerLayout }, toolbarProps)
      )
    } else if (this.footer) {
      this.footer.destroy()
      this.footer = null
    }
  }

  renderView(props: CalendarComponentProps, title: string) {
    let { view } = this
    let { viewSpec, dateProfileGenerator } = props

    if (!view || view.viewSpec !== viewSpec) {

      if (view) {
        view.destroy()
      }

      view = this.view = new viewSpec['class'](
        {
          calendar: this.calendar,
          dateEnv: this.dateEnv,
          theme: this.theme,
          options: viewSpec.options
        },
        viewSpec,
        dateProfileGenerator,
        this.contentEl
      )
    }

    view.title = title // for the API

    view.receiveProps({
      dateProfile: props.dateProfile,
      businessHours: this.parseBusinessHours(viewSpec.options.businessHours),
      eventStore: props.eventStore,
      eventUis: props.eventUis,
      dateSelection: props.dateSelection,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize
    })
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------

  updateSize(isResize = false) {
    super.updateSize(isResize)

    if (isResize) {
      this.clearHeightVars()
    }

    if (this.isHeightAuto == null) {
      this.computeHeightVars()
    }

    this.view.updateHeight(this.viewHeight, this.isHeightAuto, isResize)
  }

  computeHeightVars() {
    let { calendar } = this // yuck. need to handle dynamic options
    let heightInput = calendar.opt('height')
    let contentHeightInput = calendar.opt('contentHeight')

    this.isHeightAuto = heightInput === 'auto' || contentHeightInput === 'auto'

    if (typeof contentHeightInput === 'number') { // exists and not 'auto'
      this.viewHeight = contentHeightInput
    } else if (typeof contentHeightInput === 'function') { // exists and is a function
      this.viewHeight = contentHeightInput()
    } else if (typeof heightInput === 'number') { // exists and not 'auto'
      this.viewHeight = heightInput - this.queryToolbarsHeight()
    } else if (typeof heightInput === 'function') { // exists and is a function
      this.viewHeight = heightInput() - this.queryToolbarsHeight()
    } else if (heightInput === 'parent') { // set to height of parent element
      this.viewHeight = (this.el.parentNode as HTMLElement).offsetHeight - this.queryToolbarsHeight()
    } else {
      this.viewHeight = Math.round(
        this.contentEl.offsetWidth /
        Math.max(this.opt('aspectRatio'), .5)
      )
    }
  }

  clearHeightVars() {
    this.isHeightAuto = null
    this.viewHeight = null
  }

  queryToolbarsHeight() {
    let height = 0

    if (this.header) {
      height += computeHeightAndMargins(this.header.el)
    }

    if (this.footer) {
      height += computeHeightAndMargins(this.footer.el)
    }

    return height
  }


  // Height "Freezing"
  // -----------------------------------------------------------------------------------------------------------------

  freezeContentHeight() {
    applyStyle(this.contentEl, {
      width: '100%',
      height: this.contentEl.offsetHeight,
      overflow: 'hidden'
    })
  }

  thawContentHeight() {
    applyStyle(this.contentEl, {
      width: '',
      height: '',
      overflow: ''
    })
  }

}


// Title and Date Formatting
// -----------------------------------------------------------------------------------------------------------------

// Computes what the title at the top of the calendar should be for this view
function computeTitle(dateProfile, viewOptions) {
  let range: DateRange

  // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
  if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
    range = dateProfile.currentRange
  } else { // for day units or smaller, use the actual day range
    range = dateProfile.activeRange
  }

  return this.dateEnv.formatRange(
    range.start,
    range.end,
    createFormatter(
      viewOptions.titleFormat || computeTitleFormat(dateProfile),
      viewOptions.titleRangeSeparator
    ),
    { isEndExclusive: dateProfile.isRangeAllDay }
  )
}


// Generates the format string that should be used to generate the title for the current date range.
// Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
function computeTitleFormat(dateProfile) {
  let currentRangeUnit = dateProfile.currentRangeUnit

  if (currentRangeUnit === 'year') {
    return { year: 'numeric' }
  } else if (currentRangeUnit === 'month') {
    return { year: 'numeric', month: 'long' } // like "September 2014"
  } else {
    let days = diffWholeDays(
      dateProfile.currentRange.start,
      dateProfile.currentRange.end
    )
    if (days !== null && days > 1) {
      // multi-day range. shorter, like "Sep 9 - 10 2014"
      return { year: 'numeric', month: 'short', day: 'numeric' }
    } else {
      // one day. longer, like "September 9 2014"
      return { year: 'numeric', month: 'long', day: 'numeric' }
    }
  }
}
