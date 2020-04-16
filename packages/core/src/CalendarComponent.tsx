import { ComponentContextType, buildViewContext } from './component/ComponentContext'
import { ViewSpec } from './structs/view-spec'
import { ViewProps } from './View'
import { Toolbar } from './Toolbar'
import { DateProfileGenerator, DateProfile } from './DateProfileGenerator'
import { rangeContainsMarker, DateRange } from './datelib/date-range'
import { EventUiHash } from './component/event-ui'
import { parseBusinessHours } from './structs/business-hours'
import { memoize } from './util/memoize'
import { DateMarker, diffWholeDays } from './datelib/marker'
import { CalendarState } from './reducers/types'
import { ViewPropsTransformerClass } from './plugin-system'
import { __assign } from 'tslib'
import { h, createRef, Component } from './vdom'
import { buildDelegationHandler } from './util/dom-event'
import { capitaliseFirstLetter } from './util/misc'
import { ViewContainer } from './ViewContainer'
import { CssDimValue } from './scrollgrid/util'
import { Theme } from './theme/Theme'
import { getCanVGrowWithinCell } from './util/table-styling'
import { ViewComponent } from './structs/view-config'
import { createFormatter } from './datelib/formatting'
import { DateEnv } from './datelib/env'
import { Calendar } from './Calendar'
import { EmitterMixin } from './common/EmitterMixin'


export interface CalendarComponentProps extends CalendarState {
  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator // for the current view
  eventUiBases: EventUiHash
  onClassNameChange?: (classNameHash) => void // will be fired with [] on cleanup
  onHeightChange?: (height: CssDimValue) => void // will be fired with '' on cleanup
  toolbarConfig
  emitter: EmitterMixin
  calendar: Calendar
}

interface CalendarComponentState {
  forPrint: boolean
}


export class CalendarComponent extends Component<CalendarComponentProps, CalendarComponentState> {

  context: never

  private computeTitle = memoize(computeTitle)
  private buildViewContext = memoize(buildViewContext)
  private parseBusinessHours = memoize((input) => parseBusinessHours(input, this.props.calendar))
  private buildViewPropTransformers = memoize(buildViewPropTransformers)
  private buildToolbarProps = memoize(buildToolbarProps)
  private reportClassNames = memoize(reportClassNames)
  private reportHeight = memoize(reportHeight)
  private handleNavLinkClick = buildDelegationHandler('a[data-navlink]', this._handleNavLinkClick.bind(this))
  private headerRef = createRef<Toolbar>()
  private footerRef = createRef<Toolbar>()
  private viewRef = createRef<ViewComponent>()

  get view() { return this.viewRef.current }

  state = {
    forPrint: false
  }


  /*
  renders INSIDE of an outer div
  */
  render(props: CalendarComponentProps, state: CalendarComponentState) {
    let { toolbarConfig, theme, dateEnv, options, calendar } = props
    let viewTitle = this.computeTitle(props.dateProfile, dateEnv, options)

    let toolbarProps = this.buildToolbarProps(
      props.viewSpec,
      props.dateProfile,
      props.dateProfileGenerator,
      props.currentDate,
      calendar.getNow(), // TODO: use NowTimer????
      viewTitle
    )

    let calendarHeight: string | number = ''
    let viewVGrow = false
    let viewHeight: string | number = ''
    let viewAspectRatio: number | undefined

    if (isHeightAuto(options)) {
      viewHeight = ''
    } else if (options.height != null) {
      calendarHeight = options.height
      viewVGrow = true
    } else if (options.contentHeight != null) {
      viewHeight = options.contentHeight
    } else {
      viewAspectRatio = Math.max(options.aspectRatio, 0.5) // prevent from getting too tall
    }

    if (props.onClassNameChange) {
      this.reportClassNames(props.onClassNameChange, state.forPrint, options.direction, theme)
    }

    if (props.onHeightChange) {
      this.reportHeight(props.onHeightChange, calendarHeight)
    }

    let viewContext = this.buildViewContext(
      props.viewSpec,
      viewTitle,
      props.dateProfile,
      props.dateProfileGenerator,
      props.dateEnv,
      props.pluginHooks,
      props.theme,
      props.calendar
    )

    return (
      <ComponentContextType.Provider value={viewContext}>
        {toolbarConfig.headerToolbar &&
          <Toolbar
            ref={this.headerRef}
            extraClassName='fc-header-toolbar'
            model={toolbarConfig.headerToolbar}
            { ...toolbarProps }
          />
        }
        <ViewContainer
          liquid={viewVGrow}
          height={viewHeight}
          aspectRatio={viewAspectRatio}
          onClick={this.handleNavLinkClick}
        >
          {this.renderView(props)}
          {this.buildAppendContent()}
        </ViewContainer>
        {toolbarConfig.footerToolbar &&
          <Toolbar
            ref={this.footerRef}
            extraClassName='fc-footer-toolbar'
            model={toolbarConfig.footerToolbar}
            { ...toolbarProps }
          />
        }
      </ComponentContextType.Provider>
    )
  }


