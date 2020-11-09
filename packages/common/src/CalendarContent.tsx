import { __assign } from 'tslib'
import { ViewContextType, buildViewContext } from './ViewContext'
import { ViewSpec } from './structs/view-spec'
import { ViewProps } from './View'
import { Toolbar } from './Toolbar'
import { DateProfileGenerator, DateProfile } from './DateProfileGenerator'
import { rangeContainsMarker } from './datelib/date-range'
import { memoize } from './util/memoize'
import { DateMarker } from './datelib/marker'
import { CalendarData } from './reducers/data-types'
import { ViewPropsTransformerClass } from './plugin-system-struct'
import { createElement, createRef, VUIEvent, Fragment, VNode } from './vdom'
import { buildDelegationHandler } from './util/dom-event'
import { ViewContainer } from './ViewContainer'
import {
  Interaction,
  InteractionSettingsInput,
  InteractionClass,
  parseInteractionSettings,
  interactionSettingsStore,
} from './interactions/interaction'
import { DateComponent } from './component/DateComponent'
import { EventClicking } from './interactions/EventClicking'
import { EventHovering } from './interactions/EventHovering'
import { getNow } from './reducers/current-date'
import { CalendarInteraction } from './calendar-utils'
import { DelayedRunner } from './util/DelayedRunner'
import { PureComponent } from './vdom-util'

export interface CalendarContentProps extends CalendarData {
  forPrint: boolean
  isHeightAuto: boolean
}

export class CalendarContent extends PureComponent<CalendarContentProps> {
  private buildViewContext = memoize(buildViewContext)
  private buildViewPropTransformers = memoize(buildViewPropTransformers)
  private buildToolbarProps = memoize(buildToolbarProps)
  private handleNavLinkClick = buildDelegationHandler('a[data-navlink]', this._handleNavLinkClick.bind(this))
  private headerRef = createRef<Toolbar>()
  private footerRef = createRef<Toolbar>()
  private interactionsStore: { [componentUid: string]: Interaction[] } = {}
  private calendarInteractions: CalendarInteraction[]

  /*
  renders INSIDE of an outer div
  */
  render() {
    let { props } = this
    let { toolbarConfig, options } = props

    let toolbarProps = this.buildToolbarProps(
      props.viewSpec,
      props.dateProfile,
      props.dateProfileGenerator,
      props.currentDate,
      getNow(props.options.now, props.dateEnv), // TODO: use NowTimer????
      props.viewTitle,
    )

    let viewVGrow = false
    let viewHeight: string | number = ''
    let viewAspectRatio: number | undefined

    if (props.isHeightAuto || props.forPrint) {
      viewHeight = ''
    } else if (options.height != null) {
      viewVGrow = true
    } else if (options.contentHeight != null) {
      viewHeight = options.contentHeight
    } else {
      viewAspectRatio = Math.max(options.aspectRatio, 0.5) // prevent from getting too tall
    }

    let viewContext = this.buildViewContext(
      props.viewSpec,
      props.viewApi,
      props.options,
      props.dateProfileGenerator,
      props.dateEnv,
      props.theme,
      props.pluginHooks,
      props.dispatch,
      props.getCurrentData,
      props.emitter,
      props.calendarApi,
      this.registerInteractiveComponent,
      this.unregisterInteractiveComponent,
    )

    return (
      <ViewContextType.Provider value={viewContext}>
        {toolbarConfig.headerToolbar && (
          <Toolbar
            ref={this.headerRef}
            extraClassName="fc-header-toolbar"
            model={toolbarConfig.headerToolbar}
            {...toolbarProps}
          />
        )}
        <ViewContainer
          liquid={viewVGrow}
          height={viewHeight}
          aspectRatio={viewAspectRatio}
          onClick={this.handleNavLinkClick}
        >
          {this.renderView(props)}
          {this.buildAppendContent()}
        </ViewContainer>
        {toolbarConfig.footerToolbar && (
          <Toolbar
            ref={this.footerRef}
            extraClassName="fc-footer-toolbar"
            model={toolbarConfig.footerToolbar}
            {...toolbarProps}
          />
        )}
      </ViewContextType.Provider>
    )
  }

  componentDidMount() {
    let { props } = this

    this.calendarInteractions = props.pluginHooks.calendarInteractions
      .map((CalendarInteractionClass) => new CalendarInteractionClass(props))

    window.addEventListener('resize', this.handleWindowResize)

    let { propSetHandlers } = props.pluginHooks
    for (let propName in propSetHandlers) {
      propSetHandlers[propName](props[propName], props)
    }
  }

