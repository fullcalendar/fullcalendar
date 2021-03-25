import { DateMarker } from './datelib/marker'
import { createFormatter } from './datelib/formatting'
import { createDuration } from './datelib/duration'
import { parseDateSpan } from './structs/date-span'
import { parseEventSource } from './structs/event-source-parse'
import { parseEvent } from './structs/event-parse'
import { eventTupleToStore } from './structs/event-store'
import { ViewSpec } from './structs/view-spec'
import { PointerDragEvent } from './interactions/pointer'
import { getNow } from './reducers/current-date'
import { triggerDateSelect, triggerDateUnselect } from './calendar-utils'
import { hashValuesToArray } from './util/object'
import { CalendarDataManager } from './reducers/CalendarDataManager'
import { Action } from './reducers/Action'
import { EventSource } from './structs/event-source'
import { eventApiToStore, buildEventApis } from './api/EventApi'

// public
import {
  CalendarOptions,
  CalendarListeners,
  DateInput,
  DurationInput,
  DateSpanInput,
  DateRangeInput,
  EventSourceInput,
  EventInput,
  EventSourceApi,
  EventApi,
  ViewApi,
} from './api-type-deps'

export class CalendarApi {
  currentDataManager?: CalendarDataManager // will be set by CalendarDataManager

  getCurrentData() {
    return this.currentDataManager!.getCurrentData()
  }

  dispatch(action: Action) {
    return this.currentDataManager!.dispatch(action)
  }

  get view(): ViewApi { return this.getCurrentData().viewApi } // for public API

  batchRendering(callback: () => void) { // subclasses should implement
    callback()
  }

  updateSize() { // public
    this.trigger('_resize', true)
  }

  // Options
  // -----------------------------------------------------------------------------------------------------------------

  setOption<OptionName extends keyof CalendarOptions>(name: OptionName, val: CalendarOptions[OptionName]) {
    this.dispatch({
      type: 'SET_OPTION',
      optionName: name,
      rawOptionValue: val,
    })
  }

  getOption<OptionName extends keyof CalendarOptions>(name: OptionName): CalendarOptions[OptionName] { // getter, used externally. WTF TS
    return this.currentDataManager!.currentCalendarOptionsInput[name]
  }

  getAvailableLocaleCodes() {
    return Object.keys(this.getCurrentData().availableRawLocales)
  }

  // Trigger
  // -----------------------------------------------------------------------------------------------------------------