  componentDidMount() {
    window.addEventListener('beforeprint', this.handleBeforePrint)
    window.addEventListener('afterprint', this.handleAfterPrint)

    this.props.emitter.trigger('datesDidUpdate')
  }


  componentDidUpdate(prevProps: CalendarComponentProps) {
    if (prevProps.dateProfile !== this.props.dateProfile) {
      this.props.emitter.trigger('datesDidUpdate')
    }
  }


  componentWillUnmount() {
    window.removeEventListener('beforeprint', this.handleBeforePrint)
    window.removeEventListener('afterprint', this.handleAfterPrint)

    if (this.props.onClassNameChange) {
      this.props.onClassNameChange([])
    }

    if (this.props.onHeightChange) {
      this.props.onHeightChange('')
    }
  }


  handleBeforePrint = () => {
    this.setState({ forPrint: true })
  }

  handleAfterPrint = () => {
    this.setState({ forPrint: false })
  }


  _handleNavLinkClick(ev: UIEvent, anchorEl: HTMLElement) {
    let { dateEnv, calendar } = this.props

    let navLinkOptions: any = anchorEl.getAttribute('data-navlink')
    navLinkOptions = navLinkOptions ? JSON.parse(navLinkOptions) : {}

    let dateMarker = dateEnv.createMarker(navLinkOptions.date)
    let viewType = navLinkOptions.type

    // property like "navLinkDayClick". might be a string or a function
    let customAction = calendar.viewOpt('navLink' + capitaliseFirstLetter(viewType) + 'Click')

    if (typeof customAction === 'function') {
      customAction(dateEnv.toDate(dateMarker), ev)

    } else {
      if (typeof customAction === 'string') {
        viewType = customAction
      }

      calendar.zoomTo(dateMarker, viewType)
    }
  }


  buildAppendContent() {
    let { pluginHooks, calendar } = this.props

    return pluginHooks.viewContainerAppends.map(
      (buildAppendContent) => buildAppendContent(calendar)
    )
  }


  renderView(props: CalendarComponentProps) {
    let { pluginHooks, options } = props
    let { viewSpec } = props

    let viewProps: ViewProps = {
      businessHours: this.parseBusinessHours(viewSpec.options.businessHours),
      eventStore: props.eventStore,
      eventUiBases: props.eventUiBases,
      dateSelection: props.dateSelection,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      isHeightAuto: this.state.forPrint || isHeightAuto(options),
      forPrint: this.state.forPrint
    }

    let transformers = this.buildViewPropTransformers(pluginHooks.viewPropsTransformers)

    for (let transformer of transformers) {
      __assign(
        viewProps,
        transformer.transform(viewProps, viewSpec, props, options)
      )
    }

    let ViewComponent = viewSpec.component

    return (
      <ViewComponent
        ref={this.viewRef}
        { ...viewProps }
      />
    )
  }


}


function buildToolbarProps(
  viewSpec: ViewSpec,
  dateProfile: DateProfile,
  dateProfileGenerator: DateProfileGenerator,
  currentDate: DateMarker,
  now: DateMarker,
  title: string
) {
  let todayInfo = dateProfileGenerator.build(now)
  let prevInfo = dateProfileGenerator.buildPrev(dateProfile, currentDate)
  let nextInfo = dateProfileGenerator.buildNext(dateProfile, currentDate)

  return {
    title,
    activeButton: viewSpec.type,
    isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, now),
    isPrevEnabled: prevInfo.isValid,
    isNextEnabled: nextInfo.isValid
  }
}


function isHeightAuto(options) {
  return options.height === 'auto' || options.contentHeight === 'auto'
}


// Outer Div Rendering
// -----------------------------------------------------------------------------------------------------------------


function reportClassNames(onClassNameChange, forPrint: boolean, direction: string, theme: Theme) {
  onClassNameChange(computeClassNames(forPrint, direction, theme))
}


// NOTE: can't have any empty! caller gets confused
function computeClassNames(forPrint: boolean, direction: string, theme: Theme) {
  let classNames: string[] = [
    'fc',
    forPrint ? 'fc-media-print' : 'fc-media-screen',
    'fc-direction-' + direction,
    theme.getClass('root')
  ]

  if (!getCanVGrowWithinCell()) {
    classNames.push('fc-liquid-hack')
  }

  return classNames
}


function reportHeight(onHeightChange, height: CssDimValue) {
  onHeightChange(height)
}



// Plugin
// -----------------------------------------------------------------------------------------------------------------


function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map(function(theClass) {
    return new theClass()
  })
}


// Title and Date Formatting
// -----------------------------------------------------------------------------------------------------------------


// Computes what the title at the top of the calendar should be for this view
function computeTitle(dateProfile, dateEnv: DateEnv, viewOptions) {
  let range: DateRange

  // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
  if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
    range = dateProfile.currentRange
  } else { // for day units or smaller, use the actual day range
    range = dateProfile.activeRange
  }

  return dateEnv.formatRange(
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
