import ComponentContext, { computeContextProps } from './component/ComponentContext'
import { Component, renderer, DomLocation } from './view-framework'
import { ViewSpec } from './structs/view-spec'
import View, { ViewProps } from './View'
import Toolbar from './Toolbar'
import DateProfileGenerator, { DateProfile } from './DateProfileGenerator'
import { createElement, applyStyle } from './util/dom-manip'
import { rangeContainsMarker } from './datelib/date-range'
import { EventUiHash } from './component/event-ui'
import { parseBusinessHours } from './structs/business-hours'
import { memoize } from './util/memoize'
import { computeHeightAndMargins } from './util/dom-geom'
import { DateMarker } from './datelib/marker'
import { CalendarState } from './reducers/types'
import { ViewPropsTransformerClass } from './plugin-system'
import { __assign } from 'tslib'
import { listRenderer } from './view-framework'


export type CalendarComponentProps = DomLocation & CalendarState & {
  viewSpec: ViewSpec
  dateProfileGenerator: DateProfileGenerator // for the current view
  eventUiBases: EventUiHash
  title: string
}

export default class CalendarComponent extends Component<CalendarComponentProps, ComponentContext> {

  view: View
  header: Toolbar
  footer: Toolbar
  viewContainerEl: HTMLElement
  isHeightAuto: boolean
  viewHeight: number

  private parseBusinessHours = memoize((input) => {
    return parseBusinessHours(input, this.context.calendar)
  })
  private computeViewContextProps = memoize(computeContextProps)
  private buildViewPropTransformers = memoize(buildViewPropTransformers)
  private updateClassNames = renderer(this._setClassNames, this._unsetClassNames)
  private renderViewContainer = renderer(this._renderViewContainer)
  private buildToolbarProps = memoize(this._buildToolbarProps)
  private renderHeader = renderer(Toolbar)
  private renderFooter = renderer(Toolbar)
  private renderViews = listRenderer()


  /*
  renders INSIDE of an outer div
  */
  render(props: CalendarComponentProps, context: ComponentContext) {
    let toolbarProps = this.buildToolbarProps(
      props.viewSpec,
      props.dateProfile,
      props.dateProfileGenerator,
      props.currentDate,
      context.calendar.getNow(),
      props.title
    )
    let innerEls: HTMLElement[] = []

    this.freezeHeight() // thawed after render
    this.updateClassNames(true)

    if (context.options.header) {
      let header = this.renderHeader({
        extraClassName: 'fc-header-toolbar',
        layout: context.options.header,
        ...toolbarProps
      })
      innerEls.push(header.rootEl)
    } else {
      this.renderHeader(false)
    }

    let viewContainerEl = this.renderViewContainer(true)
    this.renderView(props, viewContainerEl, context)
    innerEls.push(viewContainerEl)

    if (context.options.footer) {
      let footer = this.renderFooter({
        extraClassName: 'fc-footer-toolbar',
        layout: context.options.footer,
        ...toolbarProps
      })
      innerEls.push(footer.rootEl)
    } else {
      this.renderFooter(false)
    }

    this.viewContainerEl = viewContainerEl
    return innerEls
  }


  componentDidMount() {
    this.afterRender()
  }


  componentDidUpdate() {
    this.afterRender()
  }


  afterRender() {
    this.thawHeight()
    this.updateSize()
    this.context.calendar.releaseAfterSizingTriggers()
  }


  _setClassNames(props: {}, context: ComponentContext) {
    let classList = this.props.parentEl.classList
    let classNames: string[] = [
      'fc',
      'fc-' + context.options.dir,
      context.theme.getClass('widget')
    ]

    for (let className of classNames) {
      classList.add(className)
    }

    return classNames
  }


  _unsetClassNames(classNames: string[]) {
    let classList = this.props.parentEl.classList

    for (let className of classNames) {
      classList.remove(className)
    }
  }


  _renderViewContainer(props: {}, context: ComponentContext) {
    let viewContainerEl = createElement('div', { className: 'fc-view-container' })

    for (let modifyViewContainer of context.pluginHooks.viewContainerModifiers) {
      modifyViewContainer(viewContainerEl, context.calendar)
    }

    return viewContainerEl
  }


  _buildToolbarProps(
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


  renderView(props: CalendarComponentProps, viewContainerEl: HTMLElement, context: ComponentContext) {
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

    let views = this.renderViews({
      parentEl: viewContainerEl
    }, [
      {
        id: '',
        componentClass: viewSpec.class,
        props: viewProps
      }
    ], {
      ...context,
      options: viewSpec.options,
      ...this.computeViewContextProps(viewSpec.options)
    })

    this.view = views[0] as View
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  updateSize(isResize = false) {

    if (isResize || this.isHeightAuto == null) {
      this.computeHeightVars()
    }

    this.view.updateSize(isResize, this.viewHeight, this.isHeightAuto)
    this.view.updateNowIndicator() // we need to guarantee this will run after updateSize
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
      let parentEl = this.props.parentEl.parentNode as HTMLElement
      this.viewHeight = parentEl.getBoundingClientRect().height - this.queryToolbarsHeight()
    } else {
      this.viewHeight = Math.round(
        this.viewContainerEl.getBoundingClientRect().width /
        Math.max(calendar.opt('aspectRatio'), .5)
      )
    }
  }


  queryToolbarsHeight() {
    let height = 0

    if (this.header) {
      height += computeHeightAndMargins(this.header.rootEl)
    }

    if (this.footer) {
      height += computeHeightAndMargins(this.footer.rootEl)
    }

    return height
  }


  // Height "Freezing"
  // -----------------------------------------------------------------------------------------------------------------


  freezeHeight() {
    let rootEl = this.props.parentEl

    applyStyle(rootEl, {
      height: rootEl.getBoundingClientRect().height,
      overflow: 'hidden'
    })
  }


  thawHeight() {
    let rootEl = this.props.parentEl

    applyStyle(rootEl, {
      height: '',
      overflow: ''
    })
  }

}


// Plugin
// -----------------------------------------------------------------------------------------------------------------


function buildViewPropTransformers(theClasses: ViewPropsTransformerClass[]) {
  return theClasses.map(function(theClass) {
    return new theClass()
  })
}
