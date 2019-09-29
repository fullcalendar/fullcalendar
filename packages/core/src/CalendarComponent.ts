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

  elClassNames: string[] = []
  savedScroll: any // hack
  isHeightAuto: boolean
  viewHeight: number

  private renderSkeleton = memoizeRendering(this._renderSkeleton, this._unrenderSkeleton)
  private renderToolbars = memoizeRendering(this._renderToolbars, this._unrenderToolbars, [ this.renderSkeleton ])
  private buildComponentContext = memoize(buildComponentContext)
  private buildViewPropTransformers = memoize(buildViewPropTransformers)


  constructor(el: HTMLElement) {
    super()

    this.el = el
    this.computeTitle = memoize(computeTitle)

    this.parseBusinessHours = memoize((input) => {
      return parseBusinessHours(input, this.context.calendar)
    })
  }

  render(props: CalendarComponentProps, context: ComponentContext) {
    this.freezeHeight()

    let title = this.computeTitle(props.dateProfile, props.viewSpec.options)

    this.renderSkeleton(context)
    this.renderToolbars(props.viewSpec, props.dateProfile, props.currentDate, title)
    this.renderView(props, title)

    this.updateSize()
    this.thawHeight()
  }

  destroy() {
    if (this.header) {
      this.header.destroy()
    }

    if (this.footer) {
      this.footer.destroy()
    }

    this.renderSkeleton.unrender() // will call destroyView

    super.destroy()
  }

  _renderSkeleton(context: ComponentContext) {
    this.updateElClassNames(context)

    prependToElement(
      this.el,
      this.contentEl = createElement('div', { className: 'fc-view-container' })
    )

    let { calendar } = context

    for (let modifyViewContainer of calendar.pluginSystem.hooks.viewContainerModifiers) {
      modifyViewContainer(this.contentEl, calendar)
    }
  }

  _unrenderSkeleton() {

    // weird to have this here
    if (this.view) {
      this.savedScroll = this.view.queryScroll()
      this.view.destroy()
      this.view = null
    }

    removeElement(this.contentEl)
    this.removeElClassNames()
  }

  removeElClassNames() {
    let classList = this.el.classList

    for (let className of this.elClassNames) {
      classList.remove(className)
    }

    this.elClassNames = []
  }

  updateElClassNames(context: ComponentContext) {
    this.removeElClassNames()

    let { theme, options } = context
    this.elClassNames = [
      'fc',
      'fc-' + options.dir,
      theme.getClass('widget')
    ]

    let classList = this.el.classList

    for (let className of this.elClassNames) {
      classList.add(className)
    }
  }

  _renderToolbars(viewSpec: ViewSpec, dateProfile: DateProfile, currentDate: DateMarker, title: string) {
    let { context, header, footer } = this
    let { options, calendar } = context
    let headerLayout = options.header
    let footerLayout = options.footer
    let { dateProfileGenerator } = this.props

    let now = calendar.getNow()
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
      if (!header) {
        header = this.header = new Toolbar('fc-header-toolbar')
        prependToElement(this.el, header.el)
      }
      header.receiveProps({
        layout: headerLayout,
        ...toolbarProps
      }, context)
    } else if (header) {
      header.destroy()
      header = this.header = null
    }

    if (footerLayout) {
      if (!footer) {
        footer = this.footer = new Toolbar('fc-footer-toolbar')
        appendToElement(this.el, footer.el)
      }
      footer.receiveProps({
        layout: footerLayout,
        ...toolbarProps
      }, context)
    } else if (footer) {
      footer.destroy()
      footer = this.footer = null
    }
  }

  _unrenderToolbars() {
    if (this.header) {
      this.header.destroy()
      this.header = null
    }
    if (this.footer) {
      this.footer.destroy()
      this.footer = null
    }
  }

  renderView(props: CalendarComponentProps, title: string) {
    let { view } = this
    let { calendar, options } = this.context
    let { viewSpec, dateProfileGenerator } = props

    if (!view || view.viewSpec !== viewSpec) {

      if (view) {
        view.destroy()
      }

      view = this.view = new viewSpec['class'](viewSpec, this.contentEl)

      if (this.savedScroll) {
        view.addScroll(this.savedScroll, true)
        this.savedScroll = null
      }
    }

    view.title = title // for the API

    let viewProps = {
      dateProfileGenerator,
      dateProfile: props.dateProfile,
      businessHours: this.parseBusinessHours(viewSpec.options.businessHours),
      eventStore: props.eventStore,
      eventUiBases: props.eventUiBases,
      dateSelection: props.dateSelection,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize
    }

    let transformers = this.buildViewPropTransformers(calendar.pluginSystem.hooks.viewPropsTransformers)

    for (let transformer of transformers) {
      __assign(
        viewProps,
        transformer.transform(viewProps, viewSpec, props, options)
      )
    }

    view.receiveProps(viewProps, this.buildComponentContext(this.context, viewSpec, view))
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------

  updateSize(isResize = false) {
    let { view } = this

    if (!view) {
      return // why?
    }

    if (isResize || this.isHeightAuto == null) {
      this.computeHeightVars()
    }

    view.updateSize(isResize, this.viewHeight, this.isHeightAuto)
    view.updateNowIndicator() // we need to guarantee this will run after updateSize
    view.popScroll(isResize)
  }

  computeHeightVars() {
    let { calendar } = this.context // yuck. need to handle dynamic options
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
function computeTitle(this: CalendarComponent, dateProfile, viewOptions) {
  let range: DateRange

  // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
  if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
    range = dateProfile.currentRange
  } else { // for day units or smaller, use the actual day range
    range = dateProfile.activeRange
  }

  return this.context.dateEnv.formatRange(
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


// build a context scoped to the view
function buildComponentContext(context: ComponentContext, viewSpec: ViewSpec, view: View) {
  return context.extend(viewSpec.options, view)
}


// Plugin
// -----------------------------------------------------------------------------------------------------------------

function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map(function(theClass) {
    return new theClass()
  })
}
