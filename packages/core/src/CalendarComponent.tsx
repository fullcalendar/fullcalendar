import ComponentContext, { ComponentContextType, buildContext } from './component/ComponentContext'
import { ViewSpec } from './structs/view-spec'
import { ViewProps } from './View'
import Toolbar from './Toolbar'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { rangeContainsMarker } from './datelib/date-range'
import { EventUiHash } from './component/event-ui'
import { parseBusinessHours } from './structs/business-hours'
import { memoize } from './util/memoize'
import { DateMarker } from './datelib/marker'
import { CalendarState } from './reducers/types'
import { ViewPropsTransformerClass } from './plugin-system'
import { __assign } from 'tslib'
import { h, Fragment, createRef } from './vdom'
import { BaseComponent } from './vdom-util'
import { buildDelegationHandler } from './util/dom-event'
import { capitaliseFirstLetter } from './util/misc'
import ViewContainer from './ViewContainer'
import { CssDimValue } from './scrollgrid/util'
import Theme from './theme/Theme'
import { getCanVGrowWithinCell } from './util/table-styling'
import { ViewComponent } from './structs/view-config'


export interface CalendarComponentProps extends CalendarState {
  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator // for the current view
  eventUiBases: EventUiHash
  title: string
  onClassNameChange?: (classNameHash) => void // will be fired with [] on cleanup
  onHeightChange?: (height: CssDimValue) => void // will be fired with '' on cleanup
}

interface CalendarComponentState {
  forPrint: boolean
}


export default class CalendarComponent extends BaseComponent<CalendarComponentProps, CalendarComponentState> {

  private buildViewContext = memoize(buildContext)
  private parseBusinessHours = memoize((input) => parseBusinessHours(input, this.context.calendar))
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
  render(props: CalendarComponentProps, state: CalendarComponentState, context: ComponentContext) {
    let { calendar, options, header, footer } = context

    let toolbarProps = this.buildToolbarProps(
      props.viewSpec,
      props.dateProfile,
      props.dateProfileGenerator,
      props.currentDate,
      calendar.getNow(),
      props.title
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
      this.reportClassNames(props.onClassNameChange, state.forPrint, options.dir, context.theme)
    }

    if (props.onHeightChange) {
      this.reportHeight(props.onHeightChange, calendarHeight)
    }

    return (
      <Fragment>
        {header &&
          <Toolbar
            ref={this.headerRef}
            extraClassName='fc-header-toolbar'
            model={header}
            { ...toolbarProps }
          />
        }
        <ViewContainer
          liquid={viewVGrow}
          height={viewHeight}
          aspectRatio={viewAspectRatio}
          onClick={this.handleNavLinkClick}
        >
          {this.renderView(props, this.context)}
          {this.buildAppendContent()}
        </ViewContainer>
        {footer &&
          <Toolbar
            ref={this.footerRef}
            extraClassName='fc-footer-toolbar'
            model={footer}
            { ...toolbarProps }
          />
        }
      </Fragment>
    )
  }


  componentDidMount() {
    window.addEventListener('beforeprint', this.handleBeforePrint)
    window.addEventListener('afterprint', this.handleAfterPrint)
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
    let { dateEnv, calendar } = this.context

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
    let { pluginHooks, calendar } = this.context

    return pluginHooks.viewContainerAppends.map(
      (buildAppendContent) => buildAppendContent(calendar)
    )
  }


  renderView(props: CalendarComponentProps, context: ComponentContext) {
    let { pluginHooks, options } = context
    let { viewSpec } = props

    let viewProps: ViewProps = {
      viewSpec,
      dateProfileGenerator: props.dateProfileGenerator,
      dateProfile: props.dateProfile,
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

    let viewContext = this.buildViewContext(
      context.calendar,
      context.pluginHooks,
      context.dateEnv,
      context.theme,
      context.view,
      viewSpec.options
    )

    let ViewComponent = viewSpec.component

    return (
      <ComponentContextType.Provider value={viewContext}>
        <ViewComponent
          ref={this.viewRef}
          { ...viewProps }
          />
      </ComponentContextType.Provider>
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


function reportClassNames(onClassNameChange, forPrint: boolean, dir: string, theme: Theme) {
  onClassNameChange(computeClassNames(forPrint, dir, theme))
}


// NOTE: can't have any empty! caller gets confused
function computeClassNames(forPrint: boolean, dir: string, theme: Theme) {
  let classNames: string[] = [
    'fc',
    forPrint ? 'fc-media-print' : 'fc-media-screen',
    'fc-dir-' + dir,
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
