import { Emitter } from './common/Emitter'
import { DateInput } from './datelib/env'
import { DateMarker } from './datelib/marker'
import { createFormatter } from './datelib/formatting'
import { createDuration, DurationInput } from './datelib/duration'
import { parseDateSpan, DateSpanInput } from './structs/date-span'
import { DateRangeInput } from './datelib/date-range'
import { EventSourceInput, parseEventSource } from './structs/event-source-parse'
import { EventInput, parseEvent } from './structs/event-parse'
import { CalendarState } from './reducers/CalendarState'
import { Action } from './reducers/Action'
import { EventSourceApi } from './api/EventSourceApi'
import { EventApi } from './api/EventApi'
import { ViewApi } from './ViewApi'
import { eventTupleToStore } from './structs/event-store'
import { ViewSpec } from './structs/view-spec'
import { __assign } from 'tslib'
import { PointerDragEvent } from './interactions/pointer'
import { getNow } from './reducers/current-date'
import { triggerDateSelect, triggerDateUnselect } from './calendar-utils'
import { CalendarStateReducer } from './reducers/CalendarStateReducer'


export class CalendarApi {

  // TODO: public should not use, only other iternals
  dispatch: (action: Action) => void
  getCurrentState: () => CalendarState
  emitter: Emitter

  get view(): ViewApi { return this.getCurrentState().viewApi } // for public API


  constructor(protected reducer: CalendarStateReducer) {
    this.dispatch = reducer.dispatch
    this.getCurrentState = reducer.getCurrentState
    this.emitter = reducer.emitter
  }


  batchRendering(callback: () => void) { // subclasses should implement
    callback()
  }


  updateSize() { // public
    this.emitter.trigger('_resize', true)
  }


  // Options
  // -----------------------------------------------------------------------------------------------------------------


  setOption(name: string, val) {
    this.dispatch({
      type: 'SET_OPTION',
      optionName: name,
      optionValue: val,
      isDynamic: true
    })
  }


  getOption(name: string) { // getter, used externally
    return this.getCurrentState().calendarOptions[name]
  }


  /*
  handles option changes (like a diff)
  */
  mutateOptions(updates, removals: string[] = [], isDynamic = false) {
    let state = this.getCurrentState()
    let changeHandlers = state.pluginHooks.optionChangeHandlers
    let normalUpdates = {}
    let specialUpdates = {}

    for (let optionName in updates) {
      if (changeHandlers[optionName]) {
        specialUpdates[optionName] = updates[optionName]
      } else {
        normalUpdates[optionName] = updates[optionName]
      }
    }

    this.batchRendering(() => {

      for (let optionName in updates) {
        this.dispatch({
          type: 'SET_OPTION',
          optionName,
          optionValue: updates[optionName],
          isDynamic
        })
      }

      for (let optionName of removals) {
        this.dispatch({
          type: 'SET_OPTION',
          optionName,
          optionValue: null,
          isDynamic
        })
      }

      // special updates
      for (let name in specialUpdates) {
        changeHandlers[name](specialUpdates[name], state)
      }
    })
  }


