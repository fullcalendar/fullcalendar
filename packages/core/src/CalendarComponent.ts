import Component, { ComponentContext } from './component/Component'
import { ViewSpec } from './structs/view-spec'
import View from './View'
import Toolbar from './Toolbar'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { prependToElement, createElement, removeElement, appendToElement, applyStyle } from './util/dom-manip'
import { rangeContainsMarker, DateRange } from './datelib/date-range'
import { EventStore } from './structs/event-store'
import { EventUiHash } from './component/event-ui'
import { BusinessHoursInput, parseBusinessHours } from './structs/business-hours'
import { memoize } from './util/memoize'
import { computeHeightAndMargins } from './util/dom-geom'
import { createFormatter } from './datelib/formatting'
import { diffWholeDays, DateMarker } from './datelib/marker'
import { memoizeRendering } from './component/memoized-rendering'
import { CalendarState } from './reducers/types'
import { ViewPropsTransformerClass } from './plugin-system'
import { __assign } from 'tslib'

export interface CalendarComponentProps extends CalendarState {
  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator // for the current view
  eventUiBases: EventUiHash
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

  private _renderToolbars = memoizeRendering(this.renderToolbars)
  private buildViewPropTransformers = memoize(buildViewPropTransformers)


  constructor(context: ComponentContext, el: HTMLElement) {
    super(context)

    this.el = el

    prependToElement(
      el,
      this.contentEl = createElement('div', { className: 'fc-view-container' })
    )

    let { calendar } = this
    for (let modifyViewContainer of calendar.pluginSystem.hooks.viewContainerModifiers) {
      modifyViewContainer(this.contentEl, calendar)
    }

    this.toggleElClassNames(true)

    this.computeTitle = memoize(computeTitle)

    this.parseBusinessHours = memoize((input) => {
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
    this.freezeHeight()

    let title = this.computeTitle(props.dateProfile, props.viewSpec.options)
    this._renderToolbars(props.viewSpec, props.dateProfile, props.currentDate, props.dateProfileGenerator, title)
    this.renderView(props, title)

    this.updateSize()
    this.thawHeight()
  }

  renderToolbars(viewSpec: ViewSpec, dateProfile: DateProfile, currentDate: DateMarker, dateProfileGenerator: DateProfileGenerator, title: string) {
    let headerLayout = this.opt('header')
    let footerLayout = this.opt('footer')

    let now = this.calendar.getNow()
    let todayInfo = dateProfileGenerator.build(now)
    let prevInfo = dateProfileGenerator.buildPrev(dateProfile, currentDate)
    let nextInfo = dateProfileGenerator.buildNext(dateProfile, currentDate)

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
      this.header.receiveProps({
        layout: headerLayout,
        ...toolbarProps
      })
    } else if (this.header) {
      this.header.destroy()
      this.header = null
    }

    if (footerLayout) {
      if (!this.footer) {
        this.footer = new Toolbar(this.context, 'fc-footer-toolbar')
        appendToElement(this.el, this.footer.el)
      }
      this.footer.receiveProps({
        layout: footerLayout,
        ...toolbarProps
      })
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
          view: null, // HACK. will get populated by Component
          dateEnv: this.dateEnv,
          theme: this.theme,
          options: viewSpec.options
        },
        viewSpec,
        dateProfileGenerator,
        this.contentEl
      )
    } else {
      view.addScroll(view.queryScroll())
    }

    view.title = title // for the API

    let viewProps = {
      dateProfile: props.dateProfile,
      businessHours: this.parseBusinessHours(viewSpec.options.businessHours),
      eventStore: props.eventStore,
      eventUiBases: props.eventUiBases,
      dateSelection: props.dateSelection,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize
    }

    let transformers = this.buildViewPropTransformers(this.calendar.pluginSystem.hooks.viewPropsTransformers)

    for (let transformer of transformers) {
      __assign(
        viewProps,
        transformer.transform(viewProps, viewSpec, props, view)
      )
    }

    view.receiveProps(viewProps)
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------

  updateSize(isResize = false) {
    let { view } = this

    if (isResize) {
      view.addScroll(view.queryScroll())
    }

    if (isResize || this.isHeightAuto == null) {
      this.computeHeightVars()
    }

    view.updateSize(isResize, this.viewHeight, this.isHeightAuto)
    view.updateNowIndicator() // we need to guarantee this will run after updateSize
    view.popScroll(isResize)
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
      let parentEl = this.el.parentNode as HTMLElement
      this.viewHeight = parentEl.getBoundingClientRect().height - this.queryToolbarsHeight()
    } else {
      this.viewHeight = Math.round(
        this.contentEl.getBoundingClientRect().width /
        Math.max(calendar.opt('aspectRatio'), .5)
      )
    }
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

  freezeHeight() {
    applyStyle(this.el, {
      height: this.el.getBoundingClientRect().height,
      overflow: 'hidden'
    })
  }

  thawHeight() {
    applyStyle(this.el, {
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


// Plugin
// -----------------------------------------------------------------------------------------------------------------

function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map(function(theClass) {
    return new theClass()
  })
}
