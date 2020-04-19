import { Emitter } from './common/Emitter'
import { OptionsInput } from './types/input-types'
import { DateInput } from './datelib/env'
import { DateMarker, startOfDay } from './datelib/marker'
import { createFormatter } from './datelib/formatting'
import { createDuration, DurationInput } from './datelib/duration'
import { parseDateSpan, DateSpanInput, DateSpan, DateSpanApi, DatePointApi } from './structs/date-span'
import { DateRangeInput } from './datelib/date-range'
import { EventSourceInput, parseEventSource } from './structs/event-source'
import { EventInput, parseEvent } from './structs/event'
import { CalendarState, Action } from './reducers/types'
import { EventSourceApi } from './api/EventSourceApi'
import { EventApi } from './api/EventApi'
import { eventTupleToStore } from './structs/event-store'
import { ViewSpec } from './structs/view-spec'
import { CalendarComponent } from './CalendarComponent'
import { __assign } from 'tslib'
import { PointerDragEvent } from './interactions/pointer'
import { render, h, createRef, flushToDom } from './vdom'
import { TaskRunner, DelayedRunner } from './util/runner'
import { ViewApi } from './ViewApi'
import { guid } from './util/misc'
import { CssDimValue } from './scrollgrid/util'
import { applyStyleProp } from './util/dom-manip'
import { CalendarStateReducer } from './reducers/CalendarStateReducer'
import { getNow } from './reducers/current-date'
import { ReducerContext } from './reducers/ReducerContext'
import { triggerDateSelect, triggerDateUnselect } from './calendar-utils'


export interface DateClickApi extends DatePointApi {
  dayEl: HTMLElement
  jsEvent: UIEvent
  view: ViewApi
}

export interface DateSelectionApi extends DateSpanApi {
  jsEvent: UIEvent
  view: ViewApi
}

export type DatePointTransform = (dateSpan: DateSpan, context: ReducerContext) => any
export type DateSpanTransform = (dateSpan: DateSpan, context: ReducerContext) => any

export type CalendarInteraction = { destroy() }
export type CalendarInteractionClass = { new(context: ReducerContext): CalendarInteraction }

export type OptionChangeHandler = (propValue: any, context: ReducerContext) => void
export type OptionChangeHandlerMap = { [propName: string]: OptionChangeHandler }


export class Calendar {

  state: CalendarState = {} as any
  isRendering = false
  isRendered = false
  emitter = new Emitter(this)
  reducer: CalendarStateReducer
  renderRunner: DelayedRunner
  actionRunner: TaskRunner<Action> // guards against nested action calls
  el: HTMLElement
  currentClassNames: string[] = []
  componentRef = createRef<CalendarComponent>()

  // interaction
  calendarInteractions: CalendarInteraction[] // this tooooo

  get view() { return this.state.viewApi } // for public API


  constructor(el: HTMLElement, optionOverrides: OptionsInput = {}) {
    this.el = el

    this.reducer = new CalendarStateReducer()

    let renderRunner = this.renderRunner = new DelayedRunner(
      this.updateComponent.bind(this)
    )

    this.actionRunner = new TaskRunner( // do we really need this in a runner?
      this.runAction.bind(this),
      () => {
        renderRunner.request(this.state.options.rerenderDelay)
      }
    )

    this.dispatch({
      type: 'INIT',
      optionOverrides
    })

    this.calendarInteractions = this.state.pluginHooks.calendarInteractions
      .map((calendarInteractionClass) => {
        return new calendarInteractionClass(this.state)
      })
  }



  // Public API for rendering
  // -----------------------------------------------------------------------------------------------------------------


  render() {
    if (!this.isRendering) {
      this.isRendering = true
      this.renderRunner.request()
      window.addEventListener('resize', this.handleWindowResize)
    } else {
      // hack for RERENDERING
      this.setOption('renderId', guid())
    }
  }


  destroy() {
    if (this.isRendering) {
      this.isRendering = false
      this.renderRunner.request()
      this.resizeRunner.clear()
      window.removeEventListener('resize', this.handleWindowResize)
    }
  }


  // Dispatcher
  // -----------------------------------------------------------------------------------------------------------------


  dispatch = (action: Action) => {
    this.actionRunner.request(action)

    // actions we know we want to render immediately. TODO: another param in dispatch instead?
    switch (action.type) {
      case 'SET_EVENT_DRAG':
      case 'SET_EVENT_RESIZE':
        this.renderRunner.tryDrain()
    }
  }


  runAction(action: Action) {
    this.state = this.reducer.reduce(this.state, action, this.dispatch, this.emitter, this.getCurrentState, this)
  }


  getCurrentState = () => {
    return this.state
  }


  // Rendering
  // -----------------------------------------------------------------------------------------------------------------


