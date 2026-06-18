import { FormatterInput, createFormatter } from '../datelib/formatting'
import { createDuration } from '@full-ui/headless-calendar'
import { joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { parseDateSpan } from '../structs/date-span'
import { parseEventSource } from '../structs/event-source-parse'
import { parseEvent } from '../structs/event-parse'
import { eventTupleToStore } from '../structs/event-store'
import { ViewSpec } from '../structs/view-spec'
import { PointerDragEvent } from '../interactions/pointer'
import { triggerDateSelect, triggerDateUnselect } from '../calendar-utils'
import { hashValuesToArray } from '../util/object'
import { CalendarDataManager } from '../reducers/CalendarDataManager'
import { Action } from '../reducers/Action'
import { EventSource } from '../structs/event-source'
import { eventApiToStore, buildEventApis, EventImpl } from './EventImpl'
import { CalendarData } from '../reducers/data-types'
import { CalendarApi } from './CalendarApi'
import { ViewImpl } from './ViewImpl'
import { EventSourceImpl } from './EventSourceImpl'
import { warn } from '../util/warn'
import {
  CalendarOptions,
  CalendarListeners,
  DateInput,
  DurationInput,
  DateSpanInput,
  DateRangeInput,
  EventSourceInput,
  EventInput,
} from './structs'
import { NavButtonState, ButtonStateMap } from '../structs/button-state'
import { formatWithOrdinals } from '../util/misc'
import { CalendarOptionsRefined } from '../options'

export class CalendarApiImpl implements CalendarApi {
  currentDataManager?: CalendarDataManager // will be set by CalendarDataManager

  getCurrentData(): CalendarData {
    return this.currentDataManager!.getCurrentData()
  }

  dispatch(action: Action): void {
    this.currentDataManager!.dispatch(action)
  }

  get view(): ViewImpl { return this.getCurrentData().viewApi }

  batchRendering(callback: () => void): void { // subclasses should implement
    callback()
  }

  // Options
  // -----------------------------------------------------------------------------------------------------------------

  setOption<OptionName extends keyof CalendarOptions>(name: OptionName, val: CalendarOptions[OptionName]): void {
    this.dispatch({
      type: 'SET_OPTION',
      optionName: name,
      rawOptionValue: val,
    })
  }

  getOption<OptionName extends keyof CalendarOptions>(name: OptionName): CalendarOptions[OptionName] {
    return this.currentDataManager!.currentCalendarOptionsInput[name]
  }

  getAvailableLocaleCodes(): string[] {
    return Object.keys(this.getCurrentData().availableRawLocales)
  }

  // Trigger
  // -----------------------------------------------------------------------------------------------------------------

  on<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, handler: Required<CalendarListeners>[ListenerName]): void {
    let { currentDataManager } = this

    if (currentDataManager.currentCalendarOptionsRefiners[handlerName]) {
      currentDataManager.emitter.on(handlerName, handler)
    } else {
      warn(`Unknown listener \`${handlerName}\`.`)
    }
  }

  off<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, handler: Required<CalendarListeners>[ListenerName]): void {
    this.currentDataManager!.emitter.off(handlerName, handler)
  }

  // not meant for public use
  trigger<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, ...args: Parameters<Required<CalendarListeners>[ListenerName]>): void {
    this.currentDataManager!.emitter.trigger(handlerName, ...args)
  }

  // View
  // -----------------------------------------------------------------------------------------------------------------

  changeView(viewType: string, dateOrRange?: DateRangeInput | DateInput): void {
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
  zoomTo(dateMarker: Date, viewType?: string): void {
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
    let viewTypes = [].concat(
      toolbarConfig.header ? toolbarConfig.header.viewsWithButtons : [],
      toolbarConfig.footer ? toolbarConfig.footer.viewsWithButtons : [],
    )
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

  prev(): void {
    this.unselect()
    this.dispatch({ type: 'PREV' })
  }

  next(): void {
    this.unselect()
    this.dispatch({ type: 'NEXT' })
  }

  prevYear(): void {
    let state = this.getCurrentData()
    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.addYears(state.currentDate, -1),
    })
  }

  nextYear(): void {
    let state = this.getCurrentData()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.addYears(state.currentDate, 1),
    })
  }

  today(): void {
    let state = this.getCurrentData()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.nowManager.getDateMarker(),
    })
  }

  gotoDate(zonedDateInput: DateInput): void {
    let state = this.getCurrentData()

    this.unselect()
    this.dispatch({
      type: 'CHANGE_DATE',
      dateMarker: state.dateEnv.createMarker(zonedDateInput),
    })
  }

  incrementDate(deltaInput: DurationInput): void {
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

  getDate(): Date {
    let state = this.getCurrentData()
    return state.dateEnv.toDate(state.currentDate)
  }

  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------

  formatDate(d: DateInput, formatter: FormatterInput): string {
    let { dateEnv } = this.getCurrentData()

    return joinDateTimeFormatParts(
      dateEnv.formatToParts(
        dateEnv.createMarker(d),
        createFormatter(formatter),
      ),
    )
  }

  // `settings` is for formatter AND isEndExclusive
  formatRange(d0: DateInput, d1: DateInput, settings: any): string { // TODO: settings type
    let { dateEnv } = this.getCurrentData()

    return joinDateTimeFormatParts(
      dateEnv.formatRangeToParts(
        dateEnv.createMarker(d0),
        dateEnv.createMarker(d1),
        createFormatter(settings),
        settings,
      ),
    )
  }

  formatIso(d: DateInput, omitTime?: boolean): string {
    let { dateEnv } = this.getCurrentData()

    return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime })
  }

  // Date Selection / Event Selection / DayClick
  // -----------------------------------------------------------------------------------------------------------------

  select(dateOrObj: DateInput | any, endDate?: DateInput): void {
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

  unselect(pev?: PointerDragEvent): void {
    let state = this.getCurrentData()

    if (state.dateSelection) {
      this.dispatch({ type: 'UNSELECT_DATES' })
      triggerDateUnselect(pev, state)
    }
  }

  // Public Events API
  // -----------------------------------------------------------------------------------------------------------------

  addEvent(eventInput: EventInput, sourceInput?: EventSourceImpl | string | boolean): EventImpl | null {
    if (eventInput instanceof EventImpl) {
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

    if (sourceInput instanceof EventSourceImpl) {
      eventSource = sourceInput.internalEventSource
    } else if (typeof sourceInput === 'boolean') {
      if (sourceInput) { // true. part of the first event source
        [eventSource] = hashValuesToArray(state.eventSources)
      }
    } else if (sourceInput != null) { // an ID. accepts a number too
      let sourceApi = this.getEventSourceById(sourceInput) // TODO: use an internal function

      if (!sourceApi) {
        warn(`Unknown event source ID \`${sourceInput}\`.`) // TODO: test
        return null
      }
      eventSource = sourceApi.internalEventSource
    }

    let tuple = parseEvent(eventInput, eventSource, state, false)

    if (tuple) {
      let newEventApi = new EventImpl(
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

  private triggerEventAdd(eventApi: EventImpl): void {
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
  getEventById(id: string): EventImpl | null {
    let state = this.getCurrentData()
    let { defs, instances } = state.eventStore
    id = String(id)

    for (let defId in defs) {
      let def = defs[defId]

      if (def.publicId === id) {
        if (def.recurringDef) {
          return new EventImpl(state, def, null)
        }

        for (let instanceId in instances) {
          let instance = instances[instanceId]

          if (instance.defId === def.defId) {
            return new EventImpl(state, def, instance)
          }
        }
      }
    }

    return null
  }

  getEvents(): EventImpl[] {
    let currentData = this.getCurrentData()

    return buildEventApis(currentData.eventStore, currentData)
  }

  removeAllEvents(): void {
    this.dispatch({ type: 'REMOVE_ALL_EVENTS' })
  }

  // Public Event Sources API
  // -----------------------------------------------------------------------------------------------------------------

  getEventSources(): EventSourceImpl[] {
    let state = this.getCurrentData()
    let sourceHash = state.eventSources
    let sourceApis: EventSourceImpl[] = []

    for (let internalId in sourceHash) {
      sourceApis.push(new EventSourceImpl(state, sourceHash[internalId]))
    }

    return sourceApis
  }

  getEventSourceById(id: string): EventSourceImpl | null {
    let state = this.getCurrentData()
    let sourceHash = state.eventSources
    id = String(id)

    for (let sourceId in sourceHash) {
      if (sourceHash[sourceId].publicId === id) {
        return new EventSourceImpl(state, sourceHash[sourceId])
      }
    }

    return null
  }

  addEventSource(sourceInput: EventSourceInput): EventSourceImpl {
    let state = this.getCurrentData()

    if (sourceInput instanceof EventSourceImpl) {
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

      return new EventSourceImpl(state, eventSource)
    }

    return null
  }

  removeAllEventSources(): void {
    this.dispatch({ type: 'REMOVE_ALL_EVENT_SOURCES' })
  }

  refetchEvents(): void {
    this.dispatch({ type: 'FETCH_EVENT_SOURCES', isRefetch: true })
  }

  // Scroll
  // -----------------------------------------------------------------------------------------------------------------

  scrollToTime(timeInput: DurationInput): void {
    let time = createDuration(timeInput)

    if (time) {
      this.trigger('_timeScrollRequest', time)
    }
  }

  // Button State
  // -----------------------------------------------------------------------------------------------------------------

  getButtonState(): ButtonStateMap {
    const currentData = this.getCurrentData()
    const { toolbarProps } = currentData

    const options = currentData.calendarOptions
    const buttonConfigs = options.buttons || {}
    const viewSpecs = currentData.viewSpecs

    const currentUnit = currentData.viewSpec.singleUnit
    const currentHintOrdinal = [
      currentUnit ? getSingleUnitText(currentUnit, options) : '',
      currentUnit,
    ]

    const buttonState: ButtonStateMap = {
      today: {
        text: options.todayText,
        hint: formatWithOrdinals(options.todayHint, currentHintOrdinal, options.todayText),
        isDisabled: !toolbarProps.isTodayEnabled,
      } as NavButtonState,

      prev: {
        text: options.prevText,
        hint: formatWithOrdinals(options.prevHint, currentHintOrdinal, options.prevText),
        isDisabled: !toolbarProps.isPrevEnabled,
      } as NavButtonState,

      next: {
        text: options.nextText,
        hint: formatWithOrdinals(options.nextHint, currentHintOrdinal, options.nextText),
        isDisabled: !toolbarProps.isNextEnabled,
      } as NavButtonState,

      prevYear: {
        text: options.prevYearText,
        hint: formatWithOrdinals(options.prevHint, [options.yearText, 'year'], options.prevYearText),
        isDisabled: false,
      } as NavButtonState,

      nextYear: {
        text: options.prevYearText,
        hint: formatWithOrdinals(options.nextHint, [options.yearText, 'year'], options.nextYearText),
        isDisabled: false,
      } as NavButtonState,
    }

    for (const viewSpecName in viewSpecs) {
      const viewSpec = viewSpecs[viewSpecName]
      const { singleUnit } = viewSpec
      const buttonTextKey = viewSpec.optionDefaults.buttonTextKey

      const buttonText =
        buttonConfigs[viewSpecName]?.text ||
        (buttonTextKey ? options[buttonTextKey] : '') ||
        (singleUnit ? getSingleUnitText(singleUnit, options) : '') ||
        viewSpecName

      const buttonHint = formatWithOrdinals(
        options.viewHint,
        [buttonText, viewSpecName], // ordinal arguments
        buttonText, // fallback text
      )

      buttonState[viewSpecName] = {
        text: buttonText,
        hint: buttonHint,
      }
    }

    return buttonState
  }
}

function getSingleUnitText(singleUnit: string, options: CalendarOptionsRefined): string {
  return options[singleUnit + 'TextLong'] || options[singleUnit + 'Text']
}
