declare module 'fullcalendar/src/util/dom-manip' {
	export function createElement(tagName: string, attrs: object | null, content?: ElementContent): HTMLElement;
	export function htmlToElement(html: string): HTMLElement;
	export function htmlToElements(html: string): HTMLElement[];
	export type ElementContent = string | Node | NodeList | Node[];
	export function appendToElement(el: HTMLElement, content: ElementContent): void;
	export function prependToElement(parent: HTMLElement, content: ElementContent): void;
	export function insertAfterElement(refEl: HTMLElement, content: ElementContent): void;
	export function removeElement(el: HTMLElement): void;
	export function elementClosest(el: HTMLElement, selector: string): HTMLElement;
	export function elementMatches(el: HTMLElement, selector: string): HTMLElement;
	export function findElements(container: HTMLElement[] | HTMLElement, selector: string): HTMLElement[];
	export function findChildren(parent: HTMLElement[] | HTMLElement, selector?: string): HTMLElement[];
	export function forceClassName(el: HTMLElement, className: string, bool: any): void;
	export function applyStyle(el: HTMLElement, props: object, propVal?: any): void;
	export function applyStyleProp(el: HTMLElement, name: string, val: any): void;
}
declare module 'fullcalendar/src/util/geom' {
	export interface Point {
	    left: number;
	    top: number;
	}
	export interface Rect {
	    left: number;
	    right: number;
	    top: number;
	    bottom: number;
	}
	export function pointInsideRect(point: Point, rect: Rect): boolean;
	export function intersectRects(rect1: Rect, rect2: Rect): Rect | false;
	export function constrainPoint(point: Point, rect: Rect): Point;
	export function getRectCenter(rect: Rect): Point;
	export function diffPoints(point1: Point, point2: Point): Point;
}
declare module 'fullcalendar/src/util/scrollbars' {
	export function getIsRtlScrollbarOnLeft(): boolean;
	export function sanitizeScrollbarWidth(width: number): number;
}
declare module 'fullcalendar/src/util/dom-geom' {
	import { Rect } from 'fullcalendar/src/util/geom';
	export interface EdgeInfo {
	    borderLeft: number;
	    borderRight: number;
	    borderTop: number;
	    borderBottom: number;
	    scrollbarLeft: number;
	    scrollbarRight: number;
	    scrollbarBottom: number;
	    paddingLeft?: number;
	    paddingRight?: number;
	    paddingTop?: number;
	    paddingBottom?: number;
	}
	export function computeEdges(el: any, getPadding?: boolean): EdgeInfo;
	export function computeInnerRect(el: any, goWithinPadding?: boolean): {
	    left: number;
	    right: number;
	    top: number;
	    bottom: number;
	};
	export function computeRect(el: any): Rect;
	export function computeHeightAndMargins(el: HTMLElement): number;
	export function getClippingParents(el: HTMLElement): HTMLElement[];
	export function computeClippingRect(el: HTMLElement): Rect;
}
declare module 'fullcalendar/src/util/dom-event' {
	export function preventDefault(ev: any): void;
	export function listenBySelector(container: HTMLElement, eventType: string, selector: string, handler: (ev: Event, matchedTarget: HTMLElement) => void): () => void;
	export function listenToHoverBySelector(container: HTMLElement, selector: string, onMouseEnter: (ev: Event, matchedTarget: HTMLElement) => void, onMouseLeave: (ev: Event, matchedTarget: HTMLElement) => void): () => void;
	export function whenTransitionDone(el: HTMLElement, callback: (ev: Event) => void): void;
}
declare module 'fullcalendar/src/datelib/duration' {
	export interface DurationInput {
	    years?: number;
	    year?: number;
	    months?: number;
	    month?: number;
	    weeks?: number;
	    week?: number;
	    days?: number;
	    day?: number;
	    hours?: number;
	    hour?: number;
	    minutes?: number;
	    minute?: number;
	    seconds?: number;
	    second?: number;
	    milliseconds?: number;
	    millisecond?: number;
	    ms?: number;
	}
	export interface Duration {
	    years: number;
	    months: number;
	    days: number;
	    milliseconds: number;
	}
	export function createDuration(input: any, unit?: string): Duration | null;
	export function getWeeksFromInput(obj: DurationInput): number;
	export function durationsEqual(d0: Duration, d1: Duration): boolean;
	export function isSingleDay(dur: Duration): boolean;
	export function addDurations(d0: Duration, d1: Duration): {
	    years: number;
	    months: number;
	    days: number;
	    milliseconds: number;
	};
	export function subtractDurations(d1: Duration, d0: Duration): Duration;
	export function multiplyDuration(d: Duration, n: number): {
	    years: number;
	    months: number;
	    days: number;
	    milliseconds: number;
	};
	export function asRoughYears(dur: Duration): number;
	export function asRoughMonths(dur: Duration): number;
	export function asRoughDays(dur: Duration): number;
	export function asRoughHours(dur: Duration): number;
	export function asRoughMinutes(dur: Duration): number;
	export function asRoughSeconds(dur: Duration): number;
	export function asRoughMs(dur: Duration): number;
	export function wholeDivideDurations(numerator: Duration, denominator: Duration): number;
	export function greatestDurationDenominator(dur: Duration, dontReturnWeeks?: boolean): {
	    unit: string;
	    value: number;
	};
}
declare module 'fullcalendar/src/datelib/marker' {
	import { Duration } from 'fullcalendar/src/datelib/duration';
	export type DateMarker = Date;
	export const DAY_IDS: string[];
	export function addWeeks(m: DateMarker, n: number): Date;
	export function addDays(m: DateMarker, n: number): Date;
	export function addMs(m: DateMarker, n: number): Date;
	export function diffWeeks(m0: any, m1: any): number;
	export function diffDays(m0: any, m1: any): number;
	export function diffHours(m0: any, m1: any): number;
	export function diffMinutes(m0: any, m1: any): number;
	export function diffSeconds(m0: any, m1: any): number;
	export function diffDayAndTime(m0: DateMarker, m1: DateMarker): Duration;
	export function diffWholeWeeks(m0: DateMarker, m1: DateMarker): number;
	export function diffWholeDays(m0: DateMarker, m1: DateMarker): number;
	export function startOfDay(m: DateMarker): DateMarker;
	export function startOfHour(m: DateMarker): Date;
	export function startOfMinute(m: DateMarker): Date;
	export function startOfSecond(m: DateMarker): Date;
	export function weekOfYear(marker: any, dow: any, doy: any): number;
	export function dateToLocalArray(date: any): any[];
	export function arrayToLocalDate(a: any): Date;
	export function dateToUtcArray(date: any): any[];
	export function arrayToUtcDate(a: any): Date;
	export function isValidDate(m: DateMarker): boolean;
	export function timeAsMs(m: DateMarker): number;
}
declare module 'fullcalendar/src/datelib/calendar-system' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	export interface CalendarSystem {
	    getMarkerYear(d: DateMarker): number;
	    getMarkerMonth(d: DateMarker): number;
	    getMarkerDay(d: DateMarker): number;
	    arrayToMarker(arr: number[]): DateMarker;
	    markerToArray(d: DateMarker): number[];
	}
	export function registerCalendarSystem(name: any, theClass: any): void;
	export function createCalendarSystem(name: any): any;
}
declare module 'fullcalendar/src/util/object' {
	export function mergeProps(propObjs: any, complexProps?: any): any;
	export function filterHash(hash: any, func: any): {};
	export function mapHash<InputItem, OutputItem>(hash: {
	    [key: string]: InputItem;
	}, func: (input: InputItem, key: string) => OutputItem): {
	    [key: string]: OutputItem;
	};
	export function arrayToHash(a: any): {
	    [key: string]: true;
	};
	export function isPropsEqual(obj0: any, obj1: any): boolean;
}
declare module 'fullcalendar/src/datelib/locale' {
	export type LocaleCodeArg = string | string[] | null;
	export interface Locale {
	    codeArg: LocaleCodeArg;
	    codes: string[];
	    week: {
	        dow: number;
	        doy: number;
	    };
	    simpleNumberFormat: Intl.NumberFormat;
	    options: any;
	}
	export function getLocale(codeArg: LocaleCodeArg): Locale;
	export function defineLocale(simpleId: string, rawData: any): void;
	export function getLocaleCodes(): string[];
}
declare module 'fullcalendar/src/datelib/timezone' {
	export abstract class NamedTimeZoneImpl {
	    name: string;
	    constructor(name: string);
	    abstract offsetForArray(a: number[]): number;
	    abstract timestampToArray(ms: number): number[];
	}
	export function registerNamedTimeZoneImpl(implName: any, theClass: any): void;
	export function createNamedTimeZoneImpl(implName: any, tzName: any): any;
}
declare module 'fullcalendar/src/util/array' {
	export function removeMatching(array: any, testFunc: any): number;
	export function removeExact(array: any, exactVal: any): number;
	export function isArraysEqual(a0: any, a1: any): boolean;
}
declare module 'fullcalendar/src/util/memoize' {
	export function memoize<T>(workerFunc: T): T;
	export function memoizeOutput<T>(workerFunc: T, equalityFunc: (output0: any, output1: any) => boolean): T;
}
declare module 'fullcalendar/src/datelib/formatting-native' {
	import { DateFormatter, DateFormattingContext, ZonedMarker } from 'fullcalendar/src/datelib/formatting';
	export class NativeFormatter implements DateFormatter {
	    standardDateProps: any;
	    extendedSettings: any;
	    severity: number;
	    private buildFormattingFunc;
	    constructor(formatSettings: any);
	    format(date: ZonedMarker, context: DateFormattingContext): string;
	    formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext): string;
	    getLargestUnit(): "week" | "day" | "month" | "year";
	}
}
declare module 'fullcalendar/src/datelib/formatting-cmd' {
	import { DateFormatter, DateFormattingContext, ZonedMarker, VerboseFormattingArg } from 'fullcalendar/src/datelib/formatting';
	export type CmdFormatterFunc = (cmd: string, arg: VerboseFormattingArg) => string;
	export function registerCmdFormatter(name: any, input: CmdFormatterFunc): void;
	export function getCmdFormatter(name: string): CmdFormatterFunc | null;
	export class CmdFormatter implements DateFormatter {
	    cmdStr: string;
	    separator: string;
	    constructor(cmdStr: string, separator?: string);
	    format(date: ZonedMarker, context: DateFormattingContext): string;
	    formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext): string;
	}
}
declare module 'fullcalendar/src/datelib/formatting-func' {
	import { DateFormatter, DateFormattingContext, ZonedMarker, VerboseFormattingArg } from 'fullcalendar/src/datelib/formatting';
	export type FuncFormatterFunc = (arg: VerboseFormattingArg) => string;
	export class FuncFormatter implements DateFormatter {
	    func: FuncFormatterFunc;
	    constructor(func: FuncFormatterFunc);
	    format(date: ZonedMarker, context: DateFormattingContext): string;
	    formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext): string;
	}
}
declare module 'fullcalendar/src/datelib/formatting' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { CalendarSystem } from 'fullcalendar/src/datelib/calendar-system';
	import { Locale } from 'fullcalendar/src/datelib/locale';
	import { CmdFormatterFunc } from 'fullcalendar/src/datelib/formatting-cmd';
	import { FuncFormatterFunc } from 'fullcalendar/src/datelib/formatting-func';
	export interface ZonedMarker {
	    marker: DateMarker;
	    timeZoneOffset: number;
	}
	export interface ExpandedZonedMarker extends ZonedMarker {
	    array: number[];
	    year: number;
	    month: number;
	    day: number;
	    hour: number;
	    minute: number;
	    second: number;
	    millisecond: number;
	}
	export interface VerboseFormattingArg {
	    date: ExpandedZonedMarker;
	    start: ExpandedZonedMarker;
	    end?: ExpandedZonedMarker;
	    timeZone: string;
	    localeCodes: string[];
	    separator: string;
	}
	export interface DateFormattingContext {
	    timeZone: string;
	    locale: Locale;
	    calendarSystem: CalendarSystem;
	    computeWeekNumber: (d: DateMarker) => number;
	    weekLabel: string;
	    cmdFormatter: CmdFormatterFunc;
	}
	export interface DateFormatter {
	    format(date: ZonedMarker, context: DateFormattingContext): any;
	    formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext): any;
	}
	export type FormatterInput = object | string | FuncFormatterFunc;
	export function createFormatter(input: FormatterInput, defaultSeparator?: string): DateFormatter;
	export function buildIsoString(marker: DateMarker, timeZoneOffset?: number, stripZeroTime?: boolean): string;
	export function formatIsoTimeString(marker: DateMarker): string;
	export function formatTimeZoneOffset(minutes: number, doIso?: boolean): string;
	export function createVerboseFormattingArg(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext, separator?: string): VerboseFormattingArg;
}
declare module 'fullcalendar/src/datelib/parsing' {
	export function parse(str: any): {
	    marker: Date;
	    isTimeUnspecified: boolean;
	    timeZoneOffset: any;
	};
}
declare module 'fullcalendar/src/datelib/env' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { CalendarSystem } from 'fullcalendar/src/datelib/calendar-system';
	import { Locale } from 'fullcalendar/src/datelib/locale';
	import { NamedTimeZoneImpl } from 'fullcalendar/src/datelib/timezone';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateFormatter } from 'fullcalendar/src/datelib/formatting';
	import { CmdFormatterFunc } from 'fullcalendar/src/datelib/formatting-cmd';
	export interface DateEnvSettings {
	    timeZone: string;
	    timeZoneImpl?: string;
	    calendarSystem: string;
	    locale: Locale;
	    weekNumberCalculation?: any;
	    firstDay?: any;
	    weekLabel?: string;
	    cmdFormatter?: string;
	}
	export type DateInput = Date | string | number | number[];
	export interface DateMarkerMeta {
	    marker: DateMarker;
	    isTimeUnspecified: boolean;
	    forcedTzo: number | null;
	}
	export class DateEnv {
	    timeZone: string;
	    namedTimeZoneImpl: NamedTimeZoneImpl;
	    canComputeOffset: boolean;
	    calendarSystem: CalendarSystem;
	    locale: Locale;
	    weekDow: number;
	    weekDoy: number;
	    weekNumberFunc: any;
	    weekLabel: string;
	    cmdFormatter: CmdFormatterFunc;
	    constructor(settings: DateEnvSettings);
	    createMarker(input: DateInput): DateMarker;
	    createNowMarker(): DateMarker;
	    createMarkerMeta(input: DateInput): DateMarkerMeta;
	    parse(s: string): {
	        marker: Date;
	        isTimeUnspecified: boolean;
	        forcedTzo: any;
	    };
	    getYear(marker: DateMarker): number;
	    getMonth(marker: DateMarker): number;
	    add(marker: DateMarker, dur: Duration): DateMarker;
	    subtract(marker: DateMarker, dur: Duration): DateMarker;
	    addYears(marker: DateMarker, n: number): Date;
	    addMonths(marker: DateMarker, n: number): Date;
	    diffWholeYears(m0: DateMarker, m1: DateMarker): number;
	    diffWholeMonths(m0: DateMarker, m1: DateMarker): number;
	    greatestWholeUnit(m0: DateMarker, m1: DateMarker): {
	        unit: string;
	        value: number;
	    };
	    countDurationsBetween(m0: DateMarker, m1: DateMarker, d: Duration): number;
	    startOf(m: DateMarker, unit: string): Date;
	    startOfYear(m: DateMarker): DateMarker;
	    startOfMonth(m: DateMarker): DateMarker;
	    startOfWeek(m: DateMarker): DateMarker;
	    computeWeekNumber(marker: DateMarker): number;
	    format(marker: DateMarker, formatter: DateFormatter, dateOptions?: {
	        forcedTzo?: number;
	    }): any;
	    formatRange(start: DateMarker, end: DateMarker, formatter: DateFormatter, dateOptions?: {
	        forcedStartTzo?: number;
	        forcedEndTzo?: number;
	        isEndExclusive?: boolean;
	    }): any;
	    formatIso(marker: DateMarker, extraOptions?: any): string;
	    timestampToMarker(ms: number): Date;
	    offsetForMarker(m: DateMarker): number;
	    toDate(m: DateMarker, forcedTzo?: number): Date;
	}
}
declare module 'fullcalendar/src/datelib/date-range' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateEnv, DateInput } from 'fullcalendar/src/datelib/env';
	export interface DateRangeInput {
	    start?: DateInput;
	    end?: DateInput;
	}
	export interface OpenDateRange {
	    start: DateMarker | null;
	    end: DateMarker | null;
	}
	export interface DateRange {
	    start: DateMarker;
	    end: DateMarker;
	}
	export function parseRange(input: DateRangeInput, dateEnv: DateEnv): OpenDateRange;
	export function invertRanges(ranges: DateRange[], constraintRange: DateRange): DateRange[];
	export function intersectRanges(range0: OpenDateRange, range1: OpenDateRange): OpenDateRange;
	export function rangesEqual(range0: OpenDateRange, range1: OpenDateRange): boolean;
	export function rangesIntersect(range0: OpenDateRange, range1: OpenDateRange): boolean;
	export function rangeContainsRange(outerRange: OpenDateRange, innerRange: OpenDateRange): boolean;
	export function rangeContainsMarker(range: OpenDateRange, date: DateMarker | number): boolean;
	export function constrainMarkerToRange(date: DateMarker, range: DateRange): DateMarker;
}
declare module 'fullcalendar/src/util/misc' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	export function compensateScroll(rowEl: HTMLElement, scrollbarWidths: any): void;
	export function uncompensateScroll(rowEl: HTMLElement): void;
	export function disableCursor(): void;
	export function enableCursor(): void;
	export function distributeHeight(els: HTMLElement[], availableHeight: any, shouldRedistribute: any): void;
	export function undistributeHeight(els: HTMLElement[]): void;
	export function matchCellWidths(els: HTMLElement[]): number;
	export function subtractInnerElHeight(outerEl: HTMLElement, innerEl: HTMLElement): number;
	export function preventSelection(el: HTMLElement): void;
	export function allowSelection(el: HTMLElement): void;
	export function preventContextMenu(el: HTMLElement): void;
	export function allowContextMenu(el: HTMLElement): void;
	export function parseFieldSpecs(input: any): any[];
	export function compareByFieldSpecs(obj0: any, obj1: any, fieldSpecs: any): any;
	export function compareByFieldSpec(obj0: any, obj1: any, fieldSpec: any): any;
	export function flexibleCompare(a: any, b: any): number;
	export function log(...args: any[]): any;
	export function warn(...args: any[]): any;
	export function capitaliseFirstLetter(str: any): any;
	export function padStart(val: any, len: any): string;
	export function compareNumbers(a: any, b: any): number;
	export function isInt(n: any): boolean;
	export function applyAll(functions: any, thisObj: any, args: any): any;
	export function firstDefined(...args: any[]): any;
	export function debounce(func: any, wait: any): () => any;
	export type GenericHash = {
	    [key: string]: any;
	};
	export function refineProps(rawProps: GenericHash, processors: GenericHash, defaults?: GenericHash, leftoverProps?: GenericHash): GenericHash;
	export function computeAlignedDayRange(timedRange: DateRange): DateRange;
	export function computeVisibleDayRange(timedRange: DateRange, nextDayThreshold?: Duration): DateRange;
	export function isMultiDayRange(range: DateRange): boolean;
	export function diffDates(date0: DateMarker, date1: DateMarker, dateEnv: DateEnv, largeUnit?: string): Duration;
}
declare module 'fullcalendar/Mixin' {
	export class Default {
	    static mixInto(destClass: any): void;
	    static mixIntoObj(destObj: any): void;
	    static mixOver(destClass: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/EmitterMixin' {
	import Mixin from 'fullcalendar/Mixin';
	export interface EmitterInterface {
	    on(types: any, handler: any): any;
	    one(types: any, handler: any): any;
	    off(types: any, handler: any): any;
	    trigger(type: any, ...args: any[]): any;
	    triggerWith(type: any, context: any, args: any): any;
	    hasHandlers(type: any): any;
	}
	export class Default extends Mixin implements EmitterInterface {
	    _handlers: any;
	    _oneHandlers: any;
	    on(type: any, handler: any): this;
	    one(type: any, handler: any): this;
	    off(type: any, handler?: any): this;
	    trigger(type: any, ...args: any[]): this;
	    triggerWith(type: any, context: any, args: any): this;
	    hasHandlers(type: any): any;
	}
	export default Default;
}
declare module 'fullcalendar/src/options' {
	export const globalDefaults: {
	    defaultRangeSeparator: string;
	    titleRangeSeparator: string;
	    cmdFormatter: any;
	    defaultTimedEventDuration: string;
	    defaultAllDayEventDuration: {
	        day: number;
	    };
	    forceEventDuration: boolean;
	    nextDayThreshold: string;
	    columnHeader: boolean;
	    defaultView: string;
	    aspectRatio: number;
	    header: {
	        left: string;
	        center: string;
	        right: string;
	    };
	    weekends: boolean;
	    weekNumbers: boolean;
	    weekNumberCalculation: string;
	    editable: boolean;
	    scrollTime: string;
	    minTime: string;
	    maxTime: string;
	    showNonCurrentDates: boolean;
	    lazyFetching: boolean;
	    startParam: string;
	    endParam: string;
	    timeZoneParam: string;
	    timeZone: string;
	    timeZoneImpl: any;
	    locale: string;
	    agendaEventMinHeight: number;
	    theme: boolean;
	    dragRevertDuration: number;
	    dragScroll: boolean;
	    allDayMaintainDuration: boolean;
	    unselectAuto: boolean;
	    dropAccept: string;
	    eventOrder: string;
	    eventLimit: boolean;
	    eventLimitClick: string;
	    dayPopoverFormat: {
	        month: string;
	        day: string;
	        year: string;
	    };
	    handleWindowResize: boolean;
	    windowResizeDelay: number;
	    longPressDelay: number;
	    eventDragMinDistance: number;
	};
	export const rtlDefaults: {
	    header: {
	        left: string;
	        center: string;
	        right: string;
	    };
	    buttonIcons: {
	        prev: string;
	        next: string;
	        prevYear: string;
	        nextYear: string;
	    };
	    themeButtonIcons: {
	        prev: string;
	        next: string;
	        nextYear: string;
	        prevYear: string;
	    };
	};
	export function mergeOptions(optionObjs: any): any;
}
declare module 'fullcalendar/OptionsManager' {
	export class Default {
	    dirDefaults: any;
	    localeDefaults: any;
	    overrides: any;
	    dynamicOverrides: any;
	    computed: any;
	    constructor(overrides: any);
	    add(name: any, value: any): void;
	    compute(): void;
	}
	export default Default;
}
declare module 'fullcalendar/Theme' {
	export class Default {
	    calendarOptions: any;
	    classes: any;
	    iconClasses: any;
	    baseIconClass: string;
	    iconOverrideOption: any;
	    iconOverrideCustomButtonOption: any;
	    iconOverridePrefix: string;
	    constructor(calendarOptions: any);
	    processIconOverride(): void;
	    setIconOverride(iconOverrideHash: any): void;
	    applyIconOverridePrefix(className: any): any;
	    getClass(key: any): any;
	    getIconClass(buttonName: any): string;
	    getCustomButtonIconClass(customButtonProps: any): string;
	}
	export default Default;
}
declare module 'fullcalendar/StandardTheme' {
	import Theme from 'fullcalendar/Theme';
	export class Default extends Theme {
	}
	export default Default;
}
declare module 'fullcalendar/JqueryUiTheme' {
	import Theme from 'fullcalendar/Theme';
	export class Default extends Theme {
	}
	export default Default;
}
declare module 'fullcalendar/ThemeRegistry' {
	export function defineThemeSystem(themeName: any, themeClass: any): void;
	export function getThemeSystemClass(themeSetting: any): any;
}
declare module 'fullcalendar/src/structs/recurring-event' {
	import { EventInput, EventDef } from 'fullcalendar/src/structs/event';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	export interface ParsedRecurring {
	    allDay: boolean;
	    duration: Duration | null;
	    typeData: any;
	}
	export interface RecurringType {
	    parse: (rawEvent: EventInput, allDayDefault: boolean | null, leftoverProps: any, dateEnv: DateEnv) => ParsedRecurring | null;
	    expand: (typeData: any, eventDef: EventDef, framingRange: DateRange, dateEnv: DateEnv) => DateMarker[];
	}
	export function registerRecurringType(recurringType: RecurringType): void;
	export function parseRecurring(eventInput: EventInput, allDayDefault: boolean | null, dateEnv: DateEnv, leftovers: any): {
	    allDay: boolean;
	    duration: Duration;
	    typeData: any;
	    typeId: number;
	};
	export function expandRecurringRanges(eventDef: EventDef, framingRange: DateRange, dateEnv: DateEnv): DateMarker[];
}
declare module 'fullcalendar/src/structs/event-store' {
	import { EventInput, EventDef, EventDefHash, EventInstanceHash, EventTuple } from 'fullcalendar/src/structs/event';
	import { EventSource } from 'fullcalendar/src/structs/event-source';
	import Calendar from 'fullcalendar/Calendar';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	export interface EventStore {
	    defs: EventDefHash;
	    instances: EventInstanceHash;
	}
	export function parseEvents(rawEvents: EventInput[], sourceId: string, calendar: Calendar, allowOpenRange?: boolean): EventStore;
	export function eventTupleToStore(tuple: EventTuple, eventStore?: EventStore): EventStore;
	export function expandRecurring(eventStore: EventStore, framingRange: DateRange, calendar: Calendar): EventStore;
	export function getRelevantEvents(eventStore: EventStore, instanceId: string): EventStore;
	export function transformRawEvents(rawEvents: any, eventSource: EventSource, calendar: Calendar): any;
	export function createEmptyEventStore(): EventStore;
	export function mergeEventStores(store0: EventStore, store1: EventStore): EventStore;
	export function filterEventStoreDefs(eventStore: EventStore, filterFunc: (eventDef: EventDef) => boolean): EventStore;
}
declare module 'fullcalendar/PointerDragging' {
	import { default as EmitterMixin } from 'fullcalendar/EmitterMixin';
	export interface PointerDragEvent {
	    origEvent: UIEvent;
	    isTouch: boolean;
	    subjectEl: EventTarget;
	    pageX: number;
	    pageY: number;
	}
	export class Default {
	    containerEl: EventTarget;
	    subjectEl: HTMLElement | null;
	    downEl: HTMLElement | null;
	    emitter: EmitterMixin;
	    selector: string;
	    handleSelector: string;
	    shouldIgnoreMove: boolean;
	    shouldWatchScroll: boolean;
	    isDragging: boolean;
	    isTouchDragging: boolean;
	    wasTouchScroll: boolean;
	    prevPageX: number;
	    prevPageY: number;
	    prevScrollX: number;
	    prevScrollY: number;
	    constructor(containerEl: EventTarget);
	    destroy(): void;
	    tryStart(ev: UIEvent): boolean;
	    cleanup(): void;
	    querySubjectEl(ev: UIEvent): HTMLElement;
	    handleMouseDown: (ev: MouseEvent) => void;
	    handleMouseMove: (ev: MouseEvent) => void;
	    handleMouseUp: (ev: MouseEvent) => void;
	    shouldIgnoreMouse(): number | boolean;
	    handleTouchStart: (ev: TouchEvent) => void;
	    handleTouchMove: (ev: TouchEvent) => void;
	    handleTouchEnd: (ev: TouchEvent) => void;
	    handleTouchScroll: () => void;
	    cancelTouchScroll(): void;
	    initScrollWatch(ev: PointerDragEvent): void;
	    recordCoords(ev: PointerDragEvent): void;
	    handleScroll: (ev: UIEvent) => void;
	    destroyScrollWatch(): void;
	}
	export default Default;
}
declare module 'fullcalendar/ElementDragging' {
	import EmitterMixin from 'fullcalendar/EmitterMixin';
	export abstract class Default {
	    emitter: EmitterMixin;
	    constructor();
	    destroy(): void;
	    abstract setIgnoreMove(bool: boolean): void;
	    setMirrorIsVisible(bool: boolean): void;
	    setMirrorNeedsRevert(bool: boolean): void;
	}
	export default Default;
}
declare module 'fullcalendar/HitDragging' {
	import EmitterMixin from 'fullcalendar/EmitterMixin';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import ElementDragging from 'fullcalendar/ElementDragging';
	import DateComponent, { DateComponentHash } from 'fullcalendar/DateComponent';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { Rect, Point } from 'fullcalendar/src/util/geom';
	export interface Hit {
	    component: DateComponent<any>;
	    dateSpan: DateSpan;
	    dayEl: HTMLElement;
	    rect: Rect;
	    layer: number;
	}
	export class Default {
	    droppableHash: DateComponentHash;
	    dragging: ElementDragging;
	    emitter: EmitterMixin;
	    useSubjectCenter: boolean;
	    requireInitial: boolean;
	    initialHit: Hit | null;
	    movingHit: Hit | null;
	    finalHit: Hit | null;
	    coordAdjust?: Point;
	    constructor(dragging: ElementDragging, droppable: DateComponent<any> | DateComponentHash);
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    processFirstCoord(ev: PointerDragEvent): void;
	    handleDragStart: (ev: PointerDragEvent) => void;
	    handleDragMove: (ev: PointerDragEvent) => void;
	    handlePointerUp: (ev: PointerDragEvent) => void;
	    handleDragEnd: (ev: PointerDragEvent) => void;
	    handleMove(ev: PointerDragEvent, forceHandle?: boolean): void;
	    prepareHits(): void;
	    releaseHits(): void;
	    queryHit(x: number, y: number): Hit | null;
	}
	export function isHitsEqual(hit0: Hit | null, hit1: Hit | null): boolean;
	export default Default;
}
declare module 'fullcalendar/ElementMirror' {
	import { Rect } from 'fullcalendar/src/util/geom';
	export class Default {
	    isVisible: boolean;
	    origScreenX?: number;
	    origScreenY?: number;
	    deltaX?: number;
	    deltaY?: number;
	    sourceEl: HTMLElement | null;
	    mirrorEl: HTMLElement | null;
	    sourceElRect: Rect | null;
	    parentNode: HTMLElement;
	    zIndex: number;
	    revertDuration: number;
	    start(sourceEl: HTMLElement, pageX: number, pageY: number): void;
	    handleMove(pageX: number, pageY: number): void;
	    setIsVisible(bool: boolean): void;
	    stop(needsRevertAnimation: boolean, callback: () => void): void;
	    doRevertAnimation(callback: () => void, revertDuration: number): void;
	    cleanup(): void;
	    updateElPosition(): void;
	    getMirrorEl(): HTMLElement;
	}
	export default Default;
}
declare module 'fullcalendar/src/common/scroll-controller' {
	export abstract class ScrollController {
	    abstract getScrollTop(): number;
	    abstract getScrollLeft(): number;
	    abstract setScrollTop(top: number): void;
	    abstract setScrollLeft(left: number): void;
	    abstract getClientWidth(): number;
	    abstract getClientHeight(): number;
	    abstract getScrollWidth(): number;
	    abstract getScrollHeight(): number;
	    getMaxScrollTop(): number;
	    getMaxScrollLeft(): number;
	    canScrollVertically(): boolean;
	    canScrollHorizontally(): boolean;
	    canScrollUp(): boolean;
	    canScrollDown(): boolean;
	    canScrollLeft(): boolean;
	    canScrollRight(): boolean;
	}
	export class ElementScrollController extends ScrollController {
	    el: HTMLElement;
	    constructor(el: HTMLElement);
	    getScrollTop(): number;
	    getScrollLeft(): number;
	    setScrollTop(top: number): void;
	    setScrollLeft(left: number): void;
	    getScrollWidth(): number;
	    getScrollHeight(): number;
	    getClientHeight(): number;
	    getClientWidth(): number;
	}
	export class WindowScrollController extends ScrollController {
	    getScrollTop(): number;
	    getScrollLeft(): number;
	    setScrollTop(n: number): void;
	    setScrollLeft(n: number): void;
	    getScrollWidth(): number;
	    getScrollHeight(): number;
	    getClientHeight(): number;
	    getClientWidth(): number;
	}
}
declare module 'fullcalendar/src/common/scroll-geom-cache' {
	import { Rect } from 'fullcalendar/src/util/geom';
	import { ScrollController } from 'fullcalendar/src/common/scroll-controller';
	export abstract class ScrollGeomCache extends ScrollController {
	    clientRect: Rect;
	    origScrollTop: number;
	    origScrollLeft: number;
	    protected scrollController: ScrollController;
	    protected doesListening: boolean;
	    protected scrollTop: number;
	    protected scrollLeft: number;
	    protected scrollWidth: number;
	    protected scrollHeight: number;
	    protected clientWidth: number;
	    protected clientHeight: number;
	    constructor(scrollController: ScrollController, doesListening: boolean);
	    abstract getEventTarget(): EventTarget;
	    abstract computeClientRect(): Rect;
	    destroy(): void;
	    handleScroll: () => void;
	    getScrollTop(): number;
	    getScrollLeft(): number;
	    setScrollTop(top: number): void;
	    setScrollLeft(top: number): void;
	    getClientWidth(): number;
	    getClientHeight(): number;
	    getScrollWidth(): number;
	    getScrollHeight(): number;
	    handleScrollChange(): void;
	}
	export class ElementScrollGeomCache extends ScrollGeomCache {
	    constructor(el: HTMLElement, doesListening: boolean);
	    getEventTarget(): EventTarget;
	    computeClientRect(): {
	        left: number;
	        right: number;
	        top: number;
	        bottom: number;
	    };
	}
	export class WindowScrollGeomCache extends ScrollGeomCache {
	    constructor(doesListening: boolean);
	    getEventTarget(): EventTarget;
	    computeClientRect(): Rect;
	    handleScrollChange(): void;
	}
}
declare module 'fullcalendar/AutoScroller' {
	import { ScrollGeomCache } from 'fullcalendar/src/common/scroll-geom-cache';
	export class Default {
	    isEnabled: boolean;
	    scrollQuery: (Window | string)[];
	    edgeThreshold: number;
	    maxVelocity: number;
	    pointerScreenX: number | null;
	    pointerScreenY: number | null;
	    isAnimating: boolean;
	    scrollCaches: ScrollGeomCache[] | null;
	    msSinceRequest?: number;
	    everMovedUp: boolean;
	    everMovedDown: boolean;
	    everMovedLeft: boolean;
	    everMovedRight: boolean;
	    start(pageX: number, pageY: number): void;
	    handleMove(pageX: number, pageY: number): void;
	    stop(): void;
	    requestAnimation(now: number): void;
	    private animate;
	    private handleSide;
	    private computeBestEdge;
	    private buildCaches;
	    private queryScrollEls;
	}
	export default Default;
}
declare module 'fullcalendar/FeaturefulElementDragging' {
	import { default as PointerDragging, PointerDragEvent } from 'fullcalendar/PointerDragging';
	import ElementMirror from 'fullcalendar/ElementMirror';
	import ElementDragging from 'fullcalendar/ElementDragging';
	import AutoScroller from 'fullcalendar/AutoScroller';
	export class Default extends ElementDragging {
	    pointer: PointerDragging;
	    mirror: ElementMirror;
	    autoScroller: AutoScroller;
	    delay: number | null;
	    minDistance: number;
	    touchScrollAllowed: boolean;
	    mirrorNeedsRevert: boolean;
	    isInteracting: boolean;
	    isDragging: boolean;
	    isDelayEnded: boolean;
	    isDistanceSurpassed: boolean;
	    delayTimeoutId: number | null;
	    origX?: number;
	    origY?: number;
	    constructor(containerEl: HTMLElement);
	    destroy(): void;
	    onPointerDown: (ev: PointerDragEvent) => void;
	    onPointerMove: (ev: PointerDragEvent) => void;
	    onPointerUp: (ev: PointerDragEvent) => void;
	    startDelay(ev: PointerDragEvent): void;
	    handleDelayEnd(ev: PointerDragEvent): void;
	    handleDistanceSurpassed(ev: PointerDragEvent): void;
	    tryStartDrag(ev: PointerDragEvent): void;
	    tryStopDrag(ev: PointerDragEvent): void;
	    stopDrag(ev: PointerDragEvent): void;
	    setIgnoreMove(bool: boolean): void;
	    setMirrorIsVisible(bool: boolean): void;
	    setMirrorNeedsRevert(bool: boolean): void;
	}
	export default Default;
}
declare module 'fullcalendar/DateClicking' {
	import DateComponent from 'fullcalendar/DateComponent';
	import FeaturefulElementDragging from 'fullcalendar/FeaturefulElementDragging';
	import HitDragging from 'fullcalendar/HitDragging';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	export class Default {
	    component: DateComponent<any>;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    constructor(component: DateComponent<any>);
	    destroy(): void;
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handleDragEnd: (ev: PointerDragEvent) => void;
	}
	export default Default;
}
declare module 'fullcalendar/DateSelecting' {
	import DateComponent from 'fullcalendar/DateComponent';
	import HitDragging, { Hit } from 'fullcalendar/HitDragging';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import FeaturefulElementDragging from 'fullcalendar/FeaturefulElementDragging';
	export class Default {
	    component: DateComponent<any>;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    dragSelection: DateSpan | null;
	    constructor(component: DateComponent<any>);
	    destroy(): void;
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handleDragStart: (ev: PointerDragEvent) => void;
	    handleHitUpdate: (hit: Hit, isFinal: boolean) => void;
	    handlePointerUp: (pev: PointerDragEvent) => void;
	}
	export type dateSelectionJoinTransformer = (hit0: Hit, hit1: Hit) => any;
	export default Default;
}
declare module 'fullcalendar/src/structs/event-mutation' {
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventDef } from 'fullcalendar/src/structs/event';
	import Calendar from 'fullcalendar/Calendar';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	export interface EventMutation {
	    startDelta?: Duration;
	    endDelta?: Duration;
	    standardProps?: any;
	    extendedProps?: any;
	}
	export function applyMutationToEventStore(eventStore: EventStore, eventConfigBase: EventUiHash, mutation: EventMutation, calendar: Calendar): EventStore;
	export type eventDefMutationApplier = (eventDef: EventDef, mutation: EventMutation, calendar: Calendar) => void;
}
declare module 'fullcalendar/EventSourceApi' {
	import Calendar from 'fullcalendar/Calendar';
	import { EventSource } from 'fullcalendar/src/structs/event-source';
	export class Default {
	    calendar: Calendar;
	    internalEventSource: EventSource;
	    constructor(calendar: Calendar, internalEventSource: EventSource);
	    remove(): void;
	    refetch(): void;
	    readonly id: string;
	    readonly url: string;
	}
	export default Default;
}
declare module 'fullcalendar/EventApi' {
	import Calendar from 'fullcalendar/Calendar';
	import { EventDef, EventInstance } from 'fullcalendar/src/structs/event';
	import { DateInput } from 'fullcalendar/src/datelib/env';
	import { DurationInput } from 'fullcalendar/src/datelib/duration';
	import { FormatterInput } from 'fullcalendar/src/datelib/formatting';
	import EventSourceApi from 'fullcalendar/EventSourceApi';
	export class Default {
	    _calendar: Calendar;
	    _def: EventDef;
	    _instance: EventInstance | null;
	    constructor(calendar: Calendar, def: EventDef, instance?: EventInstance);
	    setProp(name: string, val: string): void;
	    setExtendedProp(name: string, val: string): void;
	    setStart(startInput: DateInput, options?: {
	        granularity?: string;
	        maintainDuration?: boolean;
	    }): void;
	    setEnd(endInput: DateInput | null, options?: {
	        granularity?: string;
	    }): void;
	    setDates(startInput: DateInput, endInput: DateInput | null, options?: {
	        allDay?: boolean;
	        granularity?: string;
	    }): void;
	    moveStart(deltaInput: DurationInput): void;
	    moveEnd(deltaInput: DurationInput): void;
	    moveDates(deltaInput: DurationInput): void;
	    setAllDay(allDay: boolean, options?: {
	        maintainDuration?: boolean;
	    }): void;
	    formatRange(formatInput: FormatterInput): any;
	    private mutate;
	    remove(): void;
	    readonly source: EventSourceApi | null;
	    readonly start: Date | null;
	    readonly end: Date | null;
	    readonly id: string;
	    readonly groupId: string;
	    readonly allDay: boolean;
	    readonly title: string;
	    readonly url: string;
	    readonly rendering: string;
	    readonly startEditable: boolean;
	    readonly durationEditable: boolean;
	    readonly constraint: any;
	    readonly overlap: any;
	    readonly allow: any;
	    readonly backgroundColor: string;
	    readonly borderColor: string;
	    readonly textColor: string;
	    readonly classNames: string[];
	    readonly extendedProps: any;
	}
	export default Default;
}
declare module 'fullcalendar/EventClicking' {
	import DateComponent from 'fullcalendar/DateComponent';
	export class Default {
	    component: DateComponent<any>;
	    destroy: () => void;
	    constructor(component: DateComponent<any>);
	    handleSegClick: (ev: Event, segEl: HTMLElement) => void;
	}
	export default Default;
}
declare module 'fullcalendar/EventHovering' {
	import DateComponent from 'fullcalendar/DateComponent';
	export class Default {
	    component: DateComponent<any>;
	    removeHoverListeners: () => void;
	    currentSegEl: HTMLElement;
	    constructor(component: DateComponent<any>);
	    destroy(): void;
	    handleEventElRemove: (el: HTMLElement) => void;
	    handleSegEnter: (ev: Event, segEl: HTMLElement) => void;
	    handleSegLeave: (ev: Event, segEl: HTMLElement) => void;
	    triggerEvent(publicEvName: string, ev: Event | null, segEl: HTMLElement): void;
	}
	export default Default;
}
declare module 'fullcalendar/src/interactions/event-interaction-state' {
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { Seg } from 'fullcalendar/DateComponent';
	export interface EventInteractionState {
	    affectedEvents: EventStore;
	    mutatedEvents: EventStore;
	    isEvent: boolean;
	    origSeg: Seg | null;
	}
}
declare module 'fullcalendar/EventDragging' {
	import { default as DateComponent, Seg } from 'fullcalendar/DateComponent';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import HitDragging, { Hit } from 'fullcalendar/HitDragging';
	import { EventMutation } from 'fullcalendar/src/structs/event-mutation';
	import FeaturefulElementDragging from 'fullcalendar/FeaturefulElementDragging';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import Calendar from 'fullcalendar/Calendar';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { EventRenderRange } from 'fullcalendar/src/component/event-rendering';
	export class Default {
	    static SELECTOR: string;
	    component: DateComponent<any>;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    subjectSeg: Seg | null;
	    isDragging: boolean;
	    eventRange: EventRenderRange | null;
	    relevantEvents: EventStore | null;
	    receivingCalendar: Calendar | null;
	    validMutation: EventMutation | null;
	    mutatedRelevantEvents: EventStore | null;
	    constructor(component: DateComponent<any>);
	    destroy(): void;
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handleDragStart: (ev: PointerDragEvent) => void;
	    handleHitUpdate: (hit: Hit, isFinal: boolean) => void;
	    handlePointerUp: () => void;
	    handleDragEnd: (ev: PointerDragEvent) => void;
	    displayDrag(nextCalendar: Calendar | null, state: EventInteractionState): void;
	    clearDrag(): void;
	    cleanup(): void;
	}
	export type eventDragMutationMassager = (mutation: EventMutation, hit0: Hit, hit1: Hit) => void;
	export default Default;
}
declare module 'fullcalendar/EventResizing' {
	import { default as DateComponent, Seg } from 'fullcalendar/DateComponent';
	import HitDragging, { Hit } from 'fullcalendar/HitDragging';
	import { EventMutation } from 'fullcalendar/src/structs/event-mutation';
	import FeaturefulElementDragging from 'fullcalendar/FeaturefulElementDragging';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventRenderRange } from 'fullcalendar/src/component/event-rendering';
	export class Default {
	    component: DateComponent<any>;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    draggingSeg: Seg | null;
	    eventRange: EventRenderRange | null;
	    relevantEvents: EventStore | null;
	    validMutation: EventMutation | null;
	    mutatedRelevantEvents: EventStore | null;
	    constructor(component: DateComponent<any>);
	    destroy(): void;
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handleDragStart: (ev: PointerDragEvent) => void;
	    handleHitUpdate: (hit: Hit, isFinal: boolean, ev: PointerDragEvent) => void;
	    handleDragEnd: (ev: PointerDragEvent) => void;
	    querySeg(ev: PointerDragEvent): Seg | null;
	}
	export type EventResizeJoinTransforms = (hit0: Hit, hit1: Hit) => false | object;
	export default Default;
}
declare module 'fullcalendar/src/common/browser-context' {
	import DateComponent from 'fullcalendar/DateComponent';
	export class BrowserContext {
	    componentHash: {};
	    listenerHash: {};
	    registerComponent(component: DateComponent<any>): void;
	    unregisterComponent(component: DateComponent<any>): void;
	    bindComponent(component: DateComponent<any>): void;
	    unbindComponent(component: DateComponent<any>): void;
	} const _default: BrowserContext;
	export default _default;
}
declare module 'fullcalendar/FgEventRenderer' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateFormatter } from 'fullcalendar/src/datelib/formatting';
	import { EventUi } from 'fullcalendar/src/component/event-ui';
	import { EventRenderRange } from 'fullcalendar/src/component/event-rendering';
	import { Seg } from 'fullcalendar/DateComponent';
	import { ComponentContext } from 'fullcalendar/Component';
	export abstract class Default {
	    context: ComponentContext;
	    eventTimeFormat: DateFormatter;
	    displayEventTime: boolean;
	    displayEventEnd: boolean;
	    segs: Seg[];
	    isSizeDirty: boolean;
	    constructor(context: ComponentContext);
	    renderSegs(segs: Seg[], mirrorInfo?: any): void;
	    unrender(): void;
	    abstract renderSegHtml(seg: Seg, mirrorInfo: any): string;
	    abstract attachSegs(segs: Seg[], mirrorInfo: any): any;
	    abstract detachSegs(segs: Seg[]): any;
	    rangeUpdated(): void;
	    renderSegEls(segs: Seg[], mirrorInfo: any): Seg[];
	    getSegClasses(seg: Seg, isDraggable: any, isResizable: any, mirrorInfo: any): string[];
	    getTimeText(eventRange: EventRenderRange, formatter?: any, displayEnd?: any): any;
	    _getTimeText(start: DateMarker, end: DateMarker, allDay: any, formatter?: any, displayEnd?: any, forcedStartTzo?: number, forcedEndTzo?: number): any;
	    computeEventTimeFormat(): any;
	    computeDisplayEventTime(): boolean;
	    computeDisplayEventEnd(): boolean;
	    getSkinCss(ui: EventUi): {
	        'background-color': string;
	        'border-color': string;
	        color: string;
	    };
	    sortEventSegs(segs: any): Seg[];
	    computeSizes(force: boolean): void;
	    assignSizes(force: boolean): void;
	    computeSegSizes(segs: Seg[]): void;
	    assignSegSizes(segs: Seg[]): void;
	    hideByHash(hash: any): void;
	    showByHash(hash: any): void;
	    selectByInstanceId(instanceId: string): void;
	    unselectByInstanceId(instanceId: string): void;
	}
	export function buildSegCompareObj(seg: Seg): any;
	export default Default;
}
declare module 'fullcalendar/src/util/html' {
	export function htmlEscape(s: any): string;
	export function cssToStr(cssProps: any): string;
	export function attrsToStr(attrs: any): string;
	export type ClassNameInput = string | string[];
	export function parseClassName(raw: ClassNameInput): string[];
}
declare module 'fullcalendar/FillRenderer' {
	import { Seg } from 'fullcalendar/DateComponent';
	import { ComponentContext } from 'fullcalendar/Component';
	export abstract class Default {
	    context: ComponentContext;
	    fillSegTag: string;
	    containerElsByType: any;
	    segsByType: any;
	    dirtySizeFlags: any;
	    constructor(context: ComponentContext);
	    getSegsByType(type: string): any;
	    renderSegs(type: any, segs: Seg[]): void;
	    unrender(type: any): void;
	    renderSegEls(type: any, segs: Seg[]): Seg[];
	    renderSegHtml(type: any, seg: Seg): string;
	    abstract attachSegs(type: any, segs: Seg[]): HTMLElement[] | void;
	    detachSegs(type: any, segs: Seg[]): void;
	    computeSizes(force: boolean): void;
	    assignSizes(force: boolean): void;
	    computeSegSizes(segs: Seg[]): void;
	    assignSegSizes(segs: Seg[]): void;
	}
	export default Default;
}
declare module 'fullcalendar/DateComponent' {
	import Component, { ComponentContext } from 'fullcalendar/Component';
	import { EventRenderRange } from 'fullcalendar/src/component/event-rendering';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { EventInstanceHash } from 'fullcalendar/src/structs/event';
	import { Hit } from 'fullcalendar/HitDragging';
	import FgEventRenderer from 'fullcalendar/FgEventRenderer';
	import FillRenderer from 'fullcalendar/FillRenderer';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	export type DateComponentHash = {
	    [uid: string]: Default<any>;
	};
	export interface Seg {
	    component?: Default<any>;
	    isStart: boolean;
	    isEnd: boolean;
	    eventRange?: EventRenderRange;
	    el?: HTMLElement;
	    [otherProp: string]: any;
	}
	export interface EventSegUiInteractionState {
	    affectedInstances: EventInstanceHash;
	    segs: Seg[];
	    isEvent: boolean;
	    sourceSeg: any;
	}
	export class Default<PropsType> extends Component<PropsType> {
	    isInteractable: boolean;
	    useEventCenter: boolean;
	    fgSegSelector: string;
	    bgSegSelector: string;
	    largeUnit: any;
	    eventRenderer: FgEventRenderer;
	    mirrorRenderer: FgEventRenderer;
	    fillRenderer: FillRenderer;
	    el: HTMLElement;
	    needHitsDepth: number;
	    constructor(context: ComponentContext, el: HTMLElement, isView?: boolean);
	    destroy(): void;
	    requestPrepareHits(): void;
	    requestReleaseHits(): void;
	    protected prepareHits(): void;
	    protected releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit | null;
	    isInteractionValid(interaction: EventInteractionState): boolean;
	    isDateSelectionValid(selection: DateSpan): boolean;
	    publiclyTrigger(name: any, args: any): any;
	    publiclyTriggerAfterSizing(name: any, args: any): void;
	    hasPublicHandlers(name: any): boolean;
	    triggerRenderedSegs(segs: Seg[], isMirrors: boolean): void;
	    triggerWillRemoveSegs(segs: Seg[]): void;
	    isValidSegDownEl(el: HTMLElement): boolean;
	    isValidDateDownEl(el: HTMLElement): boolean;
	    isInPopover(el: HTMLElement): boolean;
	}
	export default Default;
}
declare module 'fullcalendar/src/component/event-rendering' {
	import { EventDef, EventTuple, EventDefHash } from 'fullcalendar/src/structs/event';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { Seg } from 'fullcalendar/DateComponent';
	import View from 'fullcalendar/View';
	import { EventUi, EventUiHash } from 'fullcalendar/src/component/event-ui';
	export interface EventRenderRange extends EventTuple {
	    ui: EventUi;
	    range: DateRange;
	    isStart: boolean;
	    isEnd: boolean;
	}
	export function sliceEventStore(eventStore: EventStore, eventUiBases: EventUiHash, framingRange: DateRange, nextDayThreshold?: Duration): {
	    bg: EventRenderRange[];
	    fg: EventRenderRange[];
	};
	export function hasBgRendering(def: EventDef): boolean;
	export function filterSegsViaEls(view: View, segs: Seg[], isMirror: any): Seg[];
	export function getElSeg(el: HTMLElement): Seg | null;
	export function compileEventUis(eventDefs: EventDefHash, eventUiBases: EventUiHash): {
	    [key: string]: EventUi;
	};
	export function compileEventUi(eventDef: EventDef, eventUiBases: EventUiHash): EventUi;
}
declare module 'fullcalendar/src/structs/date-span' {
	import { DateRange, OpenDateRange } from 'fullcalendar/src/datelib/date-range';
	import { DateInput, DateEnv } from 'fullcalendar/src/datelib/env';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { EventRenderRange } from 'fullcalendar/src/component/event-rendering';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	import Calendar from 'fullcalendar/Calendar';
	export interface OpenDateSpanInput {
	    start?: DateInput;
	    end?: DateInput;
	    allDay?: boolean;
	    [otherProp: string]: any;
	}
	export interface DateSpanInput extends OpenDateSpanInput {
	    start: DateInput;
	    end: DateInput;
	}
	export interface OpenDateSpan {
	    range: OpenDateRange;
	    allDay: boolean;
	    [otherProp: string]: any;
	}
	export interface DateSpan extends OpenDateSpan {
	    range: DateRange;
	}
	export interface DateSpanApi {
	    start: Date;
	    end: Date;
	    startStr: string;
	    endStr: string;
	    allDay: boolean;
	}
	export interface DatePointApi {
	    date: Date;
	    dateStr: string;
	    allDay: boolean;
	}
	export function parseDateSpan(raw: DateSpanInput, dateEnv: DateEnv, defaultDuration?: Duration): DateSpan | null;
	export function parseOpenDateSpan(raw: OpenDateSpanInput, dateEnv: DateEnv): OpenDateSpan | null;
	export function isDateSpansEqual(span0: DateSpan, span1: DateSpan): boolean;
	export function buildDateSpanApi(span: DateSpan, dateEnv: DateEnv): DateSpanApi;
	export function buildDatePointApi(span: DateSpan, dateEnv: DateEnv): DatePointApi;
	export function fabricateEventRange(dateSpan: DateSpan, eventUiBases: EventUiHash, calendar: Calendar): EventRenderRange;
}
declare module 'fullcalendar/src/reducers/types' {
	import { EventInput, EventInstanceHash } from 'fullcalendar/src/structs/event';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventMutation } from 'fullcalendar/src/structs/event-mutation';
	import { EventSource, EventSourceHash, EventSourceError } from 'fullcalendar/src/structs/event-source';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	import Calendar from 'fullcalendar/Calendar';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	export interface CalendarState {
	    eventSources: EventSourceHash;
	    eventSourceLoadingLevel: number;
	    loadingLevel: number;
	    viewType: string;
	    dateProfile: DateProfile | null;
	    eventStore: EventStore;
	    dateSelection: DateSpan | null;
	    eventSelection: string;
	    eventDrag: EventInteractionState | null;
	    eventResize: EventInteractionState | null;
	}
	export type reducerFunc = (state: CalendarState, action: Action, calendar: Calendar) => CalendarState;
	export type Action = {
	    type: 'INIT';
	} | // wont it create another reneder??
	{
	    type: 'SET_DATE_PROFILE';
	    dateProfile: DateProfile;
	} | {
	    type: 'SET_DATE';
	    dateMarker: DateMarker;
	} | {
	    type: 'SET_VIEW_TYPE';
	    viewType: string;
	    dateMarker?: DateMarker;
	} | {
	    type: 'SELECT_DATES';
	    selection: DateSpan;
	} | {
	    type: 'UNSELECT_DATES';
	} | {
	    type: 'SELECT_EVENT';
	    eventInstanceId: string;
	} | {
	    type: 'UNSELECT_EVENT';
	} | {
	    type: 'SET_EVENT_DRAG';
	    state: EventInteractionState;
	} | {
	    type: 'UNSET_EVENT_DRAG';
	} | {
	    type: 'SET_EVENT_RESIZE';
	    state: EventInteractionState;
	} | {
	    type: 'UNSET_EVENT_RESIZE';
	} | {
	    type: 'ADD_EVENT_SOURCES';
	    sources: EventSource[];
	} | {
	    type: 'REMOVE_EVENT_SOURCE';
	    sourceId: string;
	} | {
	    type: 'REMOVE_ALL_EVENT_SOURCES';
	} | {
	    type: 'FETCH_EVENT_SOURCES';
	    sourceIds?: string[];
	} | // if no sourceIds, fetch all
	{
	    type: 'CHANGE_TIMEZONE';
	    oldDateEnv: DateEnv;
	} | {
	    type: 'RECEIVE_EVENTS';
	    sourceId: string;
	    fetchId: string;
	    fetchRange: DateRange | null;
	    rawEvents: EventInput[];
	} | {
	    type: 'RECEIVE_EVENT_ERROR';
	    sourceId: string;
	    fetchId: string;
	    fetchRange: DateRange | null;
	    error: EventSourceError;
	} | // need all these?
	{
	    type: 'ADD_EVENTS';
	    eventStore: EventStore;
	} | {
	    type: 'MERGE_EVENTS';
	    eventStore: EventStore;
	} | {
	    type: 'MUTATE_EVENTS';
	    instanceId: string;
	    mutation: EventMutation;
	    fromApi?: boolean;
	} | {
	    type: 'REMOVE_EVENT_DEF';
	    defId: string;
	} | {
	    type: 'REMOVE_EVENT_INSTANCES';
	    instances: EventInstanceHash;
	} | {
	    type: 'REMOVE_ALL_EVENTS';
	} | {
	    type: 'RESET_EVENTS';
	};
}
declare module 'fullcalendar/src/reducers/eventStore' {
	import Calendar from 'fullcalendar/Calendar';
	import { EventInstanceHash } from 'fullcalendar/src/structs/event';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { Action } from 'fullcalendar/src/reducers/types';
	import { EventSourceHash } from 'fullcalendar/src/structs/event-source';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export default function (eventStore: EventStore, action: Action, eventSources: EventSourceHash, dateProfile: DateProfile, calendar: Calendar): EventStore;
	export function excludeInstances(eventStore: EventStore, removals: EventInstanceHash): EventStore;
}
declare module 'fullcalendar/src/component/event-splitting' {
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventDef } from 'fullcalendar/src/structs/event';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { EventUiHash, EventUi } from 'fullcalendar/src/component/event-ui';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	export interface SplittableProps {
	    businessHours: EventStore | null;
	    dateSelection: DateSpan | null;
	    eventStore: EventStore;
	    eventUiBases: EventUiHash;
	    eventSelection: string;
	    eventDrag: EventInteractionState | null;
	    eventResize: EventInteractionState | null;
	}
	export abstract class Default<PropsType extends SplittableProps = SplittableProps> {
	    private getKeysForEventDefs;
	    private splitDateSelection;
	    private splitEventStore;
	    private splitIndividualUi;
	    private splitEventDrag;
	    private splitEventResize;
	    private eventUiBuilders;
	    abstract getKeyInfo(props: PropsType): {
	        [key: string]: {
	            ui?: EventUi;
	            businessHours?: EventStore;
	        };
	    };
	    abstract getKeysForDateSpan(dateSpan: DateSpan): string[];
	    abstract getKeysForEventDef(eventDef: EventDef): string[];
	    splitProps(props: PropsType): {
	        [key: string]: SplittableProps;
	    };
	    private _splitDateSpan;
	    private _getKeysForEventDefs;
	    private _splitEventStore;
	    private _splitIndividualUi;
	    private _splitInteraction;
	}
	export default Default;
}
declare module 'fullcalendar/src/validation' {
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import Calendar from 'fullcalendar/Calendar';
	import { DateSpan, DateSpanApi } from 'fullcalendar/src/structs/date-span';
	import EventApi from 'fullcalendar/EventApi';
	import { EventInput } from 'fullcalendar/src/structs/event';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { SplittableProps } from 'fullcalendar/src/component/event-splitting';
	export type ConstraintInput = 'businessHours' | string | EventInput | EventInput[];
	export type Constraint = 'businessHours' | string | EventStore | false;
	export type OverlapFunc = ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean);
	export type AllowFunc = (span: DateSpanApi, movingEvent: EventApi | null) => boolean;
	export type isPropsValidTester = (props: SplittableProps, calendar: Calendar) => boolean;
	export function isInteractionValid(interaction: EventInteractionState, calendar: Calendar): boolean;
	export function isDateSelectionValid(dateSelection: DateSpan, calendar: Calendar): boolean;
	export function isPropsValid(state: SplittableProps, calendar: Calendar, dateSpanMeta?: {}, filterConfig?: any): boolean;
	export function normalizeConstraint(input: ConstraintInput, calendar: Calendar): Constraint | null;
}
declare module 'fullcalendar/src/component/event-ui' {
	import { Constraint, AllowFunc, ConstraintInput } from 'fullcalendar/src/validation';
	import { parseClassName } from 'fullcalendar/src/util/html';
	import Calendar from 'fullcalendar/Calendar';
	export interface UnscopedEventUiInput {
	    editable?: boolean;
	    startEditable?: boolean;
	    durationEditable?: boolean;
	    constraint?: ConstraintInput;
	    overlap?: boolean;
	    allow?: AllowFunc;
	    className?: string[] | string;
	    classNames?: string[] | string;
	    backgroundColor?: string;
	    borderColor?: string;
	    textColor?: string;
	    color?: string;
	}
	export interface EventUi {
	    startEditable: boolean | null;
	    durationEditable: boolean | null;
	    constraints: Constraint[];
	    overlap: boolean | null;
	    allows: AllowFunc[];
	    backgroundColor: string;
	    borderColor: string;
	    textColor: string;
	    classNames: string[];
	}
	export type EventUiHash = {
	    [defId: string]: EventUi;
	};
	export const UNSCOPED_EVENT_UI_PROPS: {
	    editable: BooleanConstructor;
	    startEditable: BooleanConstructor;
	    durationEditable: BooleanConstructor;
	    constraint: any;
	    overlap: any;
	    allow: any;
	    className: typeof parseClassName;
	    classNames: typeof parseClassName;
	    color: StringConstructor;
	    backgroundColor: StringConstructor;
	    borderColor: StringConstructor;
	    textColor: StringConstructor;
	};
	export function processUnscopedUiProps(rawProps: UnscopedEventUiInput, calendar: Calendar, leftovers?: any): EventUi;
	export function processScopedUiProps(prefix: string, rawScoped: any, calendar: Calendar, leftovers?: any): EventUi;
	export function combineEventUis(uis: EventUi[]): EventUi;
}
declare module 'fullcalendar/src/structs/event' {
	import { DateInput } from 'fullcalendar/src/datelib/env';
	import Calendar from 'fullcalendar/Calendar';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { UnscopedEventUiInput, EventUi } from 'fullcalendar/src/component/event-ui';
	export type EventRenderingChoice = '' | 'background' | 'inverse-background' | 'none';
	export interface EventNonDateInput extends UnscopedEventUiInput {
	    id?: string | number;
	    groupId?: string | number;
	    title?: string;
	    url?: string;
	    rendering?: EventRenderingChoice;
	    extendedProps?: object;
	    [extendedProp: string]: any;
	}
	export interface EventDateInput {
	    start?: DateInput;
	    end?: DateInput;
	    date?: DateInput;
	    allDay?: boolean;
	}
	export type EventInput = EventNonDateInput & EventDateInput;
	export interface EventDef {
	    defId: string;
	    sourceId: string;
	    publicId: string;
	    groupId: string;
	    allDay: boolean;
	    hasEnd: boolean;
	    recurringDef: {
	        typeId: number;
	        typeData: any;
	        duration: Duration | null;
	    } | null;
	    title: string;
	    url: string;
	    rendering: EventRenderingChoice;
	    ui: EventUi;
	    extendedProps: any;
	}
	export interface EventInstance {
	    instanceId: string;
	    defId: string;
	    range: DateRange;
	    forcedStartTzo: number | null;
	    forcedEndTzo: number | null;
	}
	export interface EventTuple {
	    def: EventDef;
	    instance: EventInstance | null;
	}
	export type EventInstanceHash = {
	    [instanceId: string]: EventInstance;
	};
	export type EventDefHash = {
	    [defId: string]: EventDef;
	};
	export const NON_DATE_PROPS: {
	    id: StringConstructor;
	    groupId: StringConstructor;
	    title: StringConstructor;
	    url: StringConstructor;
	    rendering: StringConstructor;
	    extendedProps: any;
	};
	export const DATE_PROPS: {
	    start: any;
	    date: any;
	    end: any;
	    allDay: any;
	};
	export function parseEvent(raw: EventInput, sourceId: string, calendar: Calendar, allowOpenRange?: boolean): EventTuple | null;
	export function parseEventDef(raw: EventNonDateInput, sourceId: string, allDay: boolean, hasEnd: boolean, calendar: Calendar): EventDef;
	export type eventDefParserFunc = (def: EventDef, props: any, leftovers: any) => void;
	export function createEventInstance(defId: string, range: DateRange, forcedStartTzo?: number, forcedEndTzo?: number): EventInstance;
}
declare module 'fullcalendar/src/util/promise' {
	export function unpromisify(func: any, success: any, failure?: any): void;
}
declare module 'fullcalendar/src/event-sources/func-event-source' {
	import { EventSourceError } from 'fullcalendar/src/structs/event-source';
	import { EventInput } from 'fullcalendar/src/structs/event';
	export type EventSourceFunc = (arg: {
	    start: Date;
	    end: Date;
	    timeZone: string;
	}, successCallback: (events: EventInput[]) => void, failureCallback: (error: EventSourceError) => void) => (void | PromiseLike<EventInput[]>);
}
declare module 'fullcalendar/src/structs/event-source' {
	import { EventInput } from 'fullcalendar/src/structs/event';
	import Calendar from 'fullcalendar/Calendar';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { EventSourceFunc } from 'fullcalendar/src/event-sources/func-event-source';
	import { EventUi } from 'fullcalendar/src/component/event-ui';
	import { ConstraintInput, AllowFunc } from 'fullcalendar/src/validation';
	export type EventSourceError = {
	    message: string;
	    response?: any;
	    [otherProp: string]: any;
	};
	export type EventInputTransformer = (eventInput: EventInput) => EventInput | null;
	export type EventSourceSuccessResponseHandler = (rawData: any, response: any) => EventInput[] | void;
	export type EventSourceErrorResponseHandler = (error: EventSourceError) => void;
	export interface ExtendedEventSourceInput {
	    id?: string | number;
	    allDayDefault?: boolean;
	    eventDataTransform?: EventInputTransformer;
	    events?: EventInput[];
	    url?: string;
	    method?: string;
	    extraParams?: object | (() => object);
	    startParam?: string;
	    endParam?: string;
	    timeZoneParam?: string;
	    success?: EventSourceSuccessResponseHandler;
	    failure?: EventSourceErrorResponseHandler;
	    editable?: boolean;
	    startEditable?: boolean;
	    durationEditable?: boolean;
	    constraint?: ConstraintInput;
	    overlap?: boolean;
	    allow?: AllowFunc;
	    className?: string[] | string;
	    classNames?: string[] | string;
	    backgroundColor?: string;
	    borderColor?: string;
	    textColor?: string;
	    color?: string;
	    [otherProp: string]: any;
	}
	export type EventSourceInput = ExtendedEventSourceInput | // object in extended form
	EventSourceFunc | // just a function
	string;
	export interface EventSource {
	    sourceId: string;
	    sourceDefId: number;
	    meta: any;
	    publicId: string;
	    isFetching: boolean;
	    latestFetchId: string;
	    fetchRange: DateRange | null;
	    allDayDefault: boolean | null;
	    eventDataTransform: EventInputTransformer;
	    ui: EventUi;
	    success: EventSourceSuccessResponseHandler | null;
	    failure: EventSourceErrorResponseHandler | null;
	    extendedProps: any;
	}
	export type EventSourceHash = {
	    [sourceId: string]: EventSource;
	};
	export type EventSourceFetcher = (arg: {
	    eventSource: EventSource;
	    calendar: Calendar;
	    range: DateRange;
	}, success: (res: {
	    rawEvents: EventInput[];
	    response?: any;
	}) => void, failure: (error: EventSourceError) => void) => (void | PromiseLike<EventInput[]>);
	export interface EventSourceDef {
	    ignoreRange?: boolean;
	    parseMeta: (raw: EventSourceInput) => object | null;
	    fetch: EventSourceFetcher;
	}
	export function registerEventSourceDef(def: EventSourceDef): void;
	export function getEventSourceDef(id: number): EventSourceDef;
	export function doesSourceNeedRange(eventSource: EventSource): boolean;
	export function parseEventSource(raw: EventSourceInput, calendar: Calendar): EventSource | null;
}
declare module 'fullcalendar/src/reducers/eventSources' {
	import { EventSourceHash } from 'fullcalendar/src/structs/event-source';
	import Calendar from 'fullcalendar/Calendar';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { Action } from 'fullcalendar/src/reducers/types';
	export default function (eventSources: EventSourceHash, action: Action, dateProfile: DateProfile | null, calendar: Calendar): EventSourceHash;
}
declare module 'fullcalendar/src/reducers/main' {
	import Calendar from 'fullcalendar/Calendar';
	import { CalendarState, Action } from 'fullcalendar/src/reducers/types';
	export default function (state: CalendarState, action: Action, calendar: Calendar): CalendarState;
}
declare module 'fullcalendar/src/component/memoized-rendering' {
	export interface MemoizedRendering<ArgsType extends any[]> {
	    (...args: ArgsType): void;
	    unrender: () => void;
	    dependents: MemoizedRendering<any>[];
	}
	export function memoizeRendering<ArgsType extends any[]>(renderFunc: (...args: ArgsType) => void, unrenderFunc?: (...args: ArgsType) => void, dependencies?: MemoizedRendering<any>[]): MemoizedRendering<ArgsType>;
}
declare module 'fullcalendar/Toolbar' {
	import Component, { ComponentContext } from 'fullcalendar/Component';
	export interface ToolbarRenderProps {
	    layout: any;
	    title: string;
	    activeButton: string;
	    isTodayEnabled: boolean;
	    isPrevEnabled: boolean;
	    isNextEnabled: boolean;
	}
	export class Default extends Component<ToolbarRenderProps> {
	    el: HTMLElement;
	    viewsWithButtons: any;
	    private _renderLayout;
	    private _updateTitle;
	    private _updateActiveButton;
	    private _updateToday;
	    private _updatePrev;
	    private _updateNext;
	    constructor(context: ComponentContext, extraClassName: any);
	    destroy(): void;
	    render(props: ToolbarRenderProps): void;
	    renderLayout(layout: any): void;
	    unrenderLayout(): void;
	    renderSection(position: any, buttonStr: any): HTMLElement;
	    updateToday(isTodayEnabled: any): void;
	    updatePrev(isPrevEnabled: any): void;
	    updateNext(isNextEnabled: any): void;
	    updateTitle(text: any): void;
	    updateActiveButton(buttonName?: any): void;
	    toggleButtonEnabled(buttonName: any, bool: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/src/structs/business-hours' {
	import Calendar from 'fullcalendar/Calendar';
	import { EventInput } from 'fullcalendar/src/structs/event';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	export type BusinessHoursInput = boolean | EventInput | EventInput[];
	export function parseBusinessHours(input: BusinessHoursInput, calendar: Calendar): EventStore;
}
declare module 'fullcalendar/CalendarComponent' {
	import Component, { ComponentContext } from 'fullcalendar/Component';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import View from 'fullcalendar/View';
	import Toolbar from 'fullcalendar/Toolbar';
	import DateProfileGenerator, { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	import { BusinessHoursInput } from 'fullcalendar/src/structs/business-hours';
	import { CalendarState } from 'fullcalendar/src/reducers/types';
	export interface CalendarComponentProps extends CalendarState {
	    viewSpec: ViewSpec;
	    dateProfileGenerator: DateProfileGenerator;
	    eventUiBases: EventUiHash;
	}
	export class Default extends Component<CalendarComponentProps> {
	    view: View;
	    header: Toolbar;
	    footer: Toolbar;
	    computeTitle: (dateProfile: any, viewOptions: any) => string;
	    parseBusinessHours: (input: BusinessHoursInput) => EventStore;
	    el: HTMLElement;
	    contentEl: HTMLElement;
	    isHeightAuto: boolean;
	    viewHeight: number;
	    private _renderToolbars;
	    private buildViewPropTransformers;
	    constructor(context: ComponentContext, el: HTMLElement);
	    destroy(): void;
	    toggleElClassNames(bool: boolean): void;
	    render(props: CalendarComponentProps): void;
	    renderToolbars(viewSpec: ViewSpec, dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator, title: string): void;
	    renderView(props: CalendarComponentProps, title: string): void;
	    updateSize(isResize?: boolean): void;
	    computeHeightVars(): void;
	    queryToolbarsHeight(): number;
	    freezeHeight(): void;
	    thawHeight(): void;
	}
	export default Default;
}
declare module 'fullcalendar/src/structs/drag-meta' {
	import { Duration, DurationInput } from 'fullcalendar/src/datelib/duration';
	import { EventNonDateInput } from 'fullcalendar/src/structs/event';
	export interface DragMetaInput extends EventNonDateInput {
	    startTime?: DurationInput;
	    duration?: DurationInput;
	    create?: boolean;
	    sourceId?: string;
	}
	export interface DragMeta {
	    startTime: Duration | null;
	    duration: Duration | null;
	    create: boolean;
	    sourceId: string;
	    leftoverProps: object;
	}
	export function parseDragMeta(raw: DragMetaInput): DragMeta;
}
declare module 'fullcalendar/ExternalElementDragging' {
	import ElementDragging from 'fullcalendar/ElementDragging';
	import HitDragging, { Hit } from 'fullcalendar/HitDragging';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import { EventTuple } from 'fullcalendar/src/structs/event';
	import { DateSpan, DatePointApi } from 'fullcalendar/src/structs/date-span';
	import Calendar from 'fullcalendar/Calendar';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { DragMetaInput, DragMeta } from 'fullcalendar/src/structs/drag-meta';
	import View from 'fullcalendar/View';
	export type DragMetaGenerator = DragMetaInput | ((el: HTMLElement) => DragMetaInput);
	export interface ExternalDropApi extends DatePointApi {
	    draggedEl: HTMLElement;
	    jsEvent: UIEvent;
	    view: View;
	}
	export class Default {
	    hitDragging: HitDragging;
	    receivingCalendar: Calendar | null;
	    droppableEvent: EventTuple | null;
	    suppliedDragMeta: DragMetaGenerator | null;
	    dragMeta: DragMeta | null;
	    constructor(dragging: ElementDragging, suppliedDragMeta?: DragMetaGenerator);
	    handleDragStart: (ev: PointerDragEvent) => void;
	    buildDragMeta(subjectEl: HTMLElement): DragMeta;
	    handleHitUpdate: (hit: Hit, isFinal: boolean, ev: PointerDragEvent) => void;
	    handleDragEnd: (pev: PointerDragEvent) => void;
	    displayDrag(nextCalendar: Calendar | null, state: EventInteractionState): void;
	    clearDrag(): void;
	    canDropElOnCalendar(el: HTMLElement, receivingCalendar: Calendar): boolean;
	}
	export type ExternalDefTransform = (dateSpan: DateSpan, dragMeta: DragMeta) => any;
	export default Default;
}
declare module 'fullcalendar/src/plugin-system' {
	import { reducerFunc } from 'fullcalendar/src/reducers/types';
	import { eventDefParserFunc } from 'fullcalendar/src/structs/event';
	import { eventDragMutationMassager } from 'fullcalendar/EventDragging';
	import { eventDefMutationApplier } from 'fullcalendar/src/structs/event-mutation';
	import Calendar, { DatePointTransform, DateSpanTransform } from 'fullcalendar/Calendar';
	import { dateSelectionJoinTransformer } from 'fullcalendar/DateSelecting';
	import { ViewConfigInputHash } from 'fullcalendar/src/structs/view-config';
	import { ViewSpecTransformer, ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import View, { ViewProps } from 'fullcalendar/View';
	import { CalendarComponentProps } from 'fullcalendar/CalendarComponent';
	import { isPropsValidTester } from 'fullcalendar/src/validation';
	import { ExternalDefTransform } from 'fullcalendar/ExternalElementDragging';
	import { EventResizeJoinTransforms } from 'fullcalendar/EventResizing';
	export interface PluginDefInput {
	    deps?: PluginDef[];
	    reducers?: reducerFunc[];
	    eventDefParsers?: eventDefParserFunc[];
	    eventDragMutationMassagers?: eventDragMutationMassager[];
	    eventDefMutationAppliers?: eventDefMutationApplier[];
	    dateSelectionTransformers?: dateSelectionJoinTransformer[];
	    datePointTransforms?: DatePointTransform[];
	    dateSpanTransforms?: DateSpanTransform[];
	    viewConfigs?: ViewConfigInputHash;
	    viewSpecTransformers?: ViewSpecTransformer[];
	    viewPropsTransformers?: ViewPropsTransformerClass[];
	    isPropsValid?: isPropsValidTester;
	    externalDefTransforms?: ExternalDefTransform[];
	    eventResizeJoinTransforms?: EventResizeJoinTransforms[];
	    viewContainerModifiers?: ViewContainerModifier[];
	}
	export interface PluginHooks {
	    reducers: reducerFunc[];
	    eventDefParsers: eventDefParserFunc[];
	    eventDragMutationMassagers: eventDragMutationMassager[];
	    eventDefMutationAppliers: eventDefMutationApplier[];
	    dateSelectionTransformers: dateSelectionJoinTransformer[];
	    datePointTransforms: DatePointTransform[];
	    dateSpanTransforms: DateSpanTransform[];
	    viewConfigs: ViewConfigInputHash;
	    viewSpecTransformers: ViewSpecTransformer[];
	    viewPropsTransformers: ViewPropsTransformerClass[];
	    isPropsValid: isPropsValidTester | null;
	    externalDefTransforms: ExternalDefTransform[];
	    eventResizeJoinTransforms: EventResizeJoinTransforms[];
	    viewContainerModifiers: ViewContainerModifier[];
	}
	export interface PluginDef extends PluginHooks {
	    id: string;
	    deps: PluginDef[];
	}
	export type ViewPropsTransformerClass = new () => ViewPropsTransformer;
	export interface ViewPropsTransformer {
	    transform(viewProps: ViewProps, viewSpec: ViewSpec, calendarProps: CalendarComponentProps, view: View): any;
	}
	export type ViewContainerModifier = (contentEl: HTMLElement, calendar: Calendar) => void;
	export function createPlugin(input: PluginDefInput): PluginDef;
	export class PluginSystem {
	    hooks: PluginHooks;
	    addedHash: {
	        [pluginId: string]: true;
	    };
	    constructor();
	    add(plugin: PluginDef): void;
	}
}
declare module 'fullcalendar/Calendar' {
	import { EmitterInterface } from 'fullcalendar/EmitterMixin';
	import OptionsManager from 'fullcalendar/OptionsManager';
	import View from 'fullcalendar/View';
	import Theme from 'fullcalendar/Theme';
	import { OptionsInput } from 'fullcalendar/src/types/input-types';
	import { DateEnv, DateInput } from 'fullcalendar/src/datelib/env';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateSpan, DateSpanApi, DatePointApi } from 'fullcalendar/src/structs/date-span';
	import { DateRangeInput } from 'fullcalendar/src/datelib/date-range';
	import DateProfileGenerator from 'fullcalendar/DateProfileGenerator';
	import { EventSourceInput } from 'fullcalendar/src/structs/event-source';
	import { EventInput } from 'fullcalendar/src/structs/event';
	import { CalendarState, Action } from 'fullcalendar/src/reducers/types';
	import EventSourceApi from 'fullcalendar/EventSourceApi';
	import EventApi from 'fullcalendar/EventApi';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventUiHash, EventUi } from 'fullcalendar/src/component/event-ui';
	import PointerDragging, { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import { ViewSpecHash, ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import { PluginSystem, PluginDef } from 'fullcalendar/src/plugin-system';
	import CalendarComponent from 'fullcalendar/CalendarComponent';
	export interface DateClickApi extends DatePointApi {
	    dayEl: HTMLElement;
	    jsEvent: UIEvent;
	    view: View;
	}
	export interface DateSelectionApi extends DateSpanApi {
	    jsEvent: UIEvent;
	    view: View;
	}
	export type DatePointTransform = (dateSpan: DateSpan, calendar: Default) => any;
	export type DateSpanTransform = (dateSpan: DateSpan, calendar: Default) => any;
	export class Default {
	    static on: EmitterInterface['on'];
	    static off: EmitterInterface['off'];
	    static trigger: EmitterInterface['trigger'];
	    static defaultPlugins: PluginDef[];
	    on: EmitterInterface['on'];
	    one: EmitterInterface['one'];
	    off: EmitterInterface['off'];
	    trigger: EmitterInterface['trigger'];
	    triggerWith: EmitterInterface['triggerWith'];
	    hasHandlers: EmitterInterface['hasHandlers'];
	    private buildDateEnv;
	    private buildTheme;
	    private buildEventUiSingleBase;
	    private buildSelectionConfig;
	    private buildEventUiBySource;
	    private buildEventUiBases;
	    eventUiBases: EventUiHash;
	    selectionConfig: EventUi;
	    optionsManager: OptionsManager;
	    viewSpecs: ViewSpecHash;
	    dateProfileGenerators: {
	        [viewName: string]: DateProfileGenerator;
	    };
	    theme: Theme;
	    dateEnv: DateEnv;
	    pluginSystem: PluginSystem;
	    defaultAllDayEventDuration: Duration;
	    defaultTimedEventDuration: Duration;
	    removeNavLinkListener: any;
	    documentPointer: PointerDragging;
	    isRecentPointerDateSelect: boolean;
	    windowResizeProxy: any;
	    isResizing: boolean;
	    state: CalendarState;
	    actionQueue: any[];
	    isReducing: boolean;
	    needsRerender: boolean;
	    needsFullRerender: boolean;
	    isRendering: boolean;
	    renderingPauseDepth: number;
	    renderableEventStore: EventStore;
	    buildDelayedRerender: typeof buildDelayedRerender;
	    delayedRerender: any;
	    afterSizingTriggers: any;
	    isViewUpdated: boolean;
	    isDatesUpdated: boolean;
	    isEventsUpdated: boolean;
	    el: HTMLElement;
	    component: CalendarComponent;
	    constructor(el: HTMLElement, overrides: OptionsInput);
	    readonly view: View;
	    render(): void;
	    destroy(): void;
	    bindHandlers(): void;
	    unbindHandlers(): void;
	    hydrate(): void;
	    buildInitialState(): CalendarState;
	    dispatch(action: Action): void;
	    reduce(state: CalendarState, action: Action, calendar: Default): CalendarState;
	    requestRerender(needsFull?: boolean): void;
	    tryRerender(): void;
	    batchRendering(func: any): void;
	    executeRender(): void;
	    renderComponent(needsFull: any): void;
	    setOption(name: string, value: any): void;
	    getOption(name: string): any;
	    opt(name: string): any;
	    viewOpt(name: string): any;
	    viewOpts(): any;
	    handleOptions(options: any): void;
	    _buildSelectionConfig(rawOpts: any): EventUi;
	    _buildEventUiSingleBase(rawOpts: any): EventUi;
	    hasPublicHandlers(name: string): boolean;
	    publiclyTrigger(name: string, args?: any): any;
	    publiclyTriggerAfterSizing(name: any, args: any): void;
	    releaseAfterSizingTriggers(): void;
	    isValidViewType(viewType: string): boolean;
	    changeView(viewType: string, dateOrRange?: DateRangeInput | DateInput): void;
	    zoomTo(dateMarker: DateMarker, viewType?: string): void;
	    getUnitViewSpec(unit: string): ViewSpec | null;
	    getInitialDate(): Date;
	    prev(): void;
	    next(): void;
	    prevYear(): void;
	    nextYear(): void;
	    today(): void;
	    gotoDate(zonedDateInput: any): void;
	    incrementDate(deltaInput: any): void;
	    getDate(): Date;
	    formatDate(d: Date, formatter: any): string;
	    formatRange(d0: Date, d1: Date, settings: any): any;
	    formatIso(d: Date, omitTime?: boolean): string;
	    windowResize(ev: Event): void;
	    updateSize(): void;
	    resizeComponent(): boolean;
	    select(dateOrObj: DateInput | any, endDate?: DateInput): void;
	    unselect(pev?: PointerDragEvent): void;
	    triggerDateSelect(selection: DateSpan, pev?: PointerDragEvent): void;
	    triggerDateUnselect(pev?: PointerDragEvent): void;
	    triggerDateClick(dateSpan: DateSpan, dayEl: HTMLElement, view: View, ev: UIEvent): void;
	    buildDatePointApi(dateSpan: DateSpan): DatePointApi;
	    buildDateSpanApi(dateSpan: DateSpan): DateSpanApi;
	    onDocumentPointerUp: (pev: PointerDragEvent) => void;
	    getNow(): DateMarker;
	    getDefaultEventEnd(allDay: boolean, marker: DateMarker): DateMarker;
	    addEvent(eventInput: EventInput, sourceInput?: any): EventApi | null;
	    getEventById(id: string): EventApi | null;
	    getEvents(): EventApi[];
	    removeAllEvents(): void;
	    rerenderEvents(): void;
	    getEventSources(): EventSourceApi[];
	    getEventSourceById(id: string): EventSourceApi | null;
	    addEventSource(sourceInput: EventSourceInput): EventSourceApi;
	    removeAllEventSources(): void;
	    refetchEvents(): void;
	} function buildDelayedRerender(this: Default, wait: any): any;
	export {};
	export default Default;
}
declare module 'fullcalendar/Component' {
	import Calendar from 'fullcalendar/Calendar';
	import View from 'fullcalendar/View';
	import Theme from 'fullcalendar/Theme';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	export interface ComponentContext {
	    options: any;
	    dateEnv: DateEnv;
	    theme: Theme;
	    calendar: Calendar;
	    view: View;
	}
	export type EqualityFuncHash = {
	    [propName: string]: (obj0: any, obj1: any) => boolean;
	};
	export class Default<PropsType> {
	    equalityFuncs: EqualityFuncHash;
	    uid: string;
	    props: PropsType | null;
	    context: ComponentContext;
	    dateEnv: DateEnv;
	    theme: Theme;
	    view: View;
	    calendar: Calendar;
	    isRtl: boolean;
	    constructor(context: ComponentContext, isView?: boolean);
	    static addEqualityFuncs(newFuncs: EqualityFuncHash): void;
	    opt(name: any): any;
	    receiveProps(props: PropsType): void;
	    protected render(props: PropsType): void;
	    destroy(): void;
	}
	export default Default;
}
declare module 'fullcalendar/src/structs/view-config' {
	import View from 'fullcalendar/View';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import { ComponentContext } from 'fullcalendar/Component';
	import DateProfileGenerator from 'fullcalendar/DateProfileGenerator';
	export type ViewClass = new (context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement) => View;
	export interface ViewConfigObjectInput {
	    type?: string;
	    class?: ViewClass;
	    [optionName: string]: any;
	}
	export type ViewConfigInput = ViewClass | ViewConfigObjectInput;
	export type ViewConfigInputHash = {
	    [viewType: string]: ViewConfigInput;
	};
	export interface ViewConfig {
	    superType: string;
	    class: ViewClass | null;
	    options: any;
	}
	export type ViewConfigHash = {
	    [viewType: string]: ViewConfig;
	};
	export function parseViewConfigs(inputs: ViewConfigInputHash): ViewConfigHash;
}
declare module 'fullcalendar/src/structs/view-def' {
	import { ViewClass, ViewConfigHash } from 'fullcalendar/src/structs/view-config';
	export interface ViewDef {
	    type: string;
	    class: ViewClass;
	    overrides: any;
	    defaults: any;
	}
	export type ViewDefHash = {
	    [viewType: string]: ViewDef;
	};
	export function compileViewDefs(defaultConfigs: ViewConfigHash, overrideConfigs: ViewConfigHash): ViewDefHash;
}
declare module 'fullcalendar/src/structs/view-spec' {
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import OptionsManager from 'fullcalendar/OptionsManager';
	import { ViewConfigInputHash, ViewClass } from 'fullcalendar/src/structs/view-config';
	export interface ViewSpec {
	    type: string;
	    class: ViewClass;
	    duration: Duration;
	    durationUnit: string;
	    singleUnit: string;
	    options: any;
	    buttonTextOverride: string;
	    buttonTextDefault: string;
	}
	export type ViewSpecHash = {
	    [viewType: string]: ViewSpec;
	};
	export type ViewSpecTransformer = (viewSpec: ViewSpec) => ViewSpec;
	export function buildViewSpecs(defaultInputs: ViewConfigInputHash, optionsManager: OptionsManager, transformers: ViewSpecTransformer[]): ViewSpecHash;
}
declare module 'fullcalendar/DateProfileGenerator' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateRange, OpenDateRange } from 'fullcalendar/src/datelib/date-range';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	import Calendar from 'fullcalendar/Calendar';
	export interface DateProfile {
	    currentDate: DateMarker;
	    currentRange: DateRange;
	    currentRangeUnit: string;
	    isRangeAllDay: boolean;
	    validRange: OpenDateRange;
	    activeRange: DateRange;
	    renderRange: DateRange;
	    minTime: Duration;
	    maxTime: Duration;
	    isValid: boolean;
	    dateIncrement: Duration;
	}
	export class Default {
	    viewSpec: ViewSpec;
	    options: any;
	    dateEnv: DateEnv;
	    calendar: Calendar;
	    isHiddenDayHash: boolean[];
	    constructor(viewSpec: ViewSpec, calendar: Calendar);
	    buildPrev(currentDateProfile: DateProfile): DateProfile;
	    buildNext(currentDateProfile: DateProfile): DateProfile;
	    build(currentDate: DateMarker, direction?: any, forceToValid?: boolean): DateProfile;
	    buildValidRange(): OpenDateRange;
	    buildCurrentRangeInfo(date: DateMarker, direction: any): {
	        duration: any;
	        unit: any;
	        range: any;
	    };
	    getFallbackDuration(): Duration;
	    adjustActiveRange(range: DateRange, minTime: Duration, maxTime: Duration): {
	        start: Date;
	        end: Date;
	    };
	    buildRangeFromDuration(date: DateMarker, direction: any, duration: Duration, unit: any): any;
	    buildRangeFromDayCount(date: DateMarker, direction: any, dayCount: any): {
	        start: Date;
	        end: Date;
	    };
	    buildCustomVisibleRange(date: DateMarker): OpenDateRange;
	    buildRenderRange(currentRange: DateRange, currentRangeUnit: any, isRangeAllDay: any): DateRange;
	    buildDateIncrement(fallback: any): Duration;
	    getRangeOption(name: any, ...otherArgs: any[]): OpenDateRange;
	    initHiddenDays(): void;
	    trimHiddenDays(range: DateRange): DateRange | null;
	    isHiddenDay(day: any): boolean;
	    skipHiddenDays(date: DateMarker, inc?: number, isExclusive?: boolean): Date;
	}
	export function isDateProfilesEqual(p0: DateProfile, p1: DateProfile): boolean;
	export default Default;
}
declare module 'fullcalendar/View' {
	import DateProfileGenerator, { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { EmitterInterface } from 'fullcalendar/EmitterMixin';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import { ComponentContext } from 'fullcalendar/Component';
	import DateComponent from 'fullcalendar/DateComponent';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	import { EventRenderRange } from 'fullcalendar/src/component/event-rendering';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	export interface ViewProps {
	    dateProfile: DateProfile;
	    businessHours: EventStore;
	    eventStore: EventStore;
	    eventUiBases: EventUiHash;
	    dateSelection: DateSpan | null;
	    eventSelection: string;
	    eventDrag: EventInteractionState | null;
	    eventResize: EventInteractionState | null;
	}
	export abstract class Default extends DateComponent<ViewProps> {
	    usesMinMaxTime: boolean;
	    dateProfileGeneratorClass: any;
	    on: EmitterInterface['on'];
	    one: EmitterInterface['one'];
	    off: EmitterInterface['off'];
	    trigger: EmitterInterface['trigger'];
	    triggerWith: EmitterInterface['triggerWith'];
	    hasHandlers: EmitterInterface['hasHandlers'];
	    viewSpec: ViewSpec;
	    dateProfileGenerator: DateProfileGenerator;
	    type: string;
	    title: string;
	    queuedScroll: any;
	    eventOrderSpecs: any;
	    nextDayThreshold: Duration;
	    isNowIndicatorRendered: boolean;
	    initialNowDate: DateMarker;
	    initialNowQueriedMs: number;
	    nowIndicatorTimeoutID: any;
	    nowIndicatorIntervalID: any;
	    private renderDatesMem;
	    private renderBusinessHoursMem;
	    private renderDateSelectionMem;
	    private renderEventsMem;
	    private renderEventSelectionMem;
	    private renderEventDragMem;
	    private renderEventResizeMem;
	    constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement);
	    initialize(): void;
	    readonly activeStart: Date;
	    readonly activeEnd: Date;
	    readonly currentStart: Date;
	    readonly currentEnd: Date;
	    render(props: ViewProps): void;
	    destroy(): void;
	    updateSize(isResize: boolean, viewHeight: number, isAuto: boolean): void;
	    updateBaseSize(isResize: boolean, viewHeight: number, isAuto: boolean): void;
	    renderDatesWrap(dateProfile: DateProfile): void;
	    unrenderDatesWrap(): void;
	    renderDates(dateProfile: DateProfile): void;
	    unrenderDates(): void;
	    renderBusinessHours(businessHours: EventStore): void;
	    unrenderBusinessHours(): void;
	    renderDateSelectionWrap(selection: DateSpan): void;
	    unrenderDateSelectionWrap(selection: DateSpan): void;
	    renderDateSelection(selection: DateSpan): void;
	    unrenderDateSelection(selection: DateSpan): void;
	    renderEvents(eventStore: EventStore): void;
	    unrenderEvents(): void;
	    sliceEvents(eventStore: EventStore, allDay: boolean): EventRenderRange[];
	    renderEventSelectionWrap(instanceId: string): void;
	    unrenderEventSelectionWrap(instanceId: string): void;
	    renderEventSelection(instanceId: string): void;
	    unrenderEventSelection(instanceId: string): void;
	    renderEventDragWrap(state: EventInteractionState): void;
	    unrenderEventDragWrap(state: EventInteractionState): void;
	    renderEventDrag(state: EventInteractionState): void;
	    unrenderEventDrag(state: EventInteractionState): void;
	    renderEventResizeWrap(state: EventInteractionState): void;
	    unrenderEventResizeWrap(state: EventInteractionState): void;
	    renderEventResize(state: EventInteractionState): void;
	    unrenderEventResize(state: EventInteractionState): void;
	    startNowIndicator(dateProfile: DateProfile): void;
	    updateNowIndicator(): void;
	    stopNowIndicator(): void;
	    getNowIndicatorUnit(dateProfile: DateProfile): void;
	    renderNowIndicator(date: any): void;
	    unrenderNowIndicator(): void;
	    addScroll(scroll: any): void;
	    popScroll(): void;
	    applyQueuedScroll(): void;
	    queryScroll(): any;
	    applyScroll(scroll: any): void;
	    computeInitialDateScroll(): {};
	    queryDateScroll(): {};
	    applyDateScroll(scroll: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/src/types/input-types' {
	import View from 'fullcalendar/View';
	import { EventSourceInput, EventInputTransformer } from 'fullcalendar/src/structs/event-source';
	import { Duration, DurationInput } from 'fullcalendar/src/datelib/duration';
	import { DateInput } from 'fullcalendar/src/datelib/env';
	import { FormatterInput } from 'fullcalendar/src/datelib/formatting';
	import { DateRangeInput } from 'fullcalendar/src/datelib/date-range';
	import { BusinessHoursInput } from 'fullcalendar/src/structs/business-hours';
	import EventApi from 'fullcalendar/EventApi';
	import { AllowFunc, ConstraintInput, OverlapFunc } from 'fullcalendar/src/validation';
	import { PluginDef } from 'fullcalendar/src/plugin-system';
	export interface ToolbarInput {
	    left?: string;
	    center?: string;
	    right?: string;
	}
	export interface CustomButtonInput {
	    text: string;
	    icon?: string;
	    themeIcon?: string;
	    bootstrapGlyphicon?: string;
	    bootstrapFontAwesome?: string;
	    click(element: HTMLElement): void;
	}
	export interface ButtonIconsInput {
	    prev?: string;
	    next?: string;
	    prevYear?: string;
	    nextYear?: string;
	}
	export interface ButtonTextCompoundInput {
	    prev?: string;
	    next?: string;
	    prevYear?: string;
	    nextYear?: string;
	    today?: string;
	    month?: string;
	    week?: string;
	    day?: string;
	    [viewId: string]: string | undefined;
	}
	export interface EventSegment {
	    event: EventApi;
	    start: Date;
	    end: Date;
	    isStart: boolean;
	    isEnd: boolean;
	}
	export interface CellInfo {
	    date: Date;
	    dayEl: HTMLElement;
	    moreEl: HTMLElement;
	    segs: EventSegment[];
	    hiddenSegs: EventSegment[];
	}
	export interface DropInfo {
	    start: Date;
	    end: Date;
	}
	export interface OptionsInputBase {
	    header?: boolean | ToolbarInput;
	    footer?: boolean | ToolbarInput;
	    customButtons?: {
	        [name: string]: CustomButtonInput;
	    };
	    buttonIcons?: boolean | ButtonIconsInput;
	    themeSystem?: 'standard' | 'bootstrap3' | 'bootstrap4' | 'jquery-ui';
	    themeButtonIcons?: boolean | ButtonIconsInput;
	    bootstrapGlyphicons?: boolean | ButtonIconsInput;
	    bootstrapFontAwesome?: boolean | ButtonIconsInput;
	    firstDay?: number;
	    dir?: 'ltr' | 'rtl' | 'auto';
	    weekends?: boolean;
	    hiddenDays?: number[];
	    fixedWeekCount?: boolean;
	    weekNumbers?: boolean;
	    weekNumbersWithinDays?: boolean;
	    weekNumberCalculation?: 'local' | 'ISO' | ((m: Date) => number);
	    businessHours?: BusinessHoursInput;
	    showNonCurrentDates?: boolean;
	    height?: number | 'auto' | 'parent' | (() => number);
	    contentHeight?: number | 'auto' | (() => number);
	    aspectRatio?: number;
	    handleWindowResize?: boolean;
	    windowResizeDelay?: number;
	    eventLimit?: boolean | number;
	    eventLimitClick?: 'popover' | 'week' | 'day' | string | ((cellinfo: CellInfo, jsevent: Event) => void);
	    timeZone?: string | boolean;
	    now?: DateInput | (() => DateInput);
	    defaultView?: string;
	    allDaySlot?: boolean;
	    allDayText?: string;
	    slotDuration?: DurationInput;
	    slotLabelFormat?: FormatterInput;
	    slotLabelInterval?: DurationInput;
	    snapDuration?: DurationInput;
	    scrollTime?: DurationInput;
	    minTime?: DurationInput;
	    maxTime?: DurationInput;
	    slotEventOverlap?: boolean;
	    listDayFormat?: FormatterInput | boolean;
	    listDayAltFormat?: FormatterInput | boolean;
	    noEventsMessage?: string;
	    defaultDate?: DateInput;
	    nowIndicator?: boolean;
	    visibleRange?: ((currentDate: Date) => DateRangeInput) | DateRangeInput;
	    validRange?: DateRangeInput;
	    dateIncrement?: DurationInput;
	    dateAlignment?: string;
	    duration?: DurationInput;
	    dayCount?: number;
	    locale?: string;
	    eventTimeFormat?: FormatterInput;
	    columnHeader?: boolean;
	    columnHeaderFormat?: FormatterInput;
	    columnHeaderText?: string | ((date: DateInput) => string);
	    columnHeaderHtml?: string | ((date: DateInput) => string);
	    titleFormat?: FormatterInput;
	    weekLabel?: string;
	    displayEventTime?: boolean;
	    displayEventEnd?: boolean;
	    eventLimitText?: string | ((eventCnt: number) => string);
	    dayPopoverFormat?: FormatterInput;
	    navLinks?: boolean;
	    navLinkDayClick?: string | ((date: Date, jsEvent: Event) => void);
	    navLinkWeekClick?: string | ((weekStart: any, jsEvent: Event) => void);
	    selectable?: boolean;
	    selectMirror?: boolean;
	    unselectAuto?: boolean;
	    unselectCancel?: string;
	    selectConstraint?: ConstraintInput;
	    selectOverlap?: boolean | OverlapFunc;
	    selectAllow?: AllowFunc;
	    editable?: boolean;
	    eventStartEditable?: boolean;
	    eventDurationEditable?: boolean;
	    eventConstraint?: ConstraintInput;
	    eventOverlap?: boolean | OverlapFunc;
	    eventAllow?: AllowFunc;
	    eventClassName?: string[] | string;
	    eventClassNames?: string[] | string;
	    eventBackgroundColor?: string;
	    eventBorderColor?: string;
	    eventTextColor?: string;
	    eventColor?: string;
	    events?: EventSourceInput;
	    eventSources?: EventSourceInput[];
	    allDayDefault?: boolean;
	    startParam?: string;
	    endParam?: string;
	    lazyFetching?: boolean;
	    nextDayThreshold?: DurationInput;
	    eventOrder?: string | Array<((a: EventApi, b: EventApi) => number) | (string | ((a: EventApi, b: EventApi) => number))>;
	    rerenderDelay?: number | null;
	    dragRevertDuration?: number;
	    dragScroll?: boolean;
	    longPressDelay?: number;
	    eventLongPressDelay?: number;
	    droppable?: boolean;
	    dropAccept?: string | ((draggable: any) => boolean);
	    datesRender?(arg: {
	        view: View;
	        el: HTMLElement;
	    }): void;
	    datesDestroy?(arg: {
	        view: View;
	        el: HTMLElement;
	    }): void;
	    dayRender?(arg: {
	        view: View;
	        date: Date;
	        allDay: boolean;
	        el: HTMLElement;
	    }): void;
	    windowResize?(view: View): void;
	    dateClick?(arg: {
	        date: Date;
	        allDay: boolean;
	        resource: any;
	        el: HTMLElement;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    eventClick?(arg: {
	        el: HTMLElement;
	        event: EventApi;
	        jsEvent: MouseEvent;
	        view: View;
	    }): boolean | void;
	    eventMouseEnter?(arg: {
	        el: HTMLElement;
	        event: EventApi;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    eventMouseLeave?(arg: {
	        el: HTMLElement;
	        event: EventApi;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    select?(arg: {
	        start: Date;
	        end: Date;
	        allDay: boolean;
	        resource: any;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    unselect?(arg: {
	        view: View;
	        jsEvent: Event;
	    }): void;
	    eventDataTransform?: EventInputTransformer;
	    loading?(isLoading: boolean, view: View): void;
	    eventRender?(arg: {
	        event: EventApi;
	        el: HTMLElement;
	        view: View;
	    }): void;
	    eventPositioned?(arg: {
	        event: EventApi;
	        el: HTMLElement;
	        view: View;
	    }): void;
	    _eventsPositioned?(arg: {
	        view: View;
	    }): void;
	    eventDestroy?(arg: {
	        event: EventApi;
	        el: HTMLElement;
	        view: View;
	    }): void;
	    eventDragStart?(arg: {
	        event: EventApi;
	        el: HTMLElement;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    eventDragStop?(arg: {
	        event: EventApi;
	        el: HTMLElement;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    eventDrop?(arg: {
	        el: HTMLElement;
	        event: EventApi;
	        delta: Duration;
	        revert: () => void;
	        jsEvent: Event;
	        view: View;
	    }): void;
	    eventResizeStart?(arg: {
	        el: HTMLElement;
	        event: EventApi;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    eventResizeStop?(arg: {
	        el: HTMLElement;
	        event: EventApi;
	        jsEvent: MouseEvent;
	        view: View;
	    }): void;
	    eventResize?(arg: {
	        el: HTMLElement;
	        event: EventApi;
	        delta: Duration;
	        revert: () => void;
	        jsEvent: Event;
	        view: View;
	    }): void;
	    drop?(arg: {
	        date: DateInput;
	        allDay: boolean;
	        jsEvent: MouseEvent;
	    }): void;
	    eventReceive?(event: EventApi): void;
	}
	export interface ViewOptionsInput extends OptionsInputBase {
	    type?: string;
	    buttonText?: string;
	}
	export interface OptionsInput extends OptionsInputBase {
	    buttonText?: ButtonTextCompoundInput;
	    views?: {
	        [viewId: string]: ViewOptionsInput;
	    };
	    plugins: PluginDef[];
	}
}
declare module 'fullcalendar/src/component/date-rendering' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import Component, { ComponentContext } from 'fullcalendar/Component';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export function buildGotoAnchorHtml(component: Component<any>, gotoOptions: any, attrs: any, innerHtml?: any): string;
	export function getAllDayHtml(component: Component<any>): any;
	export function getDayClasses(date: DateMarker, dateProfile: DateProfile, context: ComponentContext, noThemeHighlight?: any): any[];
}
declare module 'fullcalendar/PositionCache' {
	export class Default {
	    originClientRect: ClientRect;
	    els: HTMLElement[];
	    originEl: HTMLElement;
	    isHorizontal: boolean;
	    isVertical: boolean;
	    lefts: any;
	    rights: any;
	    tops: any;
	    bottoms: any;
	    constructor(originEl: HTMLElement, els: HTMLElement[], isHorizontal: boolean, isVertical: boolean);
	    build(): void;
	    buildElHorizontals(originClientLeft: number): void;
	    buildElVerticals(originClientTop: number): void;
	    leftToIndex(leftPosition: number): any;
	    topToIndex(topPosition: number): any;
	    getWidth(leftIndex: number): number;
	    getHeight(topIndex: number): number;
	}
	export default Default;
}
declare module 'fullcalendar/ScrollComponent' {
	import { ElementScrollController } from 'fullcalendar/src/common/scroll-controller';
	export interface ScrollbarWidths {
	    left: number;
	    right: number;
	    bottom: number;
	}
	export class Default extends ElementScrollController {
	    overflowX: string;
	    overflowY: string;
	    constructor(overflowX: string, overflowY: string);
	    clear(): void;
	    destroy(): void;
	    applyOverflow(): void;
	    lockOverflow(scrollbarWidths: ScrollbarWidths): void;
	    setHeight(height: number | string): void;
	    getScrollbarWidths(): ScrollbarWidths;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGridEventRenderer' {
	import { DateFormatter } from 'fullcalendar/src/datelib/formatting';
	import FgEventRenderer from 'fullcalendar/FgEventRenderer';
	import { Seg } from 'fullcalendar/DateComponent';
	import TimeGrid from 'fullcalendar/TimeGrid';
	export class Default extends FgEventRenderer {
	    timeGrid: TimeGrid;
	    segsByCol: any;
	    fullTimeFormat: DateFormatter;
	    constructor(timeGrid: TimeGrid);
	    attachSegs(segs: Seg[], mirrorInfo: any): void;
	    detachSegs(segs: Seg[]): void;
	    computeSegSizes(allSegs: Seg[]): void;
	    assignSegSizes(allSegs: Seg[]): void;
	    computeEventTimeFormat(): {
	        hour: string;
	        minute: string;
	        meridiem: boolean;
	    };
	    computeDisplayEventEnd(): boolean;
	    renderSegHtml(seg: Seg, mirrorInfo: any): string;
	    computeSegHorizontals(segs: Seg[]): void;
	    computeSegForwardBack(seg: Seg, seriesBackwardPressure: any, seriesBackwardCoord: any): void;
	    sortForwardSegs(forwardSegs: Seg[]): any[];
	    assignSegCss(segs: Seg[]): void;
	    generateSegCss(seg: Seg): any;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGridMirrorRenderer' {
	import { Seg } from 'fullcalendar/DateComponent';
	import TimeGridEventRenderer from 'fullcalendar/TimeGridEventRenderer';
	export class Default extends TimeGridEventRenderer {
	    sourceSeg: Seg;
	    attachSegs(segs: Seg[], mirrorInfo: any): void;
	    generateSegCss(seg: Seg): any;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGridFillRenderer' {
	import FillRenderer from 'fullcalendar/FillRenderer';
	import { Seg } from 'fullcalendar/DateComponent';
	import TimeGrid from 'fullcalendar/TimeGrid';
	export class Default extends FillRenderer {
	    timeGrid: TimeGrid;
	    constructor(timeGrid: TimeGrid);
	    attachSegs(type: any, segs: Seg[]): HTMLElement[];
	    computeSegSizes(segs: Seg[]): void;
	    assignSegSizes(segs: Seg[]): void;
	}
	export default Default;
}
declare module 'fullcalendar/DayBgRow' {
	import { ComponentContext } from 'fullcalendar/Component';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export interface DayBgCell {
	    date: DateMarker;
	    htmlAttrs?: string;
	}
	export interface DayBgRowProps {
	    cells: DayBgCell[];
	    dateProfile: DateProfile;
	    renderIntroHtml?: () => string;
	}
	export class Default {
	    context: ComponentContext;
	    constructor(context: ComponentContext);
	    renderHtml(props: DayBgRowProps): string;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGrid' {
	import PositionCache from 'fullcalendar/PositionCache';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateFormatter } from 'fullcalendar/src/datelib/formatting';
	import { ComponentContext } from 'fullcalendar/Component';
	import DateComponent, { Seg, EventSegUiInteractionState } from 'fullcalendar/DateComponent';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export interface RenderProps {
	    renderBgIntroHtml: () => string;
	    renderIntroHtml: () => string;
	}
	export interface TimeGridSeg extends Seg {
	    col: number;
	    start: DateMarker;
	    end: DateMarker;
	}
	export interface TimeGridCell {
	    date: DateMarker;
	    htmlAttrs?: string;
	}
	export interface TimeGridProps {
	    dateProfile: DateProfile;
	    cells: TimeGridCell[];
	    businessHourSegs: TimeGridSeg[];
	    bgEventSegs: TimeGridSeg[];
	    fgEventSegs: TimeGridSeg[];
	    dateSelectionSegs: TimeGridSeg[];
	    eventSelection: string;
	    eventDrag: EventSegUiInteractionState | null;
	    eventResize: EventSegUiInteractionState | null;
	}
	export class Default extends DateComponent<TimeGridProps> {
	    renderProps: RenderProps;
	    slotDuration: Duration;
	    snapDuration: Duration;
	    snapsPerSlot: any;
	    labelFormat: DateFormatter;
	    labelInterval: Duration;
	    colCnt: number;
	    colEls: HTMLElement[];
	    slatContainerEl: HTMLElement;
	    slatEls: HTMLElement[];
	    nowIndicatorEls: HTMLElement[];
	    colPositions: PositionCache;
	    slatPositions: PositionCache;
	    isSlatSizesDirty: boolean;
	    isColSizesDirty: boolean;
	    rootBgContainerEl: HTMLElement;
	    bottomRuleEl: HTMLElement;
	    contentSkeletonEl: HTMLElement;
	    colContainerEls: HTMLElement[];
	    fgContainerEls: HTMLElement[];
	    bgContainerEls: HTMLElement[];
	    mirrorContainerEls: HTMLElement[];
	    highlightContainerEls: HTMLElement[];
	    businessContainerEls: HTMLElement[];
	    private renderSlats;
	    private renderColumns;
	    private renderBusinessHours;
	    private renderDateSelection;
	    private renderBgEvents;
	    private renderFgEvents;
	    private renderEventSelection;
	    private renderEventDrag;
	    private renderEventResize;
	    constructor(context: ComponentContext, el: HTMLElement, renderProps: RenderProps);
	    processOptions(): void;
	    computeLabelInterval(slotDuration: any): any;
	    render(props: TimeGridProps): void;
	    destroy(): void;
	    updateSize(isResize: boolean): void;
	    _renderSlats(dateProfile: DateProfile): void;
	    renderSlatRowHtml(dateProfile: DateProfile): string;
	    _renderColumns(cells: TimeGridCell[], dateProfile: DateProfile): void;
	    _unrenderColumns(): void;
	    renderContentSkeleton(): void;
	    unrenderContentSkeleton(): void;
	    groupSegsByCol(segs: any): any[];
	    attachSegsByCol(segsByCol: any, containerEls: HTMLElement[]): void;
	    getNowIndicatorUnit(): string;
	    renderNowIndicator(segs: TimeGridSeg[], date: any): void;
	    unrenderNowIndicator(): void;
	    getTotalSlatHeight(): number;
	    computeDateTop(when: DateMarker, startOfDayDate?: DateMarker): any;
	    computeTimeTop(timeMs: number): any;
	    computeSegVerticals(segs: any): void;
	    assignSegVerticals(segs: any): void;
	    generateSegVerticalCss(seg: any): {
	        top: any;
	        bottom: number;
	    };
	    buildColPositions(): void;
	    buildSlatPositions(): void;
	    positionToHit(positionLeft: any, positionTop: any): {
	        col: any;
	        dateSpan: {
	            range: {
	                start: Date;
	                end: Date;
	            };
	            allDay: boolean;
	        };
	        dayEl: HTMLElement;
	        relativeRect: {
	            left: any;
	            right: any;
	            top: any;
	            bottom: any;
	        };
	    };
	    _renderEventDrag(state: EventSegUiInteractionState): void;
	    _unrenderEventDrag(state: EventSegUiInteractionState): void;
	    _renderEventResize(state: EventSegUiInteractionState): void;
	    _unrenderEventResize(state: EventSegUiInteractionState): void;
	    _renderDateSelection(segs: Seg[]): void;
	    _unrenderDateSelection(): void;
	}
	export default Default;
}
declare module 'fullcalendar/Popover' {
	export interface PopoverOptions {
	    className?: string;
	    content?: (el: HTMLElement) => void;
	    parentEl: HTMLElement;
	    autoHide?: boolean;
	    top?: number;
	    left?: number;
	    right?: number;
	    viewportConstrain?: boolean;
	}
	export class Default {
	    isHidden: boolean;
	    options: PopoverOptions;
	    el: HTMLElement;
	    margin: number;
	    constructor(options: PopoverOptions);
	    show(): void;
	    hide(): void;
	    render(): void;
	    documentMousedown: (ev: any) => void;
	    destroy(): void;
	    position(): void;
	    trigger(name: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/SimpleDayGridEventRenderer' {
	import FgEventRenderer from 'fullcalendar/FgEventRenderer';
	import { Seg } from 'fullcalendar/DateComponent';
	export abstract class Default extends FgEventRenderer {
	    renderSegHtml(seg: Seg, mirrorInfo: any): string;
	    computeEventTimeFormat(): {
	        hour: string;
	        minute: string;
	        omitZeroMinute: boolean;
	        meridiem: string;
	    };
	    computeDisplayEventEnd(): boolean;
	}
	export default Default;
}
declare module 'fullcalendar/DayGridEventRenderer' {
	import DayGrid from 'fullcalendar/DayGrid';
	import { Seg } from 'fullcalendar/DateComponent';
	import SimpleDayGridEventRenderer from 'fullcalendar/SimpleDayGridEventRenderer';
	export class Default extends SimpleDayGridEventRenderer {
	    dayGrid: DayGrid;
	    rowStructs: any;
	    constructor(dayGrid: DayGrid);
	    attachSegs(segs: Seg[], mirrorInfo: any): void;
	    detachSegs(): void;
	    renderSegRows(segs: Seg[]): any[];
	    renderSegRow(row: any, rowSegs: any): {
	        row: any;
	        tbodyEl: HTMLTableSectionElement;
	        cellMatrix: any[];
	        segMatrix: any[];
	        segLevels: any[];
	        segs: any;
	    };
	    buildSegLevels(segs: Seg[]): any[];
	    groupSegRows(segs: Seg[]): any[];
	    computeDisplayEventEnd(): boolean;
	}
	export default Default;
}
declare module 'fullcalendar/DayGridMirrorRenderer' {
	import { Seg } from 'fullcalendar/DateComponent';
	import DayGridEventRenderer from 'fullcalendar/DayGridEventRenderer';
	export class Default extends DayGridEventRenderer {
	    attachSegs(segs: Seg[], mirrorInfo: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/DayGridFillRenderer' {
	import FillRenderer from 'fullcalendar/FillRenderer';
	import DayGrid, { DayGridSeg } from 'fullcalendar/DayGrid';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends FillRenderer {
	    fillSegTag: string;
	    dayGrid: DayGrid;
	    constructor(dayGrid: DayGrid);
	    renderSegs(type: string, segs: DayGridSeg[]): void;
	    attachSegs(type: any, segs: Seg[]): any[];
	    renderFillRow(type: any, seg: Seg): HTMLElement;
	}
	export default Default;
}
declare module 'fullcalendar/OffsetTracker' {
	import { ElementScrollGeomCache } from 'fullcalendar/src/common/scroll-geom-cache';
	export class Default {
	    scrollCaches: ElementScrollGeomCache[];
	    origLeft: number;
	    origTop: number;
	    origRight: number;
	    origBottom: number;
	    constructor(el: HTMLElement);
	    destroy(): void;
	    computeLeft(): number;
	    computeTop(): number;
	    isWithinClipping(pageX: number, pageY: number): boolean;
	}
	export default Default;
}
declare module 'fullcalendar/DayTile' {
	import DateComponent, { Seg } from 'fullcalendar/DateComponent';
	import SimpleDayGridEventRenderer from 'fullcalendar/SimpleDayGridEventRenderer';
	import { Hit } from 'fullcalendar/HitDragging';
	import OffsetTracker from 'fullcalendar/OffsetTracker';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { ComponentContext } from 'fullcalendar/Component';
	import { EventInstanceHash } from 'fullcalendar/src/structs/event';
	export interface DayTileProps {
	    date: DateMarker;
	    fgSegs: Seg[];
	    eventSelection: string;
	    eventDragInstances: EventInstanceHash;
	    eventResizeInstances: EventInstanceHash;
	}
	export class Default extends DateComponent<DayTileProps> {
	    segContainerEl: HTMLElement;
	    width: number;
	    height: number;
	    offsetTracker: OffsetTracker;
	    private renderFrame;
	    private renderFgEvents;
	    private renderEventSelection;
	    private renderEventDrag;
	    private renderEventResize;
	    constructor(context: ComponentContext, el: HTMLElement);
	    render(props: DayTileProps): void;
	    destroy(): void;
	    _renderFrame(date: DateMarker): void;
	    prepareHits(): void;
	    releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit | null;
	}
	export class DayTileEventRenderer extends SimpleDayGridEventRenderer {
	    dayTile: Default;
	    constructor(dayTile: any);
	    attachSegs(segs: Seg[]): void;
	    detachSegs(segs: Seg[]): void;
	}
	export default Default;
}
declare module 'fullcalendar/DayGrid' {
	import PositionCache from 'fullcalendar/PositionCache';
	import Popover from 'fullcalendar/Popover';
	import DayGridEventRenderer from 'fullcalendar/DayGridEventRenderer';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import DateComponentProps, { EventSegUiInteractionState, Seg } from 'fullcalendar/DateComponent';
	import DayTile from 'fullcalendar/DayTile';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export interface RenderProps {
	    renderNumberIntroHtml: (row: number, dayGrid: Default) => string;
	    renderBgIntroHtml: () => string;
	    renderIntroHtml: () => string;
	    colWeekNumbersVisible: boolean;
	    cellWeekNumbersVisible: boolean;
	}
	export interface DayGridSeg extends Seg {
	    row: number;
	    firstCol: number;
	    lastCol: number;
	}
	export interface DayGridCell {
	    date: DateMarker;
	    htmlAttrs?: string;
	}
	export interface DayGridProps {
	    dateProfile: DateProfile;
	    cells: DayGridCell[][];
	    businessHourSegs: DayGridSeg[];
	    bgEventSegs: DayGridSeg[];
	    fgEventSegs: DayGridSeg[];
	    dateSelectionSegs: DayGridSeg[];
	    eventSelection: string;
	    eventDrag: EventSegUiInteractionState | null;
	    eventResize: EventSegUiInteractionState | null;
	    isRigid: boolean;
	}
	export class Default extends DateComponentProps<DayGridProps> {
	    eventRenderer: DayGridEventRenderer;
	    renderProps: RenderProps;
	    rowCnt: number;
	    colCnt: number;
	    bottomCoordPadding: number;
	    rowEls: HTMLElement[];
	    cellEls: HTMLElement[];
	    isCellSizesDirty: boolean;
	    rowPositions: PositionCache;
	    colPositions: PositionCache;
	    segPopover: Popover;
	    segPopoverTile: DayTile;
	    private renderCells;
	    private renderBusinessHours;
	    private renderDateSelection;
	    private renderBgEvents;
	    private renderFgEvents;
	    private renderEventSelection;
	    private renderEventDrag;
	    private renderEventResize;
	    constructor(context: any, el: any, renderProps: RenderProps);
	    render(props: DayGridProps): void;
	    destroy(): void;
	    getCellRange(row: any, col: any): {
	        start: Date;
	        end: Date;
	    };
	    updateSegPopoverTile(date?: any, segs?: any): void;
	    _renderCells(cells: DayGridCell[][], isRigid: boolean): void;
	    _unrenderCells(): void;
	    renderDayRowHtml(row: any, isRigid: any): string;
	    getIsNumbersVisible(): boolean;
	    getIsDayNumbersVisible(): boolean;
	    renderNumberTrHtml(row: number): string;
	    renderNumberCellsHtml(row: any): string;
	    renderNumberCellHtml(date: any): string;
	    updateSize(isResize: boolean): void;
	    buildColPositions(): void;
	    buildRowPositions(): void;
	    positionToHit(leftPosition: any, topPosition: any): {
	        row: any;
	        col: any;
	        dateSpan: {
	            range: {
	                start: Date;
	                end: Date;
	            };
	            allDay: boolean;
	        };
	        dayEl: HTMLElement;
	        relativeRect: {
	            left: any;
	            right: any;
	            top: any;
	            bottom: any;
	        };
	    };
	    getCellEl(row: any, col: any): HTMLElement;
	    _renderEventDrag(state: EventSegUiInteractionState): void;
	    _unrenderEventDrag(state: EventSegUiInteractionState): void;
	    _renderEventResize(state: EventSegUiInteractionState): void;
	    _unrenderEventResize(state: EventSegUiInteractionState): void;
	    removeSegPopover(): void;
	    limitRows(levelLimit: any): void;
	    computeRowLevelLimit(row: any): (number | false);
	    limitRow(row: any, levelLimit: any): void;
	    unlimitRow(row: any): void;
	    renderMoreLink(row: any, col: any, hiddenSegs: any): HTMLElement;
	    showSegPopover(row: any, col: any, moreLink: HTMLElement, segs: any): void;
	    resliceDaySegs(segs: any, dayDate: any): any[];
	    getMoreLinkText(num: any): any;
	    getCellSegs(row: any, col: any, startLevel?: any): any[];
	}
	export default Default;
}
declare module 'fullcalendar/AllDaySplitter' {
	import Splitter from 'fullcalendar/src/component/event-splitting';
	import { EventDef } from 'fullcalendar/src/structs/event';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	export class Default extends Splitter {
	    getKeyInfo(): {
	        allDay: {};
	        timed: {};
	    };
	    getKeysForDateSpan(dateSpan: DateSpan): string[];
	    getKeysForEventDef(eventDef: EventDef): string[];
	}
	export default Default;
}
declare module 'fullcalendar/AbstractAgendaView' {
	import ScrollComponent from 'fullcalendar/ScrollComponent';
	import View from 'fullcalendar/View';
	import TimeGrid from 'fullcalendar/TimeGrid';
	import DayGrid from 'fullcalendar/DayGrid';
	import { ComponentContext } from 'fullcalendar/Component';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import DateProfileGenerator from 'fullcalendar/DateProfileGenerator';
	import AllDaySplitter from 'fullcalendar/AllDaySplitter';
	export abstract class Default extends View {
	    timeGrid: TimeGrid;
	    dayGrid: DayGrid;
	    scroller: ScrollComponent;
	    axisWidth: any;
	    protected splitter: AllDaySplitter;
	    constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement);
	    destroy(): void;
	    renderSkeletonHtml(): string;
	    getNowIndicatorUnit(): string;
	    unrenderNowIndicator(): void;
	    updateSize(isResize: boolean, viewHeight: number, isAuto: boolean): void;
	    updateBaseSize(isResize: any, viewHeight: any, isAuto: any): void;
	    computeScrollerHeight(viewHeight: any): number;
	    computeInitialDateScroll(): {
	        top: any;
	    };
	    queryDateScroll(): {
	        top: number;
	    };
	    applyDateScroll(scroll: any): void;
	    renderHeadIntroHtml: () => string;
	    axisStyleAttr(): string;
	    renderTimeGridBgIntroHtml: () => string;
	    renderTimeGridIntroHtml: () => string;
	    renderDayGridBgIntroHtml: () => string;
	    renderDayGridIntroHtml: () => string;
	}
	export default Default;
}
declare module 'fullcalendar/src/common/table-utils' {
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { ComponentContext } from 'fullcalendar/Component';
	export function computeFallbackHeaderFormat(datesRepDistinctDays: boolean, dayCnt: number): {
	    weekday: string;
	    month?: undefined;
	    day?: undefined;
	    omitCommas?: undefined;
	} | {
	    weekday: string;
	    month: string;
	    day: string;
	    omitCommas: boolean;
	};
	export function renderDateCell(date: DateMarker, dateProfile: DateProfile, datesRepDistinctDays: any, colCnt: any, colHeadFormat: any, context: ComponentContext, colspan?: any, otherAttrs?: any): string;
}
declare module 'fullcalendar/DayHeader' {
	import Component, { ComponentContext } from 'fullcalendar/Component';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export interface DayTableHeaderProps {
	    dates: DateMarker[];
	    dateProfile: DateProfile;
	    datesRepDistinctDays: boolean;
	    renderIntroHtml?: () => string;
	}
	export class Default extends Component<DayTableHeaderProps> {
	    el: HTMLElement;
	    thead: HTMLElement;
	    constructor(context: ComponentContext, parentEl: HTMLElement);
	    destroy(): void;
	    render(props: DayTableHeaderProps): void;
	}
	export default Default;
}
declare module 'fullcalendar/DaySeries' {
	import DateProfileGenerator from 'fullcalendar/DateProfileGenerator';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	export interface DaySeriesSeg {
	    firstIndex: number;
	    lastIndex: number;
	    isStart: boolean;
	    isEnd: boolean;
	}
	export class Default {
	    cnt: number;
	    dates: DateMarker[];
	    indices: number[];
	    constructor(range: DateRange, dateProfileGenerator: DateProfileGenerator);
	    sliceRange(range: DateRange): DaySeriesSeg | null;
	    private getDateDayIndex;
	}
	export default Default;
}
declare module 'fullcalendar/DayTable' {
	import DaySeries from 'fullcalendar/DaySeries';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Seg } from 'fullcalendar/DateComponent';
	export interface DayTableSeg extends Seg {
	    row: number;
	    firstCol: number;
	    lastCol: number;
	}
	export interface DayTableCell {
	    date: DateMarker;
	    htmlAttrs?: string;
	}
	export class Default {
	    rowCnt: number;
	    colCnt: number;
	    cells: DayTableCell[][];
	    headerDates: DateMarker[];
	    private daySeries;
	    constructor(daySeries: DaySeries, breakOnWeeks: boolean);
	    private buildCells;
	    private buildCell;
	    private buildHeaderDates;
	    sliceRange(range: DateRange): DayTableSeg[];
	}
	export default Default;
}
declare module 'fullcalendar/src/common/slicing-utils' {
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import DateComponent, { Seg, EventSegUiInteractionState } from 'fullcalendar/DateComponent';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	export interface SliceableProps {
	    dateSelection: DateSpan;
	    businessHours: EventStore;
	    eventStore: EventStore;
	    eventDrag: EventInteractionState | null;
	    eventResize: EventInteractionState | null;
	    eventSelection: string;
	    eventUiBases: EventUiHash;
	}
	export interface SlicedProps<SegType extends Seg> {
	    dateSelectionSegs: SegType[];
	    businessHourSegs: SegType[];
	    fgEventSegs: SegType[];
	    bgEventSegs: SegType[];
	    eventDrag: EventSegUiInteractionState | null;
	    eventResize: EventSegUiInteractionState | null;
	    eventSelection: string;
	}
	export abstract class Default<SegType extends Seg, ExtraArgs extends any[] = []> {
	    private sliceBusinessHours;
	    private sliceDateSelection;
	    private sliceEventStore;
	    private sliceEventDrag;
	    private sliceEventResize;
	    abstract sliceRange(dateRange: DateRange, ...extraArgs: ExtraArgs): SegType[];
	    sliceProps(props: SliceableProps, dateProfile: DateProfile, nextDayThreshold: Duration | null, component: DateComponent<any>, // TODO: kill
	    ...extraArgs: ExtraArgs): SlicedProps<SegType>;
	    sliceNowDate(// does not memoize
	    date: DateMarker, component: DateComponent<any>, // TODO: kill
	    ...extraArgs: ExtraArgs): SegType[];
	    private _sliceBusinessHours;
	    private _sliceEventStore;
	    private _sliceInteraction;
	    private _sliceDateSpan;
	    private sliceEventRanges;
	    private sliceEventRange;
	}
	export default Default;
}
declare module 'fullcalendar/SimpleTimeGrid' {
	import TimeGrid, { TimeGridSeg } from 'fullcalendar/TimeGrid';
	import DateComponent from 'fullcalendar/DateComponent';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import DayTable from 'fullcalendar/DayTable';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import Slicer from 'fullcalendar/src/common/slicing-utils';
	import OffsetTracker from 'fullcalendar/OffsetTracker';
	import { Hit } from 'fullcalendar/HitDragging';
	export interface SimpleTimeGridProps {
	    dateProfile: DateProfile | null;
	    dayTable: DayTable;
	    businessHours: EventStore;
	    eventStore: EventStore;
	    eventUiBases: EventUiHash;
	    dateSelection: DateSpan | null;
	    eventSelection: string;
	    eventDrag: EventInteractionState | null;
	    eventResize: EventInteractionState | null;
	}
	export class Default extends DateComponent<SimpleTimeGridProps> {
	    timeGrid: TimeGrid;
	    offsetTracker: OffsetTracker;
	    private buildDayRanges;
	    private dayRanges;
	    private slicer;
	    constructor(context: any, timeGrid: TimeGrid);
	    render(props: SimpleTimeGridProps): void;
	    renderNowIndicator(date: DateMarker): void;
	    prepareHits(): void;
	    releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit;
	}
	export function buildDayRanges(dayTable: DayTable, dateProfile: DateProfile, dateEnv: DateEnv): DateRange[];
	export class TimeGridSlicer extends Slicer<TimeGridSeg, [DateRange[]]> {
	    sliceRange(range: DateRange, dayRanges: DateRange[]): TimeGridSeg[];
	}
	export default Default;
}
declare module 'fullcalendar/SimpleDayGrid' {
	import DayGrid, { DayGridSeg } from 'fullcalendar/DayGrid';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import DayTable from 'fullcalendar/DayTable';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import DateComponent from 'fullcalendar/DateComponent';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import Slicer from 'fullcalendar/src/common/slicing-utils';
	import OffsetTracker from 'fullcalendar/OffsetTracker';
	import { Hit } from 'fullcalendar/HitDragging';
	export interface SimpleDayGridProps {
	    dateProfile: DateProfile | null;
	    dayTable: DayTable;
	    nextDayThreshold: Duration;
	    businessHours: EventStore;
	    eventStore: EventStore;
	    eventUiBases: EventUiHash;
	    dateSelection: DateSpan | null;
	    eventSelection: string;
	    eventDrag: EventInteractionState | null;
	    eventResize: EventInteractionState | null;
	    isRigid: boolean;
	}
	export class Default extends DateComponent<SimpleDayGridProps> {
	    dayGrid: DayGrid;
	    offsetTracker: OffsetTracker;
	    private slicer;
	    constructor(context: any, dayGrid: DayGrid);
	    render(props: SimpleDayGridProps): void;
	    prepareHits(): void;
	    releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit;
	}
	export class DayGridSlicer extends Slicer<DayGridSeg, [DayTable]> {
	    sliceRange(dateRange: DateRange, dayTable: DayTable): DayGridSeg[];
	}
	export default Default;
}
declare module 'fullcalendar/AgendaView' {
	import AbstractAgendaView from 'fullcalendar/AbstractAgendaView';
	import DateProfileGenerator, { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { ComponentContext } from 'fullcalendar/Component';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import DayHeader from 'fullcalendar/DayHeader';
	import DayTable from 'fullcalendar/DayTable';
	import SimpleTimeGrid from 'fullcalendar/SimpleTimeGrid';
	import SimpleDayGrid from 'fullcalendar/SimpleDayGrid';
	import { ViewProps } from 'fullcalendar/View';
	export class Default extends AbstractAgendaView {
	    header: DayHeader;
	    simpleDayGrid: SimpleDayGrid;
	    simpleTimeGrid: SimpleTimeGrid;
	    private buildDayTable;
	    constructor(_context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement);
	    destroy(): void;
	    render(props: ViewProps): void;
	    renderNowIndicator(date: any): void;
	}
	export function buildDayTable(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator): DayTable;
	export default Default;
}
declare module 'fullcalendar/BasicViewDateProfileGenerator' {
	import DateProfileGenerator from 'fullcalendar/DateProfileGenerator';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	export class Default extends DateProfileGenerator {
	    buildRenderRange(currentRange: any, currentRangeUnit: any, isRangeAllDay: any): DateRange;
	}
	export default Default;
}
declare module 'fullcalendar/AbstractBasicView' {
	import ScrollComponent from 'fullcalendar/ScrollComponent';
	import View from 'fullcalendar/View';
	import { ComponentContext } from 'fullcalendar/Component';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import DateProfileGenerator from 'fullcalendar/DateProfileGenerator';
	import DayGrid from 'fullcalendar/DayGrid';
	export abstract class Default extends View {
	    scroller: ScrollComponent;
	    dayGrid: DayGrid;
	    colWeekNumbersVisible: boolean;
	    weekNumberWidth: number;
	    constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement);
	    destroy(): void;
	    renderSkeletonHtml(): string;
	    weekNumberStyleAttr(): string;
	    hasRigidRows(): boolean;
	    updateSize(isResize: boolean, viewHeight: number, isAuto: boolean): void;
	    updateBaseSize(isResize: boolean, viewHeight: number, isAuto: boolean): void;
	    computeScrollerHeight(viewHeight: any): number;
	    setGridHeight(height: any, isAuto: any): void;
	    computeInitialDateScroll(): {
	        top: number;
	    };
	    queryDateScroll(): {
	        top: number;
	    };
	    applyDateScroll(scroll: any): void;
	    renderHeadIntroHtml: () => string;
	    renderDayGridNumberIntroHtml: (row: number, dayGrid: DayGrid) => string;
	    renderDayGridBgIntroHtml: () => string;
	    renderDayGridIntroHtml: () => string;
	}
	export default Default;
}
declare module 'fullcalendar/BasicView' {
	import AbstractBasicView from 'fullcalendar/AbstractBasicView';
	import DayHeader from 'fullcalendar/DayHeader';
	import SimpleDayGrid from 'fullcalendar/SimpleDayGrid';
	import { ComponentContext } from 'fullcalendar/Component';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import DateProfileGenerator, { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { ViewProps } from 'fullcalendar/View';
	import DayTable from 'fullcalendar/DayTable';
	export class Default extends AbstractBasicView {
	    header: DayHeader;
	    simpleDayGrid: SimpleDayGrid;
	    dayTable: DayTable;
	    private buildDayTable;
	    constructor(_context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement);
	    destroy(): void;
	    render(props: ViewProps): void;
	}
	export function buildDayTable(dateProfile: DateProfile, dateProfileGenerator: DateProfileGenerator): DayTable;
	export default Default;
}
declare module 'fullcalendar/ListEventRenderer' {
	import FgEventRenderer from 'fullcalendar/FgEventRenderer';
	import ListView from 'fullcalendar/ListView';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends FgEventRenderer {
	    listView: ListView;
	    constructor(listView: ListView);
	    attachSegs(segs: Seg[]): void;
	    detachSegs(): void;
	    renderSegHtml(seg: Seg): string;
	    computeEventTimeFormat(): {
	        hour: string;
	        minute: string;
	        meridiem: string;
	    };
	}
	export default Default;
}
declare module 'fullcalendar/ListView' {
	import View, { ViewProps } from 'fullcalendar/View';
	import ScrollComponent from 'fullcalendar/ScrollComponent';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import DateProfileGenerator from 'fullcalendar/DateProfileGenerator';
	import { ComponentContext } from 'fullcalendar/Component';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import { EventUiHash } from 'fullcalendar/src/component/event-ui';
	import { EventRenderRange } from 'fullcalendar/src/component/event-rendering';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends View {
	    scroller: ScrollComponent;
	    contentEl: HTMLElement;
	    dayDates: DateMarker[];
	    private computeDateVars;
	    private eventStoreToSegs;
	    private renderContent;
	    constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement);
	    render(props: ViewProps): void;
	    destroy(): void;
	    updateSize(isResize: any, viewHeight: any, isAuto: any): void;
	    computeScrollerHeight(viewHeight: any): number;
	    _eventStoreToSegs(eventStore: EventStore, eventUiBases: EventUiHash, dayRanges: DateRange[]): Seg[];
	    eventRangesToSegs(eventRanges: EventRenderRange[], dayRanges: DateRange[]): any[];
	    eventRangeToSegs(eventRange: EventRenderRange, dayRanges: DateRange[]): any[];
	    renderEmptyMessage(): void;
	    renderSegList(allSegs: any): void;
	    groupSegsByDay(segs: any): any[];
	    buildDayHeaderRow(dayDate: any): HTMLTableRowElement;
	}
	export default Default;
}
declare module 'fullcalendar/ExternalDraggable' {
	import FeaturefulElementDragging from 'fullcalendar/FeaturefulElementDragging';
	import { DragMetaGenerator } from 'fullcalendar/ExternalElementDragging';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	export interface ExternalDraggableSettings {
	    eventData?: DragMetaGenerator;
	    itemSelector?: string;
	    minDistance?: number;
	    longPressDelay?: number;
	    appendTo?: HTMLElement;
	}
	export class Default {
	    dragging: FeaturefulElementDragging;
	    settings: ExternalDraggableSettings;
	    constructor(el: HTMLElement, settings?: ExternalDraggableSettings);
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handleDragStart: (ev: PointerDragEvent) => void;
	    destroy(): void;
	}
	export default Default;
}
declare module 'fullcalendar/InferredElementDragging' {
	import PointerDragging, { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import ElementDragging from 'fullcalendar/ElementDragging';
	export class Default extends ElementDragging {
	    pointer: PointerDragging;
	    shouldIgnoreMove: boolean;
	    mirrorSelector: string;
	    currentMirrorEl: HTMLElement | null;
	    constructor(containerEl: HTMLElement);
	    destroy(): void;
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handlePointerMove: (ev: PointerDragEvent) => void;
	    handlePointerUp: (ev: PointerDragEvent) => void;
	    setIgnoreMove(bool: boolean): void;
	    setMirrorIsVisible(bool: boolean): void;
	}
	export default Default;
}
declare module 'fullcalendar/ThirdPartyDraggable' {
	import { DragMetaGenerator } from 'fullcalendar/ExternalElementDragging';
	import InferredElementDragging from 'fullcalendar/InferredElementDragging';
	export interface ThirdPartyDraggableSettings {
	    eventData?: DragMetaGenerator;
	    itemSelector?: string;
	    mirrorSelector?: string;
	}
	export class Default {
	    dragging: InferredElementDragging;
	    constructor(containerOrSettings?: EventTarget | ThirdPartyDraggableSettings, settings?: ThirdPartyDraggableSettings);
	    destroy(): void;
	}
	export default Default;
}
declare module 'fullcalendar/src/formatting-api' {
	import { DateInput } from 'fullcalendar/src/datelib/env';
	export function formatDate(dateInput: DateInput, settings?: {}): any;
	export function formatRange(startInput: DateInput, endInput: DateInput, settings: any): any;
}
declare module 'fullcalendar/src/exports' {
	export const version = "<%= version %>";
	export const internalApiVersion = 12;
	export { OptionsInput } from 'fullcalendar/src/types/input-types';
	export { EventInput, EventDef, EventDefHash, EventInstance, EventInstanceHash } from 'fullcalendar/src/structs/event';
	export { BusinessHoursInput, parseBusinessHours } from 'fullcalendar/src/structs/business-hours';
	export { applyAll, debounce, padStart, isInt, capitaliseFirstLetter, parseFieldSpecs, compareByFieldSpecs, compareByFieldSpec, flexibleCompare, log, warn, computeVisibleDayRange } from 'fullcalendar/src/util/misc';
	export { htmlEscape, cssToStr } from 'fullcalendar/src/util/html';
	export { removeExact, isArraysEqual } from 'fullcalendar/src/util/array';
	export { memoize, memoizeOutput } from 'fullcalendar/src/util/memoize';
	export { memoizeRendering, MemoizedRendering } from 'fullcalendar/src/component/memoized-rendering';
	export { intersectRects } from 'fullcalendar/src/util/geom';
	export { isPropsEqual, mapHash, filterHash } from 'fullcalendar/src/util/object';
	export { findElements, findChildren, htmlToElement, createElement, insertAfterElement, prependToElement, removeElement, appendToElement, applyStyle, applyStyleProp, elementMatches, forceClassName } from 'fullcalendar/src/util/dom-manip';
	export { EventStore, filterEventStoreDefs, createEmptyEventStore, mergeEventStores } from 'fullcalendar/src/structs/event-store';
	export { EventUiHash, EventUi, processScopedUiProps, combineEventUis } from 'fullcalendar/src/component/event-ui';
	export { default as Splitter, SplittableProps } from 'fullcalendar/src/component/event-splitting';
	export { buildGotoAnchorHtml, getAllDayHtml, getDayClasses } from 'fullcalendar/src/component/date-rendering';
	export { preventDefault, listenBySelector, whenTransitionDone } from 'fullcalendar/src/util/dom-event';
	export { computeInnerRect, computeEdges, computeHeightAndMargins, getClippingParents } from 'fullcalendar/src/util/dom-geom';
	export { unpromisify } from 'fullcalendar/src/util/promise';
	export { default as EmitterMixin, EmitterInterface } from 'fullcalendar/EmitterMixin';
	export { DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect } from 'fullcalendar/src/datelib/date-range';
	export { defineThemeSystem } from 'fullcalendar/ThemeRegistry';
	export { default as Mixin } from 'fullcalendar/Mixin';
	export { default as PositionCache } from 'fullcalendar/PositionCache';
	export { default as ScrollComponent, ScrollbarWidths } from 'fullcalendar/ScrollComponent';
	export { default as Theme } from 'fullcalendar/Theme';
	export { default as Component, ComponentContext } from 'fullcalendar/Component';
	export { default as DateComponent, Seg, EventSegUiInteractionState } from 'fullcalendar/DateComponent';
	export { default as Calendar, DatePointTransform, DateSpanTransform } from 'fullcalendar/Calendar';
	export { default as View, ViewProps } from 'fullcalendar/View';
	export { default as FgEventRenderer } from 'fullcalendar/FgEventRenderer';
	export { default as FillRenderer } from 'fullcalendar/FillRenderer';
	export { default as AgendaView, buildDayTable as buildAgendaDayTable } from 'fullcalendar/AgendaView';
	export { default as AbstractAgendaView } from 'fullcalendar/AbstractAgendaView';
	export { default as AbstractBasicView } from 'fullcalendar/AbstractBasicView';
	export { default as TimeGrid, TimeGridSeg } from 'fullcalendar/TimeGrid';
	export { TimeGridSlicer, buildDayRanges } from 'fullcalendar/SimpleTimeGrid';
	export { DayGridSlicer } from 'fullcalendar/SimpleDayGrid';
	export { default as DayGrid, DayGridSeg } from 'fullcalendar/DayGrid';
	export { default as BasicView, buildDayTable as buildBasicDayTable } from 'fullcalendar/BasicView';
	export { default as ListView } from 'fullcalendar/ListView';
	export { default as DateProfileGenerator, DateProfile } from 'fullcalendar/DateProfileGenerator';
	export { ViewDef } from 'fullcalendar/src/structs/view-def';
	export { ViewSpec, ViewSpecTransformer } from 'fullcalendar/src/structs/view-spec';
	export { DateSpan, DateSpanApi, DatePointApi } from 'fullcalendar/src/structs/date-span';
	export { DateMarker, addDays, startOfDay, addMs, diffWholeWeeks, diffWholeDays, diffDayAndTime, isValidDate } from 'fullcalendar/src/datelib/marker';
	export { Duration, createDuration, isSingleDay, multiplyDuration, addDurations, asRoughMinutes, asRoughSeconds, asRoughMs, wholeDivideDurations, greatestDurationDenominator } from 'fullcalendar/src/datelib/duration';
	export { DateEnv, DateMarkerMeta } from 'fullcalendar/src/datelib/env';
	export { defineLocale, getLocale, getLocaleCodes } from 'fullcalendar/src/datelib/locale';
	export { DateFormatter, createFormatter, VerboseFormattingArg } from 'fullcalendar/src/datelib/formatting';
	export { NamedTimeZoneImpl, registerNamedTimeZoneImpl } from 'fullcalendar/src/datelib/timezone';
	export { registerCmdFormatter } from 'fullcalendar/src/datelib/formatting-cmd';
	export { parse as parseMarker } from 'fullcalendar/src/datelib/parsing';
	export { registerEventSourceDef } from 'fullcalendar/src/structs/event-source';
	export { refineProps } from 'fullcalendar/src/util/misc';
	export { default as PointerDragging, PointerDragEvent } from 'fullcalendar/PointerDragging';
	export { default as ElementDragging } from 'fullcalendar/ElementDragging';
	export { default as Draggable } from 'fullcalendar/ExternalDraggable';
	export { default as ThirdPartyDraggable } from 'fullcalendar/ThirdPartyDraggable';
	export { Hit } from 'fullcalendar/HitDragging';
	export { dateSelectionJoinTransformer } from 'fullcalendar/DateSelecting';
	export { formatDate, formatRange } from 'fullcalendar/src/formatting-api';
	export { globalDefaults } from 'fullcalendar/src/options';
	export { registerRecurringType, ParsedRecurring } from 'fullcalendar/src/structs/recurring-event';
	export { createPlugin, PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerModifier } from 'fullcalendar/src/plugin-system';
	export { reducerFunc, Action, CalendarState } from 'fullcalendar/src/reducers/types';
	export { CalendarComponentProps } from 'fullcalendar/CalendarComponent';
	export { computeFallbackHeaderFormat, renderDateCell } from 'fullcalendar/src/common/table-utils';
	export { default as OffsetTracker } from 'fullcalendar/OffsetTracker';
	export { default as DaySeries } from 'fullcalendar/DaySeries';
	export { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	export { EventRenderRange, sliceEventStore, hasBgRendering } from 'fullcalendar/src/component/event-rendering';
	export { default as DayTable, DayTableSeg, DayTableCell } from 'fullcalendar/DayTable';
	export { default as Slicer, SlicedProps } from 'fullcalendar/src/common/slicing-utils';
	export { EventMutation } from 'fullcalendar/src/structs/event-mutation';
	export { Constraint, ConstraintInput, AllowFunc, isPropsValid } from 'fullcalendar/src/validation';
	export { default as EventApi } from 'fullcalendar/EventApi';
}
declare module 'fullcalendar/Bootstrap3Theme' {
	import Theme from 'fullcalendar/Theme';
	export class Default extends Theme {
	}
	export default Default;
}
declare module 'fullcalendar/Bootstrap4Theme' {
	import Theme from 'fullcalendar/Theme';
	export class Default extends Theme {
	}
	export default Default;
}
declare module 'fullcalendar/src/theme/config' {
	export {};
}
declare module 'fullcalendar/src/event-sources/array-event-source' {
	export {};
}
declare module 'fullcalendar/src/event-sources/json-feed-event-source' {
	export {};
}
declare module 'fullcalendar/src/structs/recurring-event-simple' {
	export {};
}
declare module 'fullcalendar/src/basic/config' {
	import { PluginDef } from 'fullcalendar/src/plugin-system'; let plugin: PluginDef;
	export default plugin;
}
declare module 'fullcalendar/src/agenda/config' {
	import { PluginDef } from 'fullcalendar/src/plugin-system'; let plugin: PluginDef;
	export default plugin;
}
declare module 'fullcalendar/src/list/config' {
	import { PluginDef } from 'fullcalendar/src/plugin-system'; let plugin: PluginDef;
	export default plugin;
}
declare module 'fullcalendar/src/main' {
	import * as exportHooks from 'fullcalendar/src/exports';
	import 'fullcalendar/src/theme/config';
	import 'fullcalendar/src/event-sources/array-event-source';
	import 'fullcalendar/src/event-sources/func-event-source';
	import 'fullcalendar/src/event-sources/json-feed-event-source';
	import 'fullcalendar/src/structs/recurring-event-simple';
	export = exportHooks;
}
declare module 'fullcalendar/plugins/gcal/main' {
	export {};
}
declare module 'fullcalendar/plugins/luxon/main' {
	import { DateTime, Duration } from 'luxon';
	import * as fc from 'fullcalendar';
	export function toDateTime(date: Date, calendar: fc.Calendar): DateTime;
	export function toDuration(duration: fc.Duration, calendar: fc.Calendar): Duration;
}
declare module 'fullcalendar/plugins/moment/main' {
	import * as moment from 'moment';
	import * as fc from 'fullcalendar';
	export function toMoment(date: Date, calendar: fc.Calendar): moment.Moment;
	export function toDuration(fcDuration: fc.Duration): moment.Duration;
}
declare module 'fullcalendar/plugins/moment-timezone/main' {
	import 'moment-timezone';
}
declare module 'fullcalendar/plugins/rrule/main' {
	export {};
}
declare module 'fullcalendar' {
	import main = require('fullcalendar/src/main');
	export = main;
}