  on<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, handler: CalendarListeners[ListenerName]) {
    let { currentDataManager } = this

    if (currentDataManager.currentCalendarOptionsRefiners[handlerName]) {
      currentDataManager.emitter.on(handlerName, handler)
    } else {
      console.warn(`Unknown listener name '${handlerName}'`)
    }
  }

  off<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, handler: CalendarListeners[ListenerName]) {
    this.currentDataManager!.emitter.off(handlerName, handler)
  }

  // not meant for public use
  trigger<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, ...args: Parameters<CalendarListeners[ListenerName]>) {
    this.currentDataManager!.emitter.trigger(handlerName, ...args)
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
            rawOptionValue: dateOrRange,
          })
        } else {
          let { dateEnv } = this.getCurrentData()

          this.dispatch({
            type: 'CHANGE_VIEW_TYPE',
            viewType,
            dateMarker: dateEnv.createMarker(dateOrRange as DateInput),
          })
        }
      } else {
        this.dispatch({
          type: 'CHANGE_VIEW_TYPE',
          viewType,
        })
      }
    })
  }

  // Forces navigation to a view for the given date.
  // `viewType` can be a specific view name or a generic one like "week" or "day".
  // needs to change
  zoomTo(dateMarker: DateMarker, viewType?: string) {
    let state = this.getCurrentData()
    let spec

    viewType = viewType || 'day' // day is default zoom
    spec = state.viewSpecs[viewType] || this.getUnitViewSpec(viewType)

    this.unselect()

    if (spec) {
      this.dispatch({
        type: 'CHANGE_VIEW_TYPE',
        viewType: spec.type,
        dateMarker,
      })
    } else {
      this.dispatch({
        type: 'CHANGE_DATE',
        dateMarker,
      })
    }
  }

  // Given a duration singular unit, like "week" or "day", finds a matching view spec.
  // Preference is given to views that have corresponding buttons.
  private getUnitViewSpec(unit: string): ViewSpec | null {
    let { viewSpecs, toolbarConfig } = this.getCurrentData()
    let viewTypes = [].concat(toolbarConfig.viewsWithButtons)
    let i
    let spec

    for (let viewType in viewSpecs) {
      viewTypes.push(viewType)
    }

    for (i = 0; i < viewTypes.length; i += 1) {
      spec = viewSpecs[viewTypes[i]]
      if (spec) {
        if (spec.singleUnit === unit) {
          return spec
        }
      }
    }

    return null
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
    let state = this.getCurrentData()
    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.addYears(state.currentDate, -1),
    })
  }

  nextYear() {
    let state = this.getCurrentData()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.addYears(state.currentDate, 1),
    })
  }

  today() {
    let state = this.getCurrentData()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: getNow(state.calendarOptions.now, state.dateEnv),
    })
  }

  gotoDate(zonedDateInput) {
    let state = this.getCurrentData()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.createMarker(zonedDateInput),
    })
  }

  incrementDate(deltaInput) { // is public facing
    let state = this.getCurrentData()
    let delta = createDuration(deltaInput)

    if (delta) { // else, warn about invalid input?
      this.unselect()
      this.dispatch({
        type: 'CHANGE_DATE',
        dateMarker: state.dateEnv.add(state.currentDate, delta),
      })
    }
  }

  // for external API
  getDate(): Date {
    let state = this.getCurrentData()
    return state.dateEnv.toDate(state.currentDate)
  }

  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------

  formatDate(d: DateInput, formatter): string {
    let { dateEnv } = this.getCurrentData()

    return dateEnv.format(
      dateEnv.createMarker(d),
      createFormatter(formatter),
    )
  }

  // `settings` is for formatter AND isEndExclusive
  formatRange(d0: DateInput, d1: DateInput, settings) {
    let { dateEnv } = this.getCurrentData()

    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(settings),
      settings,
    )
  }

  formatIso(d: DateInput, omitTime?: boolean) {
    let { dateEnv } = this.getCurrentData()

    return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime })
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
          end: null,
        }
      }
    } else {
      selectionInput = {
        start: dateOrObj,
        end: endDate,
      } as DateSpanInput
    }

    let state = this.getCurrentData()
    let selection = parseDateSpan(
      selectionInput,
      state.dateEnv,
      createDuration({ days: 1 }), // TODO: cache this?
    )

    if (selection) { // throw parse error otherwise?
      this.dispatch({ type: 'SELECT_DATES', selection })
      triggerDateSelect(selection, null, state)
    }
  }

  // public method
  unselect(pev?: PointerDragEvent) {
    let state = this.getCurrentData()

    if (state.dateSelection) {
      this.dispatch({ type: 'UNSELECT_DATES' })
      triggerDateUnselect(pev, state)
    }
  }

  // Public Events API
  // -----------------------------------------------------------------------------------------------------------------

  addEvent(eventInput: EventInput, sourceInput?: EventSourceApi | string | boolean): EventApi | null {
    if (eventInput instanceof EventApi) {
      let def = eventInput._def
      let instance = eventInput._instance
      let currentData = this.getCurrentData()

      // not already present? don't want to add an old snapshot
      if (!currentData.eventStore.defs[def.defId]) {
        this.dispatch({
          type: 'ADD_EVENTS',
          eventStore: eventTupleToStore({ def, instance }), // TODO: better util for two args?
        })
        this.triggerEventAdd(eventInput)
      }

      return eventInput
    }

    let state = this.getCurrentData()
    let eventSource: EventSource<any>

    if (sourceInput instanceof EventSourceApi) {
      eventSource = sourceInput.internalEventSource
    } else if (typeof sourceInput === 'boolean') {
      if (sourceInput) { // true. part of the first event source
        [eventSource] = hashValuesToArray(state.eventSources)
      }
    } else if (sourceInput != null) { // an ID. accepts a number too
      let sourceApi = this.getEventSourceById(sourceInput) // TODO: use an internal function

      if (!sourceApi) {
        console.warn(`Could not find an event source with ID "${sourceInput}"`) // TODO: test
        return null
      }
      eventSource = sourceApi.internalEventSource
    }

    let tuple = parseEvent(eventInput, eventSource, state, false)

    if (tuple) {
      let newEventApi = new EventApi(
        state,
        tuple.def,
        tuple.def.recurringDef ? null : tuple.instance,
      )
      this.dispatch({
        type: 'ADD_EVENTS',
        eventStore: eventTupleToStore(tuple),
      })
      this.triggerEventAdd(newEventApi)

      return newEventApi
    }

    return null
  }

  private triggerEventAdd(eventApi: EventApi) {
    let { emitter } = this.getCurrentData()

    emitter.trigger('eventAdd', {
      event: eventApi,
      relatedEvents: [],
      revert: () => {
        this.dispatch({
          type: 'REMOVE_EVENTS',
          eventStore: eventApiToStore(eventApi),
        })
      },
    })
  }

  // TODO: optimize
  getEventById(id: string): EventApi | null {
    let state = this.getCurrentData()
    let { defs, instances } = state.eventStore
    id = String(id)

    for (let defId in defs) {
      let def = defs[defId]

      if (def.publicId === id) {
        if (def.recurringDef) {
          return new EventApi(state, def, null)
        }

        for (let instanceId in instances) {
          let instance = instances[instanceId]

          if (instance.defId === def.defId) {
            return new EventApi(state, def, instance)
          }
        }
      }
    }

    return null
  }

  getEvents(): EventApi[] {
    let currentData = this.getCurrentData()

    return buildEventApis(currentData.eventStore, currentData)
  }

  removeAllEvents() {
    this.dispatch({ type: 'REMOVE_ALL_EVENTS' })
  }

  // Public Event Sources API
  // -----------------------------------------------------------------------------------------------------------------

  getEventSources(): EventSourceApi[] {
    let state = this.getCurrentData()
    let sourceHash = state.eventSources
    let sourceApis: EventSourceApi[] = []

    for (let internalId in sourceHash) {
      sourceApis.push(new EventSourceApi(state, sourceHash[internalId]))
    }

    return sourceApis
  }

  getEventSourceById(id: string): EventSourceApi | null {
    let state = this.getCurrentData()
    let sourceHash = state.eventSources
    id = String(id)

    for (let sourceId in sourceHash) {
      if (sourceHash[sourceId].publicId === id) {
        return new EventSourceApi(state, sourceHash[sourceId])
      }
    }

    return null
  }

  addEventSource(sourceInput: EventSourceInput): EventSourceApi {
    let state = this.getCurrentData()

    if (sourceInput instanceof EventSourceApi) {
      // not already present? don't want to add an old snapshot
      if (!state.eventSources[sourceInput.internalEventSource.sourceId]) {
        this.dispatch({
          type: 'ADD_EVENT_SOURCES',
          sources: [sourceInput.internalEventSource],
        })
      }

      return sourceInput
    }

    let eventSource = parseEventSource(sourceInput, state)

    if (eventSource) { // TODO: error otherwise?
      this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: [eventSource] })

      return new EventSourceApi(state, eventSource)
    }

    return null
  }

  removeAllEventSources() {
    this.dispatch({ type: 'REMOVE_ALL_EVENT_SOURCES' })
  }

  refetchEvents() {
    this.dispatch({ type: 'FETCH_EVENT_SOURCES', isRefetch: true })
  }

  // Scroll
  // -----------------------------------------------------------------------------------------------------------------

  scrollToTime(timeInput: DurationInput) {
    let time = createDuration(timeInput)

    if (time) {
      this.trigger('_scrollRequest', { time })
    }
  }
}