  componentDidUpdate(prevProps: CalendarContentProps) {
    let { props } = this

    let { propSetHandlers } = props.pluginHooks
    for (let propName in propSetHandlers) {
      if (props[propName] !== prevProps[propName]) {
        propSetHandlers[propName](props[propName], props)
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
    this.resizeRunner.clear()

    for (let interaction of this.calendarInteractions) {
      interaction.destroy()
    }

    this.props.emitter.trigger('_unmount')
  }

  _handleNavLinkClick(ev: VUIEvent, anchorEl: HTMLElement) {
    let { dateEnv, options, calendarApi } = this.props

    let navLinkOptions: any = anchorEl.getAttribute('data-navlink')
    navLinkOptions = navLinkOptions ? JSON.parse(navLinkOptions) : {}

    let dateMarker = dateEnv.createMarker(navLinkOptions.date)
    let viewType = navLinkOptions.type

    let customAction =
      viewType === 'day' ? options.navLinkDayClick :
        viewType === 'week' ? options.navLinkWeekClick : null

    if (typeof customAction === 'function') {
      customAction.call(calendarApi, dateEnv.toDate(dateMarker), ev)
    } else {
      if (typeof customAction === 'string') {
        viewType = customAction
      }

      calendarApi.zoomTo(dateMarker, viewType)
    }
  }

  buildAppendContent(): VNode {
    let { props } = this

    let children = props.pluginHooks.viewContainerAppends.map(
      (buildAppendContent) => buildAppendContent(props),
    )

    return createElement(Fragment, {}, ...children)
  }

  renderView(props: CalendarContentProps) {
    let { pluginHooks } = props
    let { viewSpec } = props

    let viewProps: ViewProps = {
      dateProfile: props.dateProfile,
      businessHours: props.businessHours,
      eventStore: props.renderableEventStore, // !
      eventUiBases: props.eventUiBases,
      dateSelection: props.dateSelection,
      eventSelection: props.eventSelection,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      isHeightAuto: props.isHeightAuto,
      forPrint: props.forPrint,
    }

    let transformers = this.buildViewPropTransformers(pluginHooks.viewPropsTransformers)

    for (let transformer of transformers) {
      __assign(
        viewProps,
        transformer.transform(viewProps, props),
      )
    }

    let ViewComponent = viewSpec.component

    return (
      <ViewComponent {...viewProps} />
    )
  }

  // Component Registration
  // -----------------------------------------------------------------------------------------------------------------

  registerInteractiveComponent = (component: DateComponent<any>, settingsInput: InteractionSettingsInput) => {
    let settings = parseInteractionSettings(component, settingsInput)
    let DEFAULT_INTERACTIONS: InteractionClass[] = [
      EventClicking,
      EventHovering,
    ]
    let interactionClasses: InteractionClass[] = DEFAULT_INTERACTIONS.concat(
      this.props.pluginHooks.componentInteractions,
    )
    let interactions = interactionClasses.map((TheInteractionClass) => new TheInteractionClass(settings))

    this.interactionsStore[component.uid] = interactions
    interactionSettingsStore[component.uid] = settings
  }

  unregisterInteractiveComponent = (component: DateComponent<any>) => {
    for (let listener of this.interactionsStore[component.uid]) {
      listener.destroy()
    }

    delete this.interactionsStore[component.uid]
    delete interactionSettingsStore[component.uid]
  }

  // Resizing
  // -----------------------------------------------------------------------------------------------------------------

  resizeRunner = new DelayedRunner(() => {
    this.props.emitter.trigger('_resize', true) // should window resizes be considered "forced" ?
    this.props.emitter.trigger('windowResize', { view: this.props.viewApi })
  })

  handleWindowResize = (ev: UIEvent) => {
    let { options } = this.props

    if (
      options.handleWindowResize &&
      ev.target === window // avoid jqui events
    ) {
      this.resizeRunner.request(options.windowResizeDelay)
    }
  }
}

function buildToolbarProps(
  viewSpec: ViewSpec,
  dateProfile: DateProfile,
  dateProfileGenerator: DateProfileGenerator,
  currentDate: DateMarker,
  now: DateMarker,
  title: string,
) {
  // don't force any date-profiles to valid date profiles (the `false`) so that we can tell if it's invalid
  let todayInfo = dateProfileGenerator.build(now, undefined, false) // TODO: need `undefined` or else INFINITE LOOP for some reason
  let prevInfo = dateProfileGenerator.buildPrev(dateProfile, currentDate, false)
  let nextInfo = dateProfileGenerator.buildNext(dateProfile, currentDate, false)

  return {
    title,
    activeButton: viewSpec.type,
    isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, now),
    isPrevEnabled: prevInfo.isValid,
    isNextEnabled: nextInfo.isValid,
  }
}

// Plugin
// -----------------------------------------------------------------------------------------------------------------

function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map((TheClass) => new TheClass())
}