  getAvailableLocaleCodes() {
    return Object.keys(this.getCurrentState().availableRawLocales)
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
            optionValue: dateOrRange,
            isDynamic: true
          })

        } else {
          let { dateEnv } = this.getCurrentState()

          this.dispatch({
            type: 'CHANGE_VIEW_TYPE',
            viewType,
            dateMarker: dateEnv.createMarker(dateOrRange as DateInput)
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
    let state = this.getCurrentState()
    let spec

    viewType = viewType || 'day' // day is default zoom
    spec = state.viewSpecs[viewType] || this.getUnitViewSpec(viewType)

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
    let { viewSpecs, toolbarConfig } = this.getCurrentState()
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
    let state = this.getCurrentState()
    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.addYears(state.currentDate, -1)
    })
  }


  nextYear() {
    let state = this.getCurrentState()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.addYears(state.currentDate, 1)
    })
  }


  today() {
    let state = this.getCurrentState()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: getNow(state)
    })
  }


  gotoDate(zonedDateInput) {
    let state = this.getCurrentState()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.createMarker(zonedDateInput)
    })
  }


  incrementDate(deltaInput) { // is public facing
    let state = this.getCurrentState()
    let delta = createDuration(deltaInput)

    if (delta) { // else, warn about invalid input?
      this.unselect()
      this.dispatch({
        type: 'CHANGE_DATE',
        dateMarker: state.dateEnv.add(state.currentDate, delta)
      })
    }
  }


  // for external API
  getDate(): Date {
    let state = this.getCurrentState()
    return state.dateEnv.toDate(state.currentDate)
  }


  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------


  formatDate(d: DateInput, formatter): string {
    let { dateEnv } = this.getCurrentState()

    return dateEnv.format(
      dateEnv.createMarker(d),
      createFormatter(formatter)
    )
  }


  // `settings` is for formatter AND isEndExclusive
  formatRange(d0: DateInput, d1: DateInput, settings) {
    let { dateEnv, options } = this.getCurrentState()

    return dateEnv.formatRange(
      dateEnv.createMarker(d0),
      dateEnv.createMarker(d1),
      createFormatter(settings, options.defaultRangeSeparator),
      settings
    )
  }


  formatIso(d: DateInput, omitTime?: boolean) {
    let { dateEnv } = this.getCurrentState()

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
          end: null
        }
      }
    } else {
      selectionInput = {
        start: dateOrObj,
        end: endDate
      } as DateSpanInput
    }

    let state = this.getCurrentState()
    let selection = parseDateSpan(
      selectionInput,
      state.dateEnv,
      createDuration({ days: 1 }) // TODO: cache this?
    )

    if (selection) { // throw parse error otherwise?
      this.dispatch({ type: 'SELECT_DATES', selection })
      triggerDateSelect(selection, null, state)
    }
  }


  // public method
  unselect(pev?: PointerDragEvent) {
    let state = this.getCurrentState()

    if (state.dateSelection) {
      this.dispatch({ type: 'UNSELECT_DATES' })
      triggerDateUnselect(pev, state)
    }
  }


  // Public Events API
  // -----------------------------------------------------------------------------------------------------------------


  addEvent(eventInput: EventInput, sourceInput?: EventSourceApi | string | number): EventApi | null {

    if (eventInput instanceof EventApi) {
      let def = eventInput._def
      let instance = eventInput._instance
      let { eventStore } = this.getCurrentState()

      // not already present? don't want to add an old snapshot
      if (!eventStore.defs[def.defId]) {
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

    let state = this.getCurrentState()
    let tuple = parseEvent(eventInput, sourceId, state)

    if (tuple) {

      this.dispatch({
        type: 'ADD_EVENTS',
        eventStore: eventTupleToStore(tuple)
      })

      return new EventApi(
        state,
        tuple.def,
        tuple.def.recurringDef ? null : tuple.instance
      )
    }

    return null
  }


  // TODO: optimize
  getEventById(id: string): EventApi | null {
    let state = this.getCurrentState()
    let { defs, instances } = state.eventStore

    id = String(id)

    for (let defId in defs) {
      let def = defs[defId]

      if (def.publicId === id) {

        if (def.recurringDef) {
          return new EventApi(state, def, null)
        } else {

          for (let instanceId in instances) {
            let instance = instances[instanceId]

            if (instance.defId === def.defId) {
              return new EventApi(state, def, instance)
            }
          }
        }
      }
    }

    return null
  }


  getEvents(): EventApi[] {
    let state = this.getCurrentState()
    let { defs, instances } = state.eventStore
    let eventApis: EventApi[] = []

    for (let id in instances) {
      let instance = instances[id]
      let def = defs[instance.defId]

      eventApis.push(new EventApi(state, def, instance))
    }

    return eventApis
  }


  removeAllEvents() {
    this.dispatch({ type: 'REMOVE_ALL_EVENTS' })
  }


  // Public Event Sources API
  // -----------------------------------------------------------------------------------------------------------------


  getEventSources(): EventSourceApi[] {
    let state = this.getCurrentState()
    let sourceHash = state.eventSources
    let sourceApis: EventSourceApi[] = []

    for (let internalId in sourceHash) {
      sourceApis.push(new EventSourceApi(state, sourceHash[internalId]))
    }

    return sourceApis
  }


  getEventSourceById(id: string | number): EventSourceApi | null {
    let state = this.getCurrentState()
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
    let state = this.getCurrentState()

    if (sourceInput instanceof EventSourceApi) {

      // not already present? don't want to add an old snapshot
      if (!state.eventSources[sourceInput.internalEventSource.sourceId]) {
        this.dispatch({
          type: 'ADD_EVENT_SOURCES',
          sources: [ sourceInput.internalEventSource ]
        })
      }

      return sourceInput
    }

    let eventSource = parseEventSource(sourceInput, state)

    if (eventSource) { // TODO: error otherwise?
      this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: [ eventSource ] })

      return new EventSourceApi(state, eventSource)
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