  batchRendering(func) {
    this.renderRunner.pause('batchRendering')
    func()
    this.renderRunner.resume('batchRendering')
  }


  pauseRendering() { // available to plugins
    this.renderRunner.pause('pauseRendering')
  }


  resumeRendering() { // available to plugins
    this.renderRunner.resume('pauseRendering', true)
  }


  updateComponent() {
    if (this.isRendering) {
      this.renderComponent()
      this.isRendered = true
    } else {
      if (this.isRendered) {
        this.destroyComponent()
        this.isRendered = false
      }
    }
  }


  renderComponent() {
    let { state } = this
    let { viewType } = state
    let viewSpec = state.viewSpecs[viewType]

    render(
      <CalendarComponent
        ref={this.componentRef}
        { ...state }
        viewSpec={viewSpec}
        dateProfileGenerator={state.dateProfileGenerator}
        dateProfile={state.dateProfile}
        eventStore={state.renderableEventStore}
        eventUiBases={state.eventUiBases}
        dateSelection={state.dateSelection}
        eventSelection={state.eventSelection}
        eventDrag={state.eventDrag}
        eventResize={state.eventResize}
        onClassNameChange={this.handleClassNames}
        onHeightChange={this.handleHeightChange}
        toolbarConfig={state.toolbarConfig}
        emitter={this.emitter}
        calendar={this}
      />,
      this.el
    )
    flushToDom()
  }


  destroyComponent() {
    render(null, this.el)

    for (let interaction of this.calendarInteractions) {
      interaction.destroy()
    }

    this.emitter.trigger('_destroyed')
  }


  handleClassNames = (classNames: string[]) => {
    let { classList } = this.el

    for (let className of this.currentClassNames) {
      classList.remove(className)
    }

    for (let className of classNames) {
      classList.add(className)
    }

    this.currentClassNames = classNames
  }


  handleHeightChange = (height: CssDimValue) => {
    applyStyleProp(this.el, 'height', height)
  }


  // Options
  // -----------------------------------------------------------------------------------------------------------------


  setOption(name: string, val) {
    this.dispatch({
      type: 'SET_OPTION',
      optionName: name,
      optionValue: val
    })
  }


  getOption(name: string) { // getter, used externally
    return this.state.calendarOptions[name]
  }


  /*
  handles option changes (like a diff)
  */
  mutateOptions(updates, removals: string[] = [], isDynamic = false) {
    let changeHandlers = this.state.pluginHooks.optionChangeHandlers
    let normalUpdates = {}
    let specialUpdates = {}

    for (let name in updates) {
      if (changeHandlers[name]) {
        specialUpdates[name] = updates[name]
      } else {
        normalUpdates[name] = updates[name]
      }
    }

    this.batchRendering(() => {

      this.dispatch({
        type: 'MUTATE_OPTIONS',
        updates: normalUpdates,
        removals,
        isDynamic
      })

      // special updates
      for (let name in specialUpdates) {
        changeHandlers[name](specialUpdates[name], this.state)
      }
    })
  }


  getAvailableLocaleCodes() {
    return Object.keys(this.state.availableRawLocales)
  }


  // Trigger
  // -----------------------------------------------------------------------------------------------------------------


  on(handlerName: string, handler) {
    this.emitter.on(handlerName, handler)
  }


  off(handlerName: string, handler) {
    this.emitter.off(handlerName, handler)
  }


  // View
  // -----------------------------------------------------------------------------------------------------------------


  changeView(viewType: string, dateOrRange?: DateRangeInput | DateInput) {
    this.batchRendering(() => {
      this.unselect()

      if (dateOrRange) {

        if ((dateOrRange as DateRangeInput).start && (dateOrRange as DateRangeInput).end) { // a range
          this.dispatch({
            type: 'CHANGE_VIEW_TYPE',
            viewType,
          })
          this.dispatch({ // not very efficient to do two dispatches
            type: 'SET_OPTION',
            optionName: 'visibleRange',
            optionValue: dateOrRange
          })

        } else {
          this.dispatch({
            type: 'CHANGE_VIEW_TYPE',
            viewType,
            dateMarker: this.state.dateEnv.createMarker(dateOrRange as DateInput)
          })
        }

      } else {
        this.dispatch({
          type: 'CHANGE_VIEW_TYPE',
          viewType
        })
      }
    })
  }


  // Forces navigation to a view for the given date.
  // `viewType` can be a specific view name or a generic one like "week" or "day".
  // needs to change
  zoomTo(dateMarker: DateMarker, viewType?: string) {
    let spec

    viewType = viewType || 'day' // day is default zoom
    spec = this.state.viewSpecs[viewType] || this.getUnitViewSpec(viewType)

    this.unselect()

    if (spec) {
      this.dispatch({
        type: 'CHANGE_VIEW_TYPE',
        viewType: spec.type,
        dateMarker
      })

    } else {
      this.dispatch({
        type: 'CHANGE_DATE',
        dateMarker
      })
    }
  }


