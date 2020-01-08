import ComponentContext, { ComponentContextType, buildContext } from './component/ComponentContext'
import { ViewSpec } from './structs/view-spec'
import View, { ViewProps } from './View'
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
import { BaseComponent, subrenderer } from './vdom-util'
import { buildDelegationHandler } from './util/dom-event'
import { capitaliseFirstLetter } from './util/misc'
import { applyStyleProp } from './util/dom-manip'
import ViewContainer from './ViewContainer'


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
  private updateOuterClassNames = subrenderer(setClassNames, unsetClassNames)
  private updateOuterHeight = subrenderer(setHeight, unsetHeight)
  private handleNavLinkClick = buildDelegationHandler('a[data-goto]', this._handleNavLinkClick.bind(this))
  private headerRef = createRef<Toolbar>()
  private footerRef = createRef<Toolbar>()
  private viewRef = createRef<View>()

  get view() { return this.viewRef.current }


  /*
  renders INSIDE of an outer div
  */
  render(props: CalendarComponentProps, state: {}, context: ComponentContext) {
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
    let viewHeight: string | number = ''
    let viewAspectRatio: number | undefined

    if (isHeightAuto(options)) {
      viewHeight = 'auto'
      viewAspectRatio = options.aspectRatio
    } else if (options.height != null) {
      calendarHeight = options.height
    } else if (options.contentHeight != null) {
      viewHeight = options.contentHeight
    }

    // TODO: move this somewhere after real render!
    // move to Calendar class?
    this.updateOuterClassNames({ el: props.rootEl })
    this.updateOuterHeight({ el: props.rootEl, height: calendarHeight })

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
        <ViewContainer height={viewHeight} aspectRatio={viewAspectRatio} elRef={this.setViewContainerEl} onClick={this.handleNavLinkClick}>
          {this.renderView(props, this.context)}
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


  componentWillUnmount() {
    this.subrenderDestroy()
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
      eventResize: props.eventResize,
      isHeightAuto: isHeightAuto(options)
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


function setClassNames({ el }: { el: HTMLElement }, context: ComponentContext) {
  let classList = el.classList
  let classNames: string[] = [
    'fc',
    'fc-' + context.options.dir,
    context.theme.getClass('root')
  ]

  for (let className of classNames) {
    classList.add(className)
  }

  return { el, classNames }
}


function unsetClassNames({ el, classNames }: { el: HTMLElement, classNames: string[] }) {
  let classList = el.classList

  for (let className of classNames) {
    classList.remove(className)
  }
}


function setHeight({ el, height }: { el: HTMLElement, height: any }) {
  applyStyleProp(el, 'height', height)
  return el
}

function unsetHeight(el: HTMLElement) {
  applyStyleProp(el, 'height', '')
}



// Plugin
// -----------------------------------------------------------------------------------------------------------------


function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map(function(theClass) {
    return new theClass()
  })
}
