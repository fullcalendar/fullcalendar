import ComponentContext, { ComponentContextType, buildContext } from './component/ComponentContext'
import { ViewSpec } from './structs/view-spec'
import View, { ViewProps } from './View'
import Toolbar from './Toolbar'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { applyStyle } from './util/dom-manip'
import { rangeContainsMarker } from './datelib/date-range'
import { EventUiHash } from './component/event-ui'
import { parseBusinessHours } from './structs/business-hours'
import { memoize } from './util/memoize'
import { computeHeightAndMargins } from './util/dom-geom'
import { DateMarker } from './datelib/marker'
import { CalendarState } from './reducers/types'
import { ViewPropsTransformerClass } from './plugin-system'
import { __assign } from 'tslib'
import { h, Fragment, createRef } from './vdom'
import { BaseComponent, subrenderer } from './vdom-util'
import { buildDelegationHandler } from './util/dom-event'
import { capitaliseFirstLetter } from './util/misc'
import { DelayedRunner } from './util/runner'


export interface CalendarComponentProps extends CalendarState {
  rootEl: HTMLElement
  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator // for the current view
  eventUiBases: EventUiHash
  title: string
}

export default class CalendarComponent extends BaseComponent<CalendarComponentProps> {

  private buildViewContext = memoize(buildContext)
  private parseBusinessHours = memoize((input) => parseBusinessHours(input, this.context.calendar))
  private buildViewPropTransformers = memoize(buildViewPropTransformers)
  private buildToolbarProps = memoize(buildToolbarProps)
  private updateClassNames = subrenderer(setClassNames, unsetClassNames)
  private handleNavLinkClick = buildDelegationHandler('a[data-goto]', this._handleNavLinkClick.bind(this))

  headerRef = createRef<Toolbar>()
  footerRef = createRef<Toolbar>()
  viewRef = createRef<View>()
  viewContainerEl: HTMLElement

  isSizingDirty = false
  isHeightAuto: boolean
  viewHeight: number

  get view() { return this.viewRef.current }


  /*
  renders INSIDE of an outer div
  */
  render(props: CalendarComponentProps, state: {}, context: ComponentContext) {
    let { calendar, header, footer } = context

    let toolbarProps = this.buildToolbarProps(
      props.viewSpec,
      props.dateProfile,
      props.dateProfileGenerator,
      props.currentDate,
      calendar.getNow(),
      props.title
    )

    this.freezeHeight() // thawed after render
    this.isSizingDirty = true

    this.updateClassNames({ rootEl: props.rootEl })

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
        <div class='fc-view-container' ref={this.setViewContainerEl} onClick={this.handleNavLinkClick}>
          {this.renderView(props, this.context)}
        </div>
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


  resizeRunner = new DelayedRunner(() => {
    this.updateSize(true)
    let { calendar, view } = this.context
    calendar.publiclyTrigger('windowResize', [ view ])
  })


  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize)
  }


  componentWillUnmount() {
    this.subrenderDestroy()
    this.resizeRunner.clear()
    window.removeEventListener('resize', this.handleWindowResize)
  }


  handleWindowResize = (ev: UIEvent) => {
    if (ev.target === window) { // avoid jqui events
      let { options } = this.context
      this.resizeRunner.request(options.windowResizeDelay)
    }
  }


  _handleNavLinkClick(ev: UIEvent, anchorEl: HTMLElement) {
    let { dateEnv, calendar } = this.context

    let gotoOptions: any = anchorEl.getAttribute('data-goto')
    gotoOptions = gotoOptions ? JSON.parse(gotoOptions) : {}

    let dateMarker = dateEnv.createMarker(gotoOptions.date)
    let viewType = gotoOptions.type

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


  setViewContainerEl = (viewContainerEl: HTMLElement | null) => {
    let { pluginHooks, calendar } = this.context

    if (viewContainerEl) {
      this.viewContainerEl = viewContainerEl

      for (let modifyViewContainer of pluginHooks.viewContainerModifiers) {
        modifyViewContainer(viewContainerEl, calendar)
      }
    }
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
      eventResize: props.eventResize
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

    let ViewClass = viewSpec.class

    return (
      <ComponentContextType.Provider value={viewContext}>
        <ViewClass
          ref={this.viewRef}
          { ...viewProps }
          />
      </ComponentContextType.Provider>
    )
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  updateSize(isResize = false) {
    this.resizeRunner.whilePaused(() => {
      if (isResize || this.isSizingDirty) {

        if (isResize || this.isHeightAuto == null) {
          this.computeHeightVars()
        }

        let view = this.viewRef.current
        view.updateSize(isResize, this.viewHeight, this.isHeightAuto)
        view.updateNowIndicator()

        this.thawHeight()
        this.isSizingDirty = true
      }
    })
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
      let parentEl = this.props.rootEl.parentNode as HTMLElement
      this.viewHeight = parentEl.getBoundingClientRect().height - this.queryToolbarsHeight()
    } else {
      this.viewHeight = Math.round(
        this.viewContainerEl.getBoundingClientRect().width /
        Math.max(calendar.opt('aspectRatio'), .5)
      )
    }
  }


  queryToolbarsHeight() {
    let header = this.headerRef.current
    let footer = this.footerRef.current
    let height = 0

    if (header) {
      height += computeHeightAndMargins(header.rootEl)
    }

    if (footer) {
      height += computeHeightAndMargins(footer.rootEl)
    }

    return height
  }


  // Height "Freezing"
  // -----------------------------------------------------------------------------------------------------------------


  freezeHeight() {
    let { rootEl } = this.props

    applyStyle(rootEl, {
      height: rootEl.getBoundingClientRect().height,
      overflow: 'hidden'
    })
  }


  thawHeight() {
    let { rootEl } = this.props

    applyStyle(rootEl, {
      height: '',
      overflow: ''
    })
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


// Outer Div Rendering
// -----------------------------------------------------------------------------------------------------------------


function setClassNames({ rootEl }: { rootEl: HTMLElement }, context: ComponentContext) {
  let classList = rootEl.classList
  let classNames: string[] = [
    'fc',
    'fc-' + context.options.dir,
    context.theme.getClass('widget')
  ]

  for (let className of classNames) {
    classList.add(className)
  }

  return { rootEl, classNames }
}


function unsetClassNames({ rootEl, classNames }: { rootEl: HTMLElement, classNames: string[] }) {
  let classList = rootEl.classList

  for (let className of classNames) {
    classList.remove(className)
  }
}


// Plugin
// -----------------------------------------------------------------------------------------------------------------


function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map(function(theClass) {
    return new theClass()
  })
}
