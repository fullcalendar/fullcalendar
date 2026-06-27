import { ClassNameGenerator, ContentGenerator, DidMountHandler, WillUnmountHandler } from '../common/render-hook'
import { DayHeaderInfo } from '../render-hook-misc'
import { buildDateStr, buildNavLinkAttrs } from '../common/nav-link'
import { computeMajorUnit, isMajorUnit } from '../DateProfileGenerator'
import { DateFormatter, DateMarker, DateRange, addDays, formatDayString, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { DateMeta, getDateMeta } from '../component-util/date-rendering'
import { DateProfile } from '../DateProfileGenerator'
import { Dictionary } from '../options'
import { WEEKDAY_ONLY_FORMAT } from '../util/date-format'
import { ViewContext } from '../ViewContext'

/*
Just for the HEADER
*/
export interface CellRenderConfig<BaseRenderProps, RenderProps = BaseRenderProps> {
  generatorName: string
  customGenerator: ContentGenerator<RenderProps>
  innerClassNameGenerator: ClassNameGenerator<RenderProps>
  classNameGenerator: ClassNameGenerator<RenderProps>
  didMount: DidMountHandler<RenderProps & { el: HTMLElement }>
  willUnmount: WillUnmountHandler<RenderProps & { el: HTMLElement }>
  align: 'start' | 'center' | 'end' | ((info: { level: number, inPopover: boolean, isNarrow: boolean }) => 'start' | 'center' | 'end'),
  sticky: boolean | number | string,
  dayHeaderFormat?: DateFormatter,
  datesRepDistinctDays?: boolean,
}

export interface CellDataConfig<RenderProps> {
  key: string
  dateMarker: DateMarker
  renderProps: RenderProps
  className?: string
  attrs?: any // TODO
  innerAttrs?: any // TODO
  colSpan?: number // TODO: make required? easier for internal users
  hasNavLink?: boolean
}

export interface RowConfig<BaseRenderProps, RenderProps = BaseRenderProps> {
  isDateRow: boolean
  renderConfig: CellRenderConfig<BaseRenderProps, RenderProps>
  dataConfigs: CellDataConfig<BaseRenderProps>[] // for the CELLs
}

export interface BaseDayHeaderData extends DateMeta {
  isMajor: DayHeaderInfo['isMajor']
  isSticky: DayHeaderInfo['isSticky']
  inPopover: DayHeaderInfo['inPopover']
  hasNavLink: DayHeaderInfo['hasNavLink']
  view: DayHeaderInfo['view']
  [otherProp: string]: any
}

// TODO: converge types with DayTableCell and DayCellContainer (the component) and refineRenderProps
// the generation of DayTableCell will be distinct (for the BODY cells)
// but can share some of the same types/utils

// Date Cells
// -------------------------------------------------------------------------------------------------

const firstSunday = new Date(259200000)

export function buildDateRowConfigs(
  dates: DateMarker[],
  datesRepDistinctDays: boolean,
  dateProfile: DateProfile,
  todayRange: DateRange,
  dayHeaderFormat: DateFormatter, // TODO: rename to dateHeaderFormat?
  context: ViewContext,
): RowConfig<BaseDayHeaderData, DayHeaderInfo>[] {
  const rowConfig = buildDateRowConfig(
    dates,
    datesRepDistinctDays,
    dateProfile,
    todayRange,
    dayHeaderFormat,
    context,
  )
  const majorUnit = computeMajorUnit(dateProfile, context.dateEnv)

  // HACK mutate isMajor
  // Skip 'day' majorUnit: when each header cell IS a day, every cell would match,
  // so there's no meaningful boundary to highlight (unlike timeline slots which can be sub-day).
  if (datesRepDistinctDays && majorUnit !== 'day') {
    for (const dataConfig of rowConfig.dataConfigs) {
      if (isMajorUnit(dataConfig.dateMarker, majorUnit, context.dateEnv)) {
        dataConfig.renderProps.isMajor = true
      }
    }
  }

  return [rowConfig]
}

/*
Should this receive resource data attributes?
Or ResourceApi object itself?
*/
export function buildDateRowConfig(
  dateMarkers: DateMarker[],
  datesRepDistinctDays: boolean,
  dateProfile: DateProfile,
  todayRange: DateRange,
  dayHeaderFormat: DateFormatter, // TODO: rename to dateHeaderFormat?
  context: ViewContext,
  colSpan?: number,
  isMajorMod?: number,
): RowConfig<BaseDayHeaderData, DayHeaderInfo> {
  return {
    isDateRow: true,
    renderConfig: buildDateRenderConfig(dayHeaderFormat, datesRepDistinctDays, context),
    dataConfigs: buildDateDataConfigs(
      dateMarkers,
      datesRepDistinctDays,
      dateProfile,
      todayRange,
      dayHeaderFormat,
      context,
      colSpan,
      undefined,
      undefined,
      undefined,
      undefined,
      isMajorMod,
    )
  }
}

/*
For header cells: how to connect w/ custom rendering
Applies to all cells in a row
*/
export function buildDateRenderConfig(
  dayHeaderFormat: DateFormatter,
  datesRepDistinctDays: boolean,
  context: ViewContext,
): CellRenderConfig<BaseDayHeaderData, DayHeaderInfo> {
  const { options } = context

  return {
    generatorName: 'dayHeaderContent',
    customGenerator: options.dayHeaderContent,
    classNameGenerator: options.dayHeaderClass,
    innerClassNameGenerator: options.dayHeaderInnerClass,
    didMount: options.dayHeaderDidMount,
    willUnmount: options.dayHeaderWillUnmount,
    align: options.dayHeaderAlign,
    sticky: options._dayHeaderSticky,
    dayHeaderFormat,
    datesRepDistinctDays,
  }
}

const dowDates: Date[] = []

for (let dow = 0; dow < 7; dow++) {
  dowDates.push(addDays(new Date(259200000), dow)) // start with Sun, 04 Jan 1970 00:00:00 GMT)
}

/*
For header cells: data
*/
export function buildDateDataConfigs(
  dateMarkers: DateMarker[],
  datesRepDistinctDays: boolean,
  dateProfile: DateProfile,
  todayRange: DateRange,
  dayHeaderFormat: DateFormatter, // TODO: rename to dateHeaderFormat?
  context: ViewContext,
  colSpan = 1,
  keyPrefix = '',
  extraRenderProps: Dictionary = {}, // TODO
  extraAttrs: Dictionary = {}, // TODO
  className = '',
  isMajorMod?: number,
): CellDataConfig<BaseDayHeaderData>[] {
  const { dateEnv, viewApi, options } = context

  return datesRepDistinctDays
    ? dateMarkers.map((dateMarker, i) => { // Date
        const dateMeta = getDateMeta(dateMarker, dateEnv, dateProfile, todayRange)
        const isMajor = isMajorMod != null && !(i % isMajorMod)
        const hasNavLink = options.navLinks && !dateMeta.isDisabled &&
          dateMarkers.length > 1 // don't show navlink to day if only one day
        const renderProps: BaseDayHeaderData = {
          ...dateMeta,
          ...extraRenderProps,
          isMajor,
          isSticky: false, // HACK. gets overridden
          inPopover: false,
          hasNavLink,
          view: viewApi,
        }
        const fullDateStr = buildDateStr(context, dateMarker)

        // for DayGridHeaderCell
        return {
          key: keyPrefix + dateMarker.toUTCString(),
          dateMarker,
          renderProps,
          attrs: {
            'aria-label': fullDateStr,
            ...(dateMeta.isToday ? { 'aria-current': 'date' } : {}), // TODO: assign undefined for nonexistent
            'data-date': formatDayString(dateMarker),
            ...extraAttrs,
          },
          // for navlink
          innerAttrs: hasNavLink
            ? buildNavLinkAttrs(context, dateMarker, undefined, fullDateStr)
            : { 'aria-hidden': true }, // label already on cell
          colSpan,
          hasNavLink,
          className,
        }
      })
    : dateMarkers.map((dateMarker, i) => { // DayOfWeek
        const dow = dateMarker.getUTCDay()
        const normDate = addDays(firstSunday, dow)
        const dateMeta: DateMeta = {
          date: dateEnv.toDate(dateMarker),
          dow,
          isDisabled: false,
          isFuture: false,
          isPast: false,
          isToday: false,
          isOther: false,
        }
        const isMajor = isMajorMod != null && !(i % isMajorMod)
        const renderProps: BaseDayHeaderData = {
          ...dateMeta,
          date: dowDates[dow],
          isMajor,
          isSticky: false, // HACK. gets overridden
          inPopover: false,
          hasNavLink: false,
          view: viewApi,
          ...extraRenderProps,
        }
        const fullWeekDayStr = joinDateTimeFormatParts(dateEnv.formatToParts(normDate, WEEKDAY_ONLY_FORMAT))

        // for DayGridHeaderCell
        return {
          key: keyPrefix + String(dow),
          dateMarker,
          renderProps,
          attrs: {
            'aria-label': fullWeekDayStr,
            ...extraAttrs,
          },
          // NOT a navlink
          innerAttrs: {
            'aria-hidden': true, // label already on cell
          },
          colSpan,
          className,
        }
      })
}