  // Given a duration singular unit, like "week" or "day", finds a matching view spec.
  // Preference is given to views that have corresponding buttons.
  private getUnitViewSpec(unit: string): ViewSpec | null {
    let { viewSpecs, toolbarConfig } = this.state
    let viewTypes = [].concat(toolbarConfig.viewsWithButtons)
    let i
    let spec

    for (let viewType in viewSpecs) {
      viewTypes.push(viewType)
    }

    for (i = 0; i < viewTypes.length; i++) {
      spec = viewSpecs[viewTypes[i]]
      if (spec) {
        if (spec.singleUnit === unit) {
          return spec
        }
      }
    }
  }


  // Current Date
  // -----------------------------------------------------------------------------------------------------------------


  prev() {
    this.unselect()
    this.dispatch({ type: 'PREV' })
  }


  next() {
    this.unselect()
    this.dispatch({ type: 'NEXT' })
  }


  prevYear() {
    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: this.state.dateEnv.addYears(this.state.currentDate, -1)
    })
  }


  nextYear() {
    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: this.state.dateEnv.addYears(this.state.currentDate, 1)
    })
  }


  today() {
    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: this.getNow()
    })
  }


  gotoDate(zonedDateInput) {
    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: this.state.dateEnv.createMarker(zonedDateInput)
    })
  }


  incrementDate(deltaInput) { // is public facing
    let delta = createDuration(deltaInput)

    if (delta) { // else, warn about invalid input?
      this.unselect()
      this.dispatch({
        type: 'CHANGE_DATE',
        dateMarker: this.state.dateEnv.add(this.state.currentDate, delta)
      })
    }
  }


  // for external API
  getDate(): Date {
    return this.state.dateEnv.toDate(this.state.currentDate)
  }


  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------


  formatDate(d: DateInput, formatter): string {
    let { dateEnv } = this.state

    return dateEnv.format(
      dateEnv.createMarker(d),
      createFormatter(formatter)
    )
  }


  // `settings` is for formatter AND isEndExclusive
  formatRange(d0: DateInput, d1: DateInput, settings) {
    let { dateEnv, options } = this.state

    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(settings, options.defaultRangeSeparator),
      settings
    )
  }


  formatIso(d: DateInput, omitTime?: boolean) {
    let { dateEnv } = this.state

    return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime })
  }


  // Sizing
  // -----------------------------------------------------------------------------------------------------------------


  updateSize() { // public
    this.emitter.trigger('_resize', true)
    flushToDom()
  }


  // RE-Sizing
  // -----------------------------------------------------------------------------------------------------------------


  resizeRunner = new DelayedRunner(() => {
    this.emitter.trigger('_resize', true) // should window resizes be considered "forced" ?
    this.emitter.trigger('windowResize')
  })


  handleWindowResize = (ev: UIEvent) => {
    let { options } = this.state

    if (
      options.handleWindowResize &&
      ev.target === window // avoid jqui events
    ) {
      this.resizeRunner.request(options.windowResizeDelay)
    }
  }


  // Date Selection / Event Selection / DayClick
  // -----------------------------------------------------------------------------------------------------------------


  // this public method receives start/end dates in any format, with any timezone
  // NOTE: args were changed from v3
  select(dateOrObj: DateInput | any, endDate?: DateInput) {
    let selectionInput: DateSpanInput

    if (endDate == null) {
      if (dateOrObj.start != null) {
        selectionInput = dateOrObj as DateSpanInput
      } else {
        selectionInput = {
          start: dateOrObj,
          end: null
        }
      }
    } else {
      selectionInput = {
        start: dateOrObj,
        end: endDate
      } as DateSpanInput
    }

    let selection = parseDateSpan(
      selectionInput,
      this.state.dateEnv,
      createDuration({ days: 1 }) // TODO: cache this?
    )

    if (selection) { // throw parse error otherwise?
      this.dispatch({ type: 'SELECT_DATES', selection })
      triggerDateSelect(selection, null, this.state)
    }
  }


  // public method
  unselect(pev?: PointerDragEvent) {
    if (this.state.dateSelection) {
      this.dispatch({ type: 'UNSELECT_DATES' })
      triggerDateUnselect(pev, this.state)
    }
  }


  // Date Utils
  // -----------------------------------------------------------------------------------------------------------------


  // Returns a DateMarker for the current date, as defined by the client's computer or from the `now` option
  // PRIVATE use only. doesn't zone the date.
  getNow(): DateMarker {
    return getNow(this.state.options, this.state.dateEnv)
  }


  // Event-Date Utilities
  // -----------------------------------------------------------------------------------------------------------------


  // Given an event's allDay status and start date, return what its fallback end date should be.
  // TODO: rename to computeDefaultEventEnd
  getDefaultEventEnd(allDay: boolean, marker: DateMarker): DateMarker {
    let end = marker

    if (allDay) {
      end = startOfDay(end)
      end = this.state.dateEnv.add(end, this.state.computedOptions.defaultAllDayEventDuration)
    } else {
      end = this.state.dateEnv.add(end, this.state.computedOptions.defaultTimedEventDuration)
    }

    return end
  }


  // Public Events API
  // -----------------------------------------------------------------------------------------------------------------


  addEvent(eventInput: EventInput, sourceInput?: EventSourceApi | string | number): EventApi | null {

    if (eventInput instanceof EventApi) {
      let def = eventInput._def
      let instance = eventInput._instance

      // not already present? don't want to add an old snapshot
      if (!this.state.eventStore.defs[def.defId]) {
        this.dispatch({
          type: 'ADD_EVENTS',
          eventStore: eventTupleToStore({ def, instance }) // TODO: better util for two args?
        })
      }

      return eventInput
    }

    let sourceId
    if (sourceInput instanceof EventSourceApi) {
      sourceId = sourceInput.internalEventSource.sourceId
    } else if (sourceInput != null) {
      let sourceApi = this.getEventSourceById(sourceInput) // TODO: use an internal function

      if (!sourceApi) {
        console.warn('Could not find an event source with ID "' + sourceInput + '"') // TODO: test
        return null
      } else {
        sourceId = sourceApi.internalEventSource.sourceId
      }
    }

    let tuple = parseEvent(eventInput, sourceId, this.state)

    if (tuple) {

      this.dispatch({
        type: 'ADD_EVENTS',
        eventStore: eventTupleToStore(tuple)
      })

      return new EventApi(
        this,
        tuple.def,
        tuple.def.recurringDef ? null : tuple.instance
      )
    }

    return null
  }


  // TODO: optimize
  getEventById(id: string): EventApi | null {
    let { defs, instances } = this.state.eventStore

    id = String(id)

    for (let defId in defs) {
      let def = defs[defId]

      if (def.publicId === id) {

        if (def.recurringDef) {
          return new EventApi(this, def, null)
        } else {

          for (let instanceId in instances) {
            let instance = instances[instanceId]

            if (instance.defId === def.defId) {
              return new EventApi(this, def, instance)
            }
          }
        }
      }
    }

    return null
  }


  getEvents(): EventApi[] {
    let { defs, instances } = this.state.eventStore
    let eventApis: EventApi[] = []

    for (let id in instances) {
      let instance = instances[id]
      let def = defs[instance.defId]

      eventApis.push(new EventApi(this, def, instance))
    }

    return eventApis
  }


  removeAllEvents() {
    this.dispatch({ type: 'REMOVE_ALL_EVENTS' })
  }


  // Public Event Sources API
  // -----------------------------------------------------------------------------------------------------------------


  getEventSources(): EventSourceApi[] {
    let sourceHash = this.state.eventSources
    let sourceApis: EventSourceApi[] = []

    for (let internalId in sourceHash) {
      sourceApis.push(new EventSourceApi(this, sourceHash[internalId]))
    }

    return sourceApis
  }


  getEventSourceById(id: string | number): EventSourceApi | null {
    let sourceHash = this.state.eventSources

    id = String(id)

    for (let sourceId in sourceHash) {
      if (sourceHash[sourceId].publicId === id) {
        return new EventSourceApi(this, sourceHash[sourceId])
      }
    }

    return null
  }


  addEventSource(sourceInput: EventSourceInput): EventSourceApi {

    if (sourceInput instanceof EventSourceApi) {

      // not already present? don't want to add an old snapshot
      if (!this.state.eventSources[sourceInput.internalEventSource.sourceId]) {
        this.dispatch({
          type: 'ADD_EVENT_SOURCES',
          sources: [ sourceInput.internalEventSource ]
        })
      }

      return sourceInput
    }

    let eventSource = parseEventSource(sourceInput, this.state)

    if (eventSource) { // TODO: error otherwise?
      this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: [ eventSource ] })

      return new EventSourceApi(this, eventSource)
    }

    return null
  }


  removeAllEventSources() {
    this.dispatch({ type: 'REMOVE_ALL_EVENT_SOURCES' })
  }


  refetchEvents() {
    this.dispatch({ type: 'FETCH_EVENT_SOURCES' })
  }


  // Scroll
  // -----------------------------------------------------------------------------------------------------------------

  scrollToTime(timeInput: DurationInput) {
    let time = createDuration(timeInput)

    if (time) {
      this.emitter.trigger('_scrollRequest', { time })
    }
  }

}
