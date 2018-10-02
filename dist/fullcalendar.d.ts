declare module 'fullcalendar/src/util/object' {
	export function assignTo(target: any, ...sources: any[]): any;
	export function copyOwnProps(src: any, dest: any): void;
	export function mergeProps(propObjs: any, complexProps?: any): any;
	export function filterHash(hash: any, func: any): {};
	export function mapHash(hash: any, func: any): {};
	export function arrayToHash(a: any): {
	    [key: string]: true;
	};
}
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
declare module 'fullcalendar/src/util/reselector' {
	export default function (workerFunc: any): () => any;
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
	export function computeVisibleDayRange(timedRange: DateRange, nextDayThreshold: Duration): DateRange;
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
declare module 'fullcalendar/src/util/html' {
	export function htmlEscape(s: any): string;
	export function cssToStr(cssProps: any): string;
	export function attrsToStr(attrs: any): string;
	export type ClassNameInput = string | string[];
	export function parseClassName(raw: ClassNameInput): string[];
}
declare module 'fullcalendar/Component' {
	export type RenderForceFlags = true | {
	    [entity: string]: boolean;
	};
	export abstract class Default {
	    el: HTMLElement;
	    setElement(el: HTMLElement): void;
	    removeElement(): void;
	    bindGlobalHandlers(): void;
	    unbindGlobalHandlers(): void;
	    abstract render(state: any, forceFlags: RenderForceFlags): any;
	}
	export default Default;
}
declare module 'fullcalendar/src/structs/view-config' {
	import View from 'fullcalendar/View';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	import Calendar from 'fullcalendar/Calendar';
	export type ViewClass = new (calendar: Calendar, viewSpec: ViewSpec) => View;
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
	export function buildViewSpecs(defaultInputs: ViewConfigInputHash, optionsManager: OptionsManager): ViewSpecHash;
}
declare module 'fullcalendar/Toolbar' {
	import { default as Component, RenderForceFlags } from 'fullcalendar/Component';
	import Calendar from 'fullcalendar/Calendar';
	export interface ToolbarRenderProps {
	    layout: any;
	    title: string;
	    activeButton: string;
	    isTodayEnabled: boolean;
	    isPrevEnabled: boolean;
	    isNextEnabled: boolean;
	}
	export class Default extends Component {
	    calendar: Calendar;
	    el: HTMLElement;
	    viewsWithButtons: any;
	    isLayoutRendered: boolean;
	    layout: any;
	    title: string;
	    activeButton: string;
	    isTodayEnabled: boolean;
	    isPrevEnabled: boolean;
	    isNextEnabled: boolean;
	    constructor(calendar: any, extraClassName: any);
	    render(renderProps: ToolbarRenderProps, forceFlags: RenderForceFlags): void;
	    renderLayout(layout: any): void;
	    unrenderLayout(): void;
	    removeElement(): void;
	    renderSection(position: any, buttonStr: any): HTMLElement;
	    updateTitle(text: any): void;
	    activateButton(buttonName: any): void;
	    deactivateButton(buttonName: any): void;
	    disableButton(buttonName: any): void;
	    enableButton(buttonName: any): void;
	    getViewsWithButtons(): any;
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
	    parse: (rawEvent: EventInput, leftoverProps: any, dateEnv: DateEnv) => ParsedRecurring | null;
	    expand: (typeData: any, eventDef: EventDef, framingRange: DateRange, dateEnv: DateEnv) => DateMarker[];
	}
	export function registerRecurringType(recurringType: RecurringType): void;
	export function parseRecurring(eventInput: EventInput, dateEnv: DateEnv, leftovers: any): {
	    allDay: boolean;
	    duration: Duration;
	    typeData: any;
	    typeId: number;
	};
	export function expandRecurringRanges(eventDef: EventDef, framingRange: DateRange, dateEnv: DateEnv): DateMarker[];
}
declare module 'fullcalendar/src/structs/event-store' {
	import { EventInput, EventDef, EventDefHash, EventInstance, EventInstanceHash, EventTuple } from 'fullcalendar/src/structs/event';
	import { EventSource } from 'fullcalendar/src/structs/event-source';
	import Calendar from 'fullcalendar/Calendar';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	export interface EventStore {
	    defs: EventDefHash;
	    instances: EventInstanceHash;
	}
	export function parseEvents(rawEvents: EventInput[], sourceId: string, calendar: Calendar): EventStore;
	export function eventTupleToStore(tuple: EventTuple, eventStore?: EventStore): EventStore;
	export function expandRecurring(eventStore: EventStore, framingRange: DateRange, calendar: Calendar): EventStore;
	export function getRelevantEvents(eventStore: EventStore, instanceId: string): EventStore;
	export function isEventDefsGrouped(def0: EventDef, def1: EventDef): boolean;
	export function transformRawEvents(rawEvents: any, eventSource: EventSource, calendar: Calendar): any;
	export function createEmptyEventStore(): EventStore;
	export function mergeEventStores(store0: EventStore, store1: EventStore): EventStore;
	export function filterEventStoreDefs(eventStore: EventStore, filterFunc: (eventDef: EventDef) => boolean): EventStore;
	export function mapEventInstances(eventStore: EventStore, callback: (instance: EventInstance, def: EventDef) => any): any[];
}
declare module 'fullcalendar/src/structs/date-span' {
	import { DateRange, OpenDateRange } from 'fullcalendar/src/datelib/date-range';
	import { DateInput, DateEnv } from 'fullcalendar/src/datelib/env';
	import { Duration } from 'fullcalendar/src/datelib/duration';
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
	    allDay: boolean;
	    [otherProp: string]: any;
	}
	export function parseDateSpan(raw: DateSpanInput, dateEnv: DateEnv, defaultDuration?: Duration): DateSpan | null;
	export function parseOpenDateSpan(raw: OpenDateSpanInput, dateEnv: DateEnv): OpenDateSpan | null;
	export function isDateSpansEqual(span0: DateSpan, span1: DateSpan): boolean;
	export function isSpanPropsEqual(span0: DateSpan, span1: DateSpan): boolean;
	export function isSpanPropsMatching(subjectSpan: DateSpan, matchSpan: DateSpan): boolean;
	export function buildDateSpanApi(span: DateSpan, dateEnv: DateEnv): DateSpanApi;
}
declare module 'fullcalendar/src/structs/event-mutation' {
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import Calendar from 'fullcalendar/Calendar';
	export interface EventMutation {
	    startDelta?: Duration;
	    endDelta?: Duration;
	    standardProps?: any;
	    extendedProps?: any;
	}
	export function applyMutationToEventStore(eventStore: EventStore, mutation: EventMutation, calendar: Calendar): EventStore;
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
	import { EventDef, EventInstance, EventTuple } from 'fullcalendar/src/structs/event';
	import { DateInput } from 'fullcalendar/src/datelib/env';
	import { DurationInput } from 'fullcalendar/src/datelib/duration';
	import { FormatterInput } from 'fullcalendar/src/datelib/formatting';
	import EventSourceApi from 'fullcalendar/EventSourceApi';
	export class Default implements EventTuple {
	    calendar: Calendar;
	    def: EventDef;
	    instance: EventInstance | null;
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
	    readonly startEditable: boolean;
	    readonly durationEditable: boolean;
	    readonly constraint: any;
	    readonly overlap: any;
	    readonly rendering: string;
	    readonly backgroundColor: string;
	    readonly borderColor: string;
	    readonly textColor: string;
	    readonly classNames: string[];
	    readonly extendedProps: any;
	}
	export default Default;
}
declare module 'fullcalendar/src/validation' {
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import Calendar from 'fullcalendar/Calendar';
	import { DateSpan, OpenDateSpanInput, OpenDateSpan, DateSpanApi } from 'fullcalendar/src/structs/date-span';
	import { EventInstance, EventDef, EventTuple } from 'fullcalendar/src/structs/event';
	import EventApi from 'fullcalendar/EventApi';
	export type ConstraintInput = 'businessHours' | string | OpenDateSpanInput | {
	    [timeOrRecurringProp: string]: any;
	};
	export type Constraint = 'businessHours' | string | OpenDateSpan | EventTuple;
	export type Overlap = boolean | ((stillEvent: EventApi, movingEvent: EventApi | null) => boolean);
	export type Allow = (span: DateSpanApi, movingEvent: EventApi | null) => boolean;
	export function isEventsValid(eventStore: EventStore, calendar: Calendar): boolean;
	export function isSelectionValid(selection: DateSpan, calendar: Calendar): boolean;
	export function eventToDateSpan(def: EventDef, instance: EventInstance): DateSpan;
	export function normalizeConstraint(input: ConstraintInput, calendar: Calendar): Constraint | null;
}
declare module 'fullcalendar/src/structs/event' {
	import { ClassNameInput } from 'fullcalendar/src/util/html';
	import { DateInput } from 'fullcalendar/src/datelib/env';
	import Calendar from 'fullcalendar/Calendar';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { ConstraintInput, Constraint } from 'fullcalendar/src/validation';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	export type EventRenderingChoice = '' | 'background' | 'inverse-background' | 'none';
	export interface EventNonDateInput {
	    id?: string | number;
	    groupId?: string | number;
	    title?: string;
	    url?: string;
	    editable?: boolean;
	    startEditable?: boolean;
	    durationEditable?: boolean;
	    constraint?: ConstraintInput;
	    overlap?: boolean;
	    rendering?: EventRenderingChoice;
	    classNames?: ClassNameInput;
	    className?: ClassNameInput;
	    color?: string;
	    backgroundColor?: string;
	    borderColor?: string;
	    textColor?: string;
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
	    startEditable: boolean | null;
	    durationEditable: boolean | null;
	    constraint: Constraint | null;
	    overlap: boolean | null;
	    rendering: EventRenderingChoice;
	    classNames: string[];
	    backgroundColor: string;
	    borderColor: string;
	    textColor: string;
	    extendedProps: object;
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
	export function parseEvent(raw: EventInput, sourceId: string, calendar: Calendar): EventTuple | null;
	export function parseEventDef(raw: EventNonDateInput, sourceId: string, allDay: boolean, hasEnd: boolean, calendar: Calendar): EventDef;
	export function createEventInstance(defId: string, range: DateRange, forcedStartTzo?: number, forcedEndTzo?: number): EventInstance;
}
declare module 'fullcalendar/src/util/promise' {
	export function unpromisify(func: any, success: any, failure?: any): void;
}
declare module 'fullcalendar/src/event-sources/func-event-source' {
	import { EventInput } from 'fullcalendar/src/structs/event';
	export type EventSourceFunc = (arg: {
	    start: Date;
	    end: Date;
	    timeZone: string;
	}, successCallback: (events: EventInput[]) => void, failureCallback: (errorObj: any) => void) => any;
}
declare module 'fullcalendar/src/structs/event-source' {
	import { ClassNameInput } from 'fullcalendar/src/util/html';
	import { EventInput } from 'fullcalendar/src/structs/event';
	import Calendar from 'fullcalendar/Calendar';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { EventSourceFunc } from 'fullcalendar/src/event-sources/func-event-source';
	import { ConstraintInput, Constraint, Allow } from 'fullcalendar/src/validation';
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
	    editable?: boolean;
	    startEditable?: boolean;
	    durationEditable?: boolean;
	    constraint?: ConstraintInput;
	    overlap?: boolean;
	    allow?: Allow;
	    rendering?: string;
	    className?: ClassNameInput;
	    color?: string;
	    backgroundColor?: string;
	    borderColor?: string;
	    textColor?: string;
	    events?: EventInput[];
	    url?: string;
	    method?: string;
	    data?: object | (() => object);
	    startParam?: string;
	    endParam?: string;
	    timeZoneParam?: string;
	    success?: EventSourceSuccessResponseHandler;
	    failure?: EventSourceErrorResponseHandler;
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
	    startEditable: boolean | null;
	    durationEditable: boolean | null;
	    constraint: Constraint | null;
	    overlap: boolean | null;
	    allow: Allow | null;
	    rendering: string;
	    className: string[];
	    backgroundColor: string;
	    borderColor: string;
	    textColor: string;
	    success: EventSourceSuccessResponseHandler | null;
	    failure: EventSourceErrorResponseHandler | null;
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
	}) => void, failure: (error: EventSourceError) => void) => void;
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
declare module 'fullcalendar/DateProfileGenerator' {
	import View from 'fullcalendar/View';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateRange, OpenDateRange } from 'fullcalendar/src/datelib/date-range';
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
	    _view: View;
	    constructor(_view: any);
	    opt(name: any): any;
	    trimHiddenDays(range: any): DateRange;
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
	}
	export function isDateProfilesEqual(p0: DateProfile, p1: DateProfile): boolean;
	export default Default;
}
declare module 'fullcalendar/src/component/event-rendering' {
	import { EventDef, EventDefHash, EventTuple } from 'fullcalendar/src/structs/event';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { EventSourceHash } from 'fullcalendar/src/structs/event-source';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	export interface EventUi {
	    startEditable: boolean;
	    durationEditable: boolean;
	    backgroundColor: string;
	    borderColor: string;
	    textColor: string;
	    rendering: string;
	    classNames: string[];
	}
	export type EventUiHash = {
	    [defId: string]: EventUi;
	};
	export interface EventRenderRange extends EventTuple {
	    ui: EventUi;
	    range: DateRange;
	    isStart: boolean;
	    isEnd: boolean;
	}
	export function sliceEventStore(eventStore: EventStore, eventUis: EventUiHash, framingRange: DateRange, nextDayThreshold?: Duration): EventRenderRange[];
	export function hasBgRendering(ui: EventUi): boolean;
	export function computeEventDefUis(eventDefs: EventDefHash, eventSources: EventSourceHash, options: any): {};
	export function computeEventDefUi(eventDef: EventDef, eventSources: EventSourceHash, options: any): EventUi;
}
declare module 'fullcalendar/src/interactions/event-interaction-state' {
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { Seg } from 'fullcalendar/DateComponent';
	import { EventUiHash } from 'fullcalendar/src/component/event-rendering';
	export interface EventInteractionState {
	    affectedEvents: EventStore;
	    mutatedEvents: EventStore;
	    isEvent: boolean;
	    origSeg: Seg | null;
	}
	export interface EventInteractionUiState extends EventInteractionState {
	    eventUis: EventUiHash;
	}
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
declare module 'fullcalendar/HitDragging' {
	import EmitterMixin from 'fullcalendar/EmitterMixin';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import ElementDragging from 'fullcalendar/ElementDragging';
	import DateComponent, { DateComponentHash } from 'fullcalendar/DateComponent';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { Rect, Point } from 'fullcalendar/src/util/geom';
	export interface Hit {
	    component: DateComponent;
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
	    constructor(dragging: ElementDragging, droppable: DateComponent | DateComponentHash);
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
declare module 'fullcalendar/DateClicking' {
	import DateComponent from 'fullcalendar/DateComponent';
	import FeaturefulElementDragging from 'fullcalendar/FeaturefulElementDragging';
	import HitDragging from 'fullcalendar/HitDragging';
	import { PointerDragEvent } from 'fullcalendar/PointerDragging';
	export class Default {
	    component: DateComponent;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    constructor(component: DateComponent);
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
	    component: DateComponent;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    dragSelection: DateSpan | null;
	    constructor(component: DateComponent);
	    destroy(): void;
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handleDragStart: (ev: PointerDragEvent) => void;
	    handleHitUpdate: (hit: Hit, isFinal: boolean) => void;
	    handlePointerUp: (pev: PointerDragEvent) => void;
	}
	export default Default;
}
declare module 'fullcalendar/EventRenderer' {
	import View from 'fullcalendar/View';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateFormatter } from 'fullcalendar/src/datelib/formatting';
	import { EventRenderRange, EventUi } from 'fullcalendar/src/component/event-rendering';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default {
	    view: View;
	    component: any;
	    fillRenderer: any;
	    fgSegs: Seg[];
	    bgSegs: Seg[];
	    eventTimeFormat: DateFormatter;
	    displayEventTime: boolean;
	    displayEventEnd: boolean;
	    constructor(component: any, fillRenderer: any);
	    opt(name: any): any;
	    rangeUpdated(): void;
	    renderSegs(allSegs: Seg[]): void;
	    unrender(): void;
	    getSegs(): Seg[];
	    renderFgSegs(segs: Seg[]): (boolean | void);
	    unrenderFgSegs(segs: Seg[]): void;
	    renderBgSegs(segs: Seg[]): Seg[];
	    unrenderBgSegs(): void;
	    renderFgSegEls(segs: Seg[], isMirrors?: boolean): any[];
	    fgSegHtml(seg: Seg): void;
	    getSegClasses(seg: Seg, isDraggable: any, isResizable: any): string[];
	    filterEventRenderEl(seg: Seg, el: HTMLElement, isMirror?: boolean): HTMLElement;
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
	    computeFgSize(): void;
	    assignFgSize(): void;
	}
	export function getElSeg(el: HTMLElement): Seg | null;
	export function buildSegCompareObj(seg: Seg): any;
	export default Default;
}
declare module 'fullcalendar/EventClicking' {
	import DateComponent from 'fullcalendar/DateComponent';
	export class Default {
	    component: DateComponent;
	    destroy: () => void;
	    constructor(component: DateComponent);
	    handleSegClick: (ev: Event, segEl: HTMLElement) => void;
	}
	export default Default;
}
declare module 'fullcalendar/EventHovering' {
	import DateComponent from 'fullcalendar/DateComponent';
	export class Default {
	    component: DateComponent;
	    removeHoverListeners: () => void;
	    currentSegEl: HTMLElement;
	    constructor(component: DateComponent);
	    destroy(): void;
	    handleEventElRemove: (el: HTMLElement) => void;
	    handleSegEnter: (ev: Event, segEl: HTMLElement) => void;
	    handleSegLeave: (ev: Event, segEl: HTMLElement) => void;
	    triggerEvent(publicEvName: string, ev: Event | null, segEl: HTMLElement): void;
	}
	export default Default;
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
	    component: DateComponent;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    subjectSeg: Seg | null;
	    isDragging: boolean;
	    eventRange: EventRenderRange | null;
	    relevantEvents: EventStore | null;
	    receivingCalendar: Calendar | null;
	    validMutation: EventMutation | null;
	    mutatedRelevantEvents: EventStore | null;
	    constructor(component: DateComponent);
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
	    component: DateComponent;
	    dragging: FeaturefulElementDragging;
	    hitDragging: HitDragging;
	    draggingSeg: Seg | null;
	    eventRange: EventRenderRange | null;
	    relevantEvents: EventStore | null;
	    validMutation: EventMutation | null;
	    mutatedRelevantEvents: EventStore | null;
	    constructor(component: DateComponent);
	    destroy(): void;
	    handlePointerDown: (ev: PointerDragEvent) => void;
	    handleDragStart: (ev: PointerDragEvent) => void;
	    handleHitUpdate: (hit: Hit, isFinal: boolean, ev: PointerDragEvent) => void;
	    handleDragEnd: (ev: PointerDragEvent) => void;
	    querySeg(ev: PointerDragEvent): Seg | null;
	}
	export default Default;
}
declare module 'fullcalendar/src/common/browser-context' {
	import DateComponent from 'fullcalendar/DateComponent';
	export class BrowserContext {
	    componentHash: {};
	    listenerHash: {};
	    registerComponent(component: DateComponent): void;
	    unregisterComponent(component: DateComponent): void;
	    bindComponent(component: DateComponent): void;
	    unbindComponent(component: DateComponent): void;
	} const _default: BrowserContext;
	export default _default;
}
declare module 'fullcalendar/DateComponent' {
	import { default as Component, RenderForceFlags } from 'fullcalendar/Component';
	import Calendar from 'fullcalendar/Calendar';
	import View from 'fullcalendar/View';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { EventRenderRange, EventUiHash } from 'fullcalendar/src/component/event-rendering';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	import Theme from 'fullcalendar/Theme';
	import { EventInteractionUiState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { Hit } from 'fullcalendar/HitDragging';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import EmitterMixin from 'fullcalendar/EmitterMixin';
	export interface DateComponentRenderState {
	    dateProfile: DateProfile | null;
	    businessHours: EventStore;
	    eventStore: EventStore;
	    eventUis: EventUiHash;
	    dateSelection: DateSpan | null;
	    eventSelection: string;
	    eventDrag: EventInteractionUiState | null;
	    eventResize: EventInteractionUiState | null;
	}
	export interface Seg {
	    component: Default;
	    isStart: boolean;
	    isEnd: boolean;
	    eventRange?: EventRenderRange;
	    el?: HTMLElement;
	    [otherProp: string]: any;
	}
	export type DateComponentHash = {
	    [id: string]: Default;
	};
	export abstract class Default extends Component {
	    isInteractable: boolean;
	    useEventCenter: boolean;
	    doesDragMirror: boolean;
	    doesDragHighlight: boolean;
	    fgSegSelector: string;
	    bgSegSelector: string;
	    largeUnit: any;
	    slicingType: 'timed' | 'all-day' | null;
	    eventRendererClass: any;
	    mirrorRendererClass: any;
	    fillRendererClass: any;
	    uid: any;
	    childrenByUid: any;
	    isRtl: boolean;
	    nextDayThreshold: Duration;
	    view: View;
	    emitter: EmitterMixin;
	    eventRenderer: any;
	    mirrorRenderer: any;
	    fillRenderer: any;
	    renderedFlags: any;
	    dirtySizeFlags: any;
	    needHitsDepth: number;
	    dateProfile: DateProfile;
	    businessHours: EventStore;
	    eventStore: EventStore;
	    eventUis: EventUiHash;
	    dateSelection: DateSpan;
	    eventSelection: string;
	    eventDrag: EventInteractionUiState;
	    eventResize: EventInteractionUiState;
	    constructor(_view: any, _options?: any);
	    addChild(child: any): boolean;
	    removeChild(child: any): boolean;
	    updateSize(totalHeight: any, isAuto: any, force: any): void;
	    updateBaseSize(totalHeight: any, isAuto: any): void;
	    buildPositionCaches(): void;
	    requestPrepareHits(): void;
	    requestReleaseHits(): void;
	    protected prepareHits(): void;
	    protected releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit | null;
	    bindGlobalHandlers(): void;
	    unbindGlobalHandlers(): void;
	    opt(name: any): any;
	    publiclyTrigger(name: any, args: any): any;
	    publiclyTriggerAfterSizing(name: any, args: any): void;
	    hasPublicHandlers(name: any): boolean;
	    triggerRenderedSegs(segs: Seg[], isMirrors?: boolean): void;
	    triggerWillRemoveSegs(segs: Seg[]): void;
	    render(renderState: DateComponentRenderState, forceFlags: RenderForceFlags): void;
	    renderByFlag(renderState: DateComponentRenderState, flags: any): void;
	    unrender(flags?: any): void;
	    renderChildren(renderState: DateComponentRenderState, forceFlags: RenderForceFlags): void;
	    removeElement(): void;
	    renderSkeleton(): void;
	    afterSkeletonRender(): void;
	    beforeSkeletonUnrender(): void;
	    unrenderSkeleton(): void;
	    renderDates(dateProfile: DateProfile): void;
	    afterDatesRender(): void;
	    beforeDatesUnrender(): void;
	    unrenderDates(): void;
	    getNowIndicatorUnit(): void;
	    renderNowIndicator(date: any): void;
	    unrenderNowIndicator(): void;
	    renderBusinessHours(businessHours: EventStore): void;
	    renderBusinessHourRanges(eventRanges: EventRenderRange[]): void;
	    unrenderBusinessHours(): void;
	    computeBusinessHoursSize(): void;
	    assignBusinessHoursSize(): void;
	    renderEvents(eventStore: EventStore, eventUis: EventUiHash): void;
	    renderEventRanges(eventRanges: EventRenderRange[]): void;
	    unrenderEvents(): void;
	    computeEventsSize(): void;
	    assignEventsSize(): void;
	    renderEventDragState(state: EventInteractionUiState): void;
	    unrenderEventDragState(): void;
	    renderEventDrag(eventStore: EventStore, eventUis: EventUiHash, isEvent: boolean, origSeg: Seg | null): void;
	    unrenderEventDrag(): void;
	    renderEventResizeState(state: EventInteractionUiState): void;
	    unrenderEventResizeState(): void;
	    renderEventResize(eventStore: EventStore, eventUis: EventUiHash, origSeg: any): void;
	    unrenderEventResize(): void;
	    hideSegsByHash(hash: any): void;
	    showSegsByHash(hash: any): void;
	    getAllEventSegs(): Seg[];
	    selectEventsByInstanceId(instanceId: any): void;
	    unselectAllEvents(): void;
	    handlExternalDragStart(ev: any, el: any, skipBinding: any): void;
	    handleExternalDragMove(ev: any): void;
	    handleExternalDragStop(ev: any): void;
	    renderDateSelection(selection: DateSpan): void;
	    unrenderDateSelection(): void;
	    renderHighlightSegs(segs: any): void;
	    unrenderHighlight(): void;
	    computeHighlightSize(): void;
	    assignHighlightSize(): void;
	    computeMirrorSize(): void;
	    assignMirrorSize(): void;
	    eventStoreToRanges(eventStore: EventStore, eventUis: EventUiHash): EventRenderRange[];
	    eventRangesToSegs(eventRenderRanges: EventRenderRange[]): Seg[];
	    selectionToSegs(selection: DateSpan, fabricateEvents: boolean): Seg[];
	    rangeToSegs(range: DateRange, allDay: boolean): Seg[];
	    callChildren(methodName: any, args: any): void;
	    iterChildren(func: any): void;
	    getCalendar(): Calendar;
	    getDateEnv(): DateEnv;
	    getTheme(): Theme;
	    buildGotoAnchorHtml(gotoOptions: any, attrs: any, innerHtml: any): string;
	    getAllDayHtml(): any;
	    getDayClasses(date: DateMarker, noThemeHighlight?: any): any[];
	    currentRangeAs(unit: any): any;
	    isValidSegDownEl(el: HTMLElement): boolean;
	    isValidDateDownEl(el: HTMLElement): boolean;
	    isInPopover(el: HTMLElement): boolean;
	    isEventsValid(eventStore: EventStore): boolean;
	    isSelectionValid(selection: DateSpan): boolean;
	}
	export default Default;
}
declare module 'fullcalendar/src/reducers/types' {
	import { EventInput, EventInstanceHash } from 'fullcalendar/src/structs/event';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventMutation } from 'fullcalendar/src/structs/event-mutation';
	import { DateComponentRenderState } from 'fullcalendar/DateComponent';
	import { EventSource, EventSourceHash, EventSourceError } from 'fullcalendar/src/structs/event-source';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { DateEnv } from 'fullcalendar/src/datelib/env';
	export interface CalendarState extends DateComponentRenderState {
	    eventSources: EventSourceHash;
	    eventSourceLoadingLevel: number;
	    loadingLevel: number;
	}
	export type Action = {
	    type: 'SET_DATE_PROFILE';
	    dateProfile: DateProfile;
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
	} | {
	    type: 'ADD_EVENTS';
	    eventStore: EventStore;
	} | {
	    type: 'MERGE_EVENTS';
	    eventStore: EventStore;
	} | {
	    type: 'MUTATE_EVENTS';
	    instanceId: string;
	    mutation: EventMutation;
	} | {
	    type: 'REMOVE_EVENT_DEF';
	    defId: string;
	} | {
	    type: 'REMOVE_EVENT_INSTANCES';
	    instances: EventInstanceHash;
	} | {
	    type: 'REMOVE_ALL_EVENTS';
	};
}
declare module 'fullcalendar/src/reducers/eventSources' {
	import { EventSourceHash } from 'fullcalendar/src/structs/event-source';
	import Calendar from 'fullcalendar/Calendar';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { Action } from 'fullcalendar/src/reducers/types';
	export default function (eventSources: EventSourceHash, action: Action, dateProfile: DateProfile | null, calendar: Calendar): EventSourceHash;
}
declare module 'fullcalendar/src/reducers/eventStore' {
	import Calendar from 'fullcalendar/Calendar';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { Action } from 'fullcalendar/src/reducers/types';
	import { EventSourceHash } from 'fullcalendar/src/structs/event-source';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export default function (eventStore: EventStore, action: Action, eventSources: EventSourceHash, dateProfile: DateProfile, calendar: Calendar): EventStore;
}
declare module 'fullcalendar/src/reducers/main' {
	import Calendar from 'fullcalendar/Calendar';
	import { CalendarState, Action } from 'fullcalendar/src/reducers/types';
	export default function (state: CalendarState, action: Action, calendar: Calendar): CalendarState;
}
declare module 'fullcalendar/src/structs/business-hours' {
	import Calendar from 'fullcalendar/Calendar';
	import { EventInput } from 'fullcalendar/src/structs/event';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	export type BusinessHoursInput = boolean | EventInput | EventInput[];
	export function parseBusinessHours(input: BusinessHoursInput, calendar: Calendar): EventStore;
}
declare module 'fullcalendar/Calendar' {
	import { EmitterInterface } from 'fullcalendar/EmitterMixin';
	import Toolbar from 'fullcalendar/Toolbar';
	import OptionsManager from 'fullcalendar/OptionsManager';
	import View from 'fullcalendar/View';
	import Theme from 'fullcalendar/Theme';
	import { OptionsInput } from 'fullcalendar/src/types/input-types';
	import { DateEnv, DateInput } from 'fullcalendar/src/datelib/env';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { RenderForceFlags } from 'fullcalendar/Component';
	import { DateRangeInput } from 'fullcalendar/src/datelib/date-range';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	import { EventSourceInput, EventSourceHash } from 'fullcalendar/src/structs/event-source';
	import { EventInput, EventDefHash } from 'fullcalendar/src/structs/event';
	import { CalendarState, Action } from 'fullcalendar/src/reducers/types';
	import EventSourceApi from 'fullcalendar/EventSourceApi';
	import EventApi from 'fullcalendar/EventApi';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { EventUiHash } from 'fullcalendar/src/component/event-rendering';
	import { BusinessHoursInput } from 'fullcalendar/src/structs/business-hours';
	import PointerDragging, { PointerDragEvent } from 'fullcalendar/PointerDragging';
	import { ViewSpecHash, ViewSpec } from 'fullcalendar/src/structs/view-spec';
	export class Default {
	    static on: EmitterInterface['on'];
	    static off: EmitterInterface['off'];
	    static trigger: EmitterInterface['trigger'];
	    on: EmitterInterface['on'];
	    one: EmitterInterface['one'];
	    off: EmitterInterface['off'];
	    trigger: EmitterInterface['trigger'];
	    triggerWith: EmitterInterface['triggerWith'];
	    hasHandlers: EmitterInterface['hasHandlers'];
	    buildDateEnv: any;
	    buildTheme: any;
	    computeEventDefUis: (eventDefs: EventDefHash, eventSources: EventSourceHash, options: any) => EventUiHash;
	    parseBusinessHours: (input: BusinessHoursInput) => EventStore;
	    optionsManager: OptionsManager;
	    viewSpecs: ViewSpecHash;
	    theme: Theme;
	    dateEnv: DateEnv;
	    defaultAllDayEventDuration: Duration;
	    defaultTimedEventDuration: Duration;
	    el: HTMLElement;
	    elThemeClassName: string;
	    elDirClassName: string;
	    contentEl: HTMLElement;
	    documentPointer: PointerDragging;
	    isRecentPointerDateSelect: boolean;
	    suggestedViewHeight: number;
	    ignoreUpdateViewSize: number;
	    removeNavLinkListener: any;
	    windowResizeProxy: any;
	    viewsByType: {
	        [viewType: string]: View;
	    };
	    view: View;
	    renderedView: View;
	    header: Toolbar;
	    footer: Toolbar;
	    state: CalendarState;
	    actionQueue: any[];
	    isReducing: boolean;
	    isDisplaying: boolean;
	    isRendering: boolean;
	    isSkeletonRendered: boolean;
	    renderingPauseDepth: number;
	    rerenderFlags: RenderForceFlags;
	    renderableEventStore: EventStore;
	    buildDelayedRerender: any;
	    delayedRerender: any;
	    afterSizingTriggers: any;
	    constructor(el: HTMLElement, overrides: OptionsInput);
	    getView(): View;
	    render(): void;
	    destroy(): void;
	    _render(): void;
	    _destroy(): void;
	    smash(): void;
	    applyElClassNames(): void;
	    removeElClassNames(): void;
	    renderSkeleton(): void;
	    unrenderSkeleton(): void;
	    bindGlobalHandlers(): void;
	    unbindGlobalHandlers(): void;
	    hydrate(): void;
	    buildInitialState(): CalendarState;
	    dispatch(action: Action): void;
	    reduce(state: CalendarState, action: Action, calendar: Default): CalendarState;
	    requestRerender(forceFlags?: RenderForceFlags): void;
	    tryRerender(): void;
	    batchRendering(func: any): void;
	    setOption(name: string, value: any): void;
	    getOption(name: string): any;
	    opt(name: string): any;
	    handleOptions(options: any): void;
	    hasPublicHandlers(name: string): boolean;
	    publiclyTrigger(name: string, args?: any): any;
	    publiclyTriggerAfterSizing(name: any, args: any): void;
	    releaseAfterSizingTriggers(): void;
	    renderView(forceFlags: RenderForceFlags): void;
	    getViewByType(viewType: string): View;
	    instantiateView(viewType: string): View;
	    isValidViewType(viewType: string): boolean;
	    changeView(viewType: string, dateOrRange?: DateRangeInput | DateInput): void;
	    zoomTo(dateMarker: DateMarker, viewType?: string): void;
	    getUnitViewSpec(unit: string): ViewSpec | null;
	    setViewType(viewType: string, dateMarker?: DateMarker): void;
	    getInitialDate(): Date;
	    prev(): void;
	    next(): void;
	    prevYear(): void;
	    nextYear(): void;
	    today(): void;
	    gotoDate(zonedDateInput: any): void;
	    incrementDate(deltaInput: any): void;
	    getDate(): Date;
	    setCurrentDateMarker(date: DateMarker): void;
	    setDateProfile(dateProfile: DateProfile): void;
	    formatDate(d: Date, formatter: any): string;
	    formatRange(d0: Date, d1: Date, settings: any): any;
	    formatIso(d: Date, omitTime?: boolean): string;
	    updateSize(): void;
	    getSuggestedViewHeight(): number;
	    isHeightAuto(): boolean;
	    updateViewSize(isResize?: boolean): boolean;
	    calcSize(): void;
	    _calcSize(): void;
	    elementVisible(): boolean;
	    windowResize(ev: Event): void;
	    freezeContentHeight(): void;
	    thawContentHeight(): void;
	    renderToolbars(forceFlags: RenderForceFlags): void;
	    queryToolbarsHeight(): number;
	    select(dateOrObj: DateInput | any, endDate?: DateInput): void;
	    unselect(pev?: PointerDragEvent): void;
	    triggerDateSelect(selection: DateSpan, pev?: PointerDragEvent): void;
	    triggerDateUnselect(pev?: PointerDragEvent): void;
	    triggerDayClick(dateSpan: DateSpan, dayEl: HTMLElement, view: View, ev: UIEvent): void;
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
	}
	export default Default;
}
declare module 'fullcalendar/View' {
	import Calendar from 'fullcalendar/Calendar';
	import { default as DateProfileGenerator, DateProfile } from 'fullcalendar/DateProfileGenerator';
	import DateComponent from 'fullcalendar/DateComponent';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { EmitterInterface } from 'fullcalendar/EmitterMixin';
	import { OpenDateRange, DateRange } from 'fullcalendar/src/datelib/date-range';
	import { ViewSpec } from 'fullcalendar/src/structs/view-spec';
	export abstract class Default extends DateComponent {
	    on: EmitterInterface['on'];
	    one: EmitterInterface['one'];
	    off: EmitterInterface['off'];
	    trigger: EmitterInterface['trigger'];
	    triggerWith: EmitterInterface['triggerWith'];
	    hasHandlers: EmitterInterface['hasHandlers'];
	    type: string;
	    title: string;
	    calendar: Calendar;
	    viewSpec: ViewSpec;
	    options: any;
	    queuedScroll: any;
	    eventOrderSpecs: any;
	    isHiddenDayHash: boolean[];
	    isNowIndicatorRendered: boolean;
	    initialNowDate: DateMarker;
	    initialNowQueriedMs: number;
	    nowIndicatorTimeoutID: any;
	    nowIndicatorIntervalID: any;
	    dateProfileGeneratorClass: any;
	    dateProfileGenerator: DateProfileGenerator;
	    usesMinMaxTime: boolean;
	    constructor(calendar: any, viewSpec: ViewSpec);
	    initialize(): void;
	    opt(name: any): any;
	    computeTitle(dateProfile: any): any;
	    computeTitleFormat(dateProfile: any): {
	        year: string;
	        month?: undefined;
	        day?: undefined;
	    } | {
	        year: string;
	        month: string;
	        day?: undefined;
	    } | {
	        year: string;
	        month: string;
	        day: string;
	    };
	    computeDateProfile(date: DateMarker): DateProfile;
	    readonly activeStart: Date;
	    readonly activeEnd: Date;
	    readonly currentStart: Date;
	    readonly currentEnd: Date;
	    afterSkeletonRender(): void;
	    beforeSkeletonUnrender(): void;
	    afterDatesRender(): void;
	    beforeDatesUnrender(): void;
	    startNowIndicator(): void;
	    updateNowIndicator(): void;
	    stopNowIndicator(): void;
	    updateSize(totalHeight: any, isAuto: any, force: any): void;
	    addScroll(scroll: any): void;
	    popScroll(): void;
	    applyQueuedScroll(): void;
	    queryScroll(): any;
	    applyScroll(scroll: any): void;
	    computeInitialDateScroll(): {};
	    queryDateScroll(): {};
	    applyDateScroll(scroll: any): void;
	    isDateInOtherMonth(date: DateMarker, dateProfile: any): boolean;
	    getRangeOption(name: any, ...otherArgs: any[]): OpenDateRange;
	    initHiddenDays(): void;
	    trimHiddenDays(range: DateRange): DateRange | null;
	    isHiddenDay(day: any): boolean;
	    skipHiddenDays(date: DateMarker, inc?: number, isExclusive?: boolean): Date;
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
	import { Allow, ConstraintInput, Overlap } from 'fullcalendar/src/validation';
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
	    selectOverlap?: Overlap;
	    selectAllow?: Allow;
	    events?: EventSourceInput;
	    eventSources?: EventSourceInput[];
	    allDayDefault?: boolean;
	    startParam?: string;
	    endParam?: string;
	    lazyFetching?: boolean;
	    eventColor?: string;
	    eventBackgroundColor?: string;
	    eventBorderColor?: string;
	    eventTextColor?: string;
	    nextDayThreshold?: DurationInput;
	    eventOrder?: string | Array<((a: EventApi, b: EventApi) => number) | (string | ((a: EventApi, b: EventApi) => number))>;
	    rerenderDelay?: number | null;
	    editable?: boolean;
	    eventStartEditable?: boolean;
	    eventDurationEditable?: boolean;
	    dragRevertDuration?: number;
	    dragScroll?: boolean;
	    eventConstraint?: ConstraintInput;
	    eventOverlap?: Overlap;
	    eventAllow?: Allow;
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
	}
}
declare module 'fullcalendar/PositionCache' {
	export class Default {
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
	    removeElement(): void;
	    applyOverflow(): void;
	    lockOverflow(scrollbarWidths: ScrollbarWidths): void;
	    setHeight(height: number | string): void;
	    getScrollbarWidths(): ScrollbarWidths;
	}
	export default Default;
}
declare module 'fullcalendar/ViewRegistry' {
	export const viewHash: {};
	export function defineView(viewType: string, viewConfig: any): void;
	export function getViewConfig(viewType: string): any;
}
declare module 'fullcalendar/DayTableMixin' {
	import Mixin from 'fullcalendar/Mixin';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	export interface DayTableInterface {
	    dayDates: DateMarker[];
	    daysPerRow: any;
	    rowCnt: any;
	    colCnt: any;
	    breakOnWeeks: boolean;
	    updateDayTable(): any;
	    renderHeadHtml(): any;
	    renderBgTrHtml(row: any): any;
	    bookendCells(trEl: HTMLElement): any;
	    getCellDate(row: any, col: any): any;
	    getCellRange(row: any, col: any): DateRange;
	    sliceRangeByDay(range: any): any;
	    sliceRangeByRow(range: any): any;
	    renderIntroHtml(): any;
	}
	export class Default extends Mixin implements DayTableInterface {
	    breakOnWeeks: boolean;
	    dayDates: DateMarker[];
	    dayIndices: any;
	    daysPerRow: any;
	    rowCnt: any;
	    colCnt: any;
	    colHeadFormat: any;
	    updateDayTable(): void;
	    updateDayTableCols(): void;
	    computeColCnt(): any;
	    getCellDate(row: any, col: any): DateMarker;
	    getCellRange(row: any, col: any): DateRange;
	    getCellDayIndex(row: any, col: any): any;
	    getColDayIndex(col: any): any;
	    getDateDayIndex(date: any): any;
	    computeColHeadFormat(): {
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
	    sliceRangeByRow(range: any): any[];
	    sliceRangeByDay(range: any): any[];
	    renderHeadHtml(): string;
	    renderHeadIntroHtml(): string;
	    renderHeadTrHtml(): string;
	    renderHeadDateCellsHtml(): string;
	    renderHeadDateCellHtml(date: DateMarker, colspan: any, otherAttrs: any): string;
	    renderBgTrHtml(row: any): string;
	    renderBgIntroHtml(row: any): string;
	    renderBgCellsHtml(row: any): string;
	    renderBgCellHtml(date: DateMarker, otherAttrs: any): string;
	    renderIntroHtml(): string;
	    bookendCells(trEl: HTMLElement): void;
	}
	export default Default;
}
declare module 'fullcalendar/FillRenderer' {
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default {
	    fillSegTag: string;
	    component: any;
	    containerElsByType: any;
	    renderedSegsByType: any;
	    constructor(component: any);
	    renderSegs(type: any, segs: Seg[], props: any): any[];
	    unrender(type: any): void;
	    buildSegEls(type: any, segs: Seg[], props: any): any[];
	    buildSegHtml(type: any, seg: Seg, props: any): string;
	    attachSegEls(type: any, segs: Seg[]): HTMLElement[];
	    computeSize(type: string): void;
	    assignSize(type: string): void;
	}
	export default Default;
}
declare module 'fullcalendar/MirrorRenderer' {
	import { Seg } from 'fullcalendar/DateComponent';
	export abstract class Default {
	    view: any;
	    component: any;
	    eventRenderer: any;
	    mirrorEls: HTMLElement[];
	    segs: Seg[];
	    constructor(component: any, eventRenderer: any);
	    renderEventDraggingSegs(segs: Seg[], sourceSeg: any): void;
	    renderEventResizingSegs(segs: Seg[], sourceSeg: any): void;
	    renderEventSegs(segs: Seg[], sourceSeg?: any, extraClassName?: any): void;
	    computeSize(): void;
	    assignSize(): void;
	    abstract renderSegs(segs: Seg[], sourceSeg?: any): HTMLElement[];
	    unrender(): void;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGridEventRenderer' {
	import { DateFormatter } from 'fullcalendar/src/datelib/formatting';
	import EventRenderer from 'fullcalendar/EventRenderer';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends EventRenderer {
	    timeGrid: any;
	    segsByCol: any;
	    fullTimeFormat: DateFormatter;
	    constructor(timeGrid: any, fillRenderer: any);
	    renderFgSegs(segs: Seg[]): void;
	    renderFgSegsIntoContainers(segs: Seg[], containerEls: any): void;
	    unrenderFgSegs(): void;
	    computeFgSize(): void;
	    assignFgSize(): void;
	    computeEventTimeFormat(): {
	        hour: string;
	        minute: string;
	        meridiem: boolean;
	    };
	    computeDisplayEventEnd(): boolean;
	    fgSegHtml(seg: Seg): string;
	    computeFgSegHorizontals(segs: Seg[]): void;
	    computeFgSegForwardBack(seg: Seg, seriesBackwardPressure: any, seriesBackwardCoord: any): void;
	    sortForwardSegs(forwardSegs: Seg[]): any[];
	    assignFgSegHorizontals(segs: Seg[]): void;
	    generateFgSegHorizontalCss(seg: Seg): any;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGridMirrorRenderer' {
	import MirrorRenderer from 'fullcalendar/MirrorRenderer';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends MirrorRenderer {
	    renderSegs(segs: Seg[], sourceSeg: any): any[];
	    computeSize(): void;
	    assignSize(): void;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGridFillRenderer' {
	import FillRenderer from 'fullcalendar/FillRenderer';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends FillRenderer {
	    attachSegEls(type: any, segs: Seg[]): HTMLElement[];
	    computeSize(type: any): void;
	    assignSize(type: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/OffsetTracker' {
	import { ElementScrollGeomCache } from 'fullcalendar/src/common/scroll-geom-cache';
	export class Default {
	    scrollCaches: ElementScrollGeomCache[];
	    origLeft: number;
	    origTop: number;
	    constructor(el: HTMLElement);
	    destroy(): void;
	    computeLeft(): number;
	    computeTop(): number;
	    isWithinClipping(pageX: number, pageY: number): boolean;
	}
	export default Default;
}
declare module 'fullcalendar/TimeGrid' {
	import { DayTableInterface } from 'fullcalendar/DayTableMixin';
	import PositionCache from 'fullcalendar/PositionCache';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { Duration } from 'fullcalendar/src/datelib/duration';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateFormatter } from 'fullcalendar/src/datelib/formatting';
	import DateComponent, { Seg } from 'fullcalendar/DateComponent';
	import OffsetTracker from 'fullcalendar/OffsetTracker';
	import { DateSpan } from 'fullcalendar/src/structs/date-span';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import { Hit } from 'fullcalendar/HitDragging';
	import { EventUiHash } from 'fullcalendar/src/component/event-rendering';
	export class Default extends DateComponent {
	    dayDates: DayTableInterface['dayDates'];
	    daysPerRow: DayTableInterface['daysPerRow'];
	    colCnt: DayTableInterface['colCnt'];
	    updateDayTable: DayTableInterface['updateDayTable'];
	    renderHeadHtml: DayTableInterface['renderHeadHtml'];
	    renderBgTrHtml: DayTableInterface['renderBgTrHtml'];
	    bookendCells: DayTableInterface['bookendCells'];
	    getCellDate: DayTableInterface['getCellDate'];
	    isInteractable: boolean;
	    doesDragMirror: boolean;
	    doesDragHighlight: boolean;
	    slicingType: 'timed';
	    view: any;
	    mirrorRenderer: any;
	    dayRanges: DateRange[];
	    slotDuration: Duration;
	    snapDuration: Duration;
	    snapsPerSlot: any;
	    labelFormat: DateFormatter;
	    labelInterval: Duration;
	    headContainerEl: HTMLElement;
	    colEls: HTMLElement[];
	    slatContainerEl: HTMLElement;
	    slatEls: HTMLElement[];
	    nowIndicatorEls: HTMLElement[];
	    colPositions: PositionCache;
	    slatPositions: PositionCache;
	    offsetTracker: OffsetTracker;
	    rootBgContainerEl: HTMLElement;
	    bottomRuleEl: HTMLElement;
	    contentSkeletonEl: HTMLElement;
	    colContainerEls: HTMLElement[];
	    fgContainerEls: HTMLElement[];
	    bgContainerEls: HTMLElement[];
	    mirrorContainerEls: HTMLElement[];
	    highlightContainerEls: HTMLElement[];
	    businessContainerEls: HTMLElement[];
	    constructor(view: any);
	    rangeToSegs(range: DateRange): Seg[];
	    sliceRangeByTimes(range: any): any[];
	    processOptions(): void;
	    computeLabelInterval(slotDuration: any): any;
	    renderDates(): void;
	    unrenderDates(): void;
	    renderSkeleton(): void;
	    renderSlats(): void;
	    renderSlatRowHtml(): string;
	    renderColumns(): void;
	    unrenderColumns(): void;
	    renderContentSkeleton(): void;
	    unrenderContentSkeleton(): void;
	    groupSegsByCol(segs: any): any[];
	    attachSegsByCol(segsByCol: any, containerEls: HTMLElement[]): void;
	    getNowIndicatorUnit(): string;
	    renderNowIndicator(date: any): void;
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
	    buildPositionCaches(): void;
	    prepareHits(): void;
	    releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit;
	    renderEventResize(eventStore: EventStore, eventUis: EventUiHash, origSeg: any): void;
	    unrenderEventResize(): void;
	    renderDateSelection(selection: DateSpan): void;
	    unrenderDateSelection(): void;
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
	    removeElement(): void;
	    position(): void;
	    trigger(name: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/DayGridEventRenderer' {
	import EventRenderer from 'fullcalendar/EventRenderer';
	import DayGrid from 'fullcalendar/DayGrid';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends EventRenderer {
	    dayGrid: DayGrid;
	    rowStructs: any;
	    constructor(dayGrid: any, fillRenderer: any);
	    renderBgSegs(segs: Seg[]): Seg[];
	    renderFgSegs(segs: Seg[]): void;
	    unrenderFgSegs(): void;
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
	    computeEventTimeFormat(): {
	        hour: string;
	        minute: string;
	        omitZeroMinute: boolean;
	        meridiem: string;
	    };
	    computeDisplayEventEnd(): boolean;
	    fgSegHtml(seg: Seg): string;
	}
	export default Default;
}
declare module 'fullcalendar/DayGridMirrorRenderer' {
	import MirrorRenderer from 'fullcalendar/MirrorRenderer';
	import DayGrid from 'fullcalendar/DayGrid';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends MirrorRenderer {
	    component: DayGrid;
	    renderSegs(segs: Seg[], sourceSeg: any): any[];
	}
	export default Default;
}
declare module 'fullcalendar/DayGridFillRenderer' {
	import FillRenderer from 'fullcalendar/FillRenderer';
	import DayGrid from 'fullcalendar/DayGrid';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends FillRenderer {
	    component: DayGrid;
	    fillSegTag: string;
	    attachSegEls(type: any, segs: Seg[]): any[];
	    renderFillRow(type: any, seg: Seg): HTMLElement;
	}
	export default Default;
}
declare module 'fullcalendar/DayTile' {
	import DateComponent, { Seg } from 'fullcalendar/DateComponent';
	import DayGridEventRenderer from 'fullcalendar/DayGridEventRenderer';
	import { Hit } from 'fullcalendar/HitDragging';
	import OffsetTracker from 'fullcalendar/OffsetTracker';
	export class Default extends DateComponent {
	    isInteractable: boolean;
	    useEventCenter: boolean;
	    date: Date;
	    segContainerEl: HTMLElement;
	    width: number;
	    height: number;
	    offsetTracker: OffsetTracker;
	    constructor(component: any, date: any);
	    renderSkeleton(): void;
	    prepareHits(): void;
	    releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit | null;
	}
	export class DayTileEventRenderer extends DayGridEventRenderer {
	    renderFgSegs(segs: Seg[]): void;
	}
	export default Default;
}
declare module 'fullcalendar/DayGrid' {
	import View from 'fullcalendar/View';
	import PositionCache from 'fullcalendar/PositionCache';
	import Popover from 'fullcalendar/Popover';
	import { DayTableInterface } from 'fullcalendar/DayTableMixin';
	import DateComponent, { Seg } from 'fullcalendar/DateComponent';
	import { EventStore } from 'fullcalendar/src/structs/event-store';
	import DayTile from 'fullcalendar/DayTile';
	import { Hit } from 'fullcalendar/HitDragging';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import OffsetTracker from 'fullcalendar/OffsetTracker';
	import { EventUiHash } from 'fullcalendar/src/component/event-rendering';
	export class Default extends DateComponent {
	    rowCnt: DayTableInterface['rowCnt'];
	    colCnt: DayTableInterface['colCnt'];
	    daysPerRow: DayTableInterface['daysPerRow'];
	    sliceRangeByRow: DayTableInterface['sliceRangeByRow'];
	    updateDayTable: DayTableInterface['updateDayTable'];
	    renderHeadHtml: DayTableInterface['renderHeadHtml'];
	    getCellDate: DayTableInterface['getCellDate'];
	    renderBgTrHtml: DayTableInterface['renderBgTrHtml'];
	    renderIntroHtml: DayTableInterface['renderIntroHtml'];
	    getCellRange: DayTableInterface['getCellRange'];
	    sliceRangeByDay: DayTableInterface['sliceRangeByDay'];
	    bookendCells: DayTableInterface['bookendCells'];
	    breakOnWeeks: DayTableInterface['breakOnWeeks'];
	    isInteractable: boolean;
	    doesDragMirror: boolean;
	    doesDragHighlight: boolean;
	    slicingType: 'all-day';
	    view: View;
	    mirrorRenderer: any;
	    cellWeekNumbersVisible: boolean;
	    bottomCoordPadding: number;
	    headContainerEl: HTMLElement;
	    rowEls: HTMLElement[];
	    cellEls: HTMLElement[];
	    rowPositions: PositionCache;
	    colPositions: PositionCache;
	    offsetTracker: OffsetTracker;
	    isRigid: boolean;
	    segPopover: Popover;
	    segPopoverTile: DayTile;
	    constructor(view: any);
	    rangeToSegs(range: DateRange): Seg[];
	    renderDates(): void;
	    unrenderDates(): void;
	    renderGrid(): void;
	    renderDayRowHtml(row: any, isRigid: any): string;
	    getIsNumbersVisible(): boolean;
	    getIsDayNumbersVisible(): boolean;
	    renderNumberTrHtml(row: any): string;
	    renderNumberIntroHtml(row: any): any;
	    renderNumberCellsHtml(row: any): string;
	    renderNumberCellHtml(date: any): string;
	    buildPositionCaches(): void;
	    prepareHits(): void;
	    releaseHits(): void;
	    queryHit(leftOffset: any, topOffset: any): Hit;
	    getCellEl(row: any, col: any): HTMLElement;
	    unrenderEvents(): void;
	    getAllEventSegs(): Seg[];
	    renderEventResize(eventStore: EventStore, eventUis: EventUiHash, origSeg: any): void;
	    unrenderEventResize(): void;
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
declare module 'fullcalendar/AgendaView' {
	import ScrollComponent from 'fullcalendar/ScrollComponent';
	import View from 'fullcalendar/View';
	import TimeGrid from 'fullcalendar/TimeGrid';
	import DayGrid from 'fullcalendar/DayGrid';
	import { RenderForceFlags } from 'fullcalendar/Component';
	import { DateComponentRenderState } from 'fullcalendar/DateComponent';
	export class Default extends View {
	    timeGridClass: any;
	    dayGridClass: any;
	    timeGrid: TimeGrid;
	    dayGrid: DayGrid;
	    scroller: ScrollComponent;
	    axisWidth: any;
	    usesMinMaxTime: boolean;
	    filterEventsForTimeGrid: any;
	    filterEventsForDayGrid: any;
	    buildEventDragForTimeGrid: any;
	    buildEventDragForDayGrid: any;
	    buildEventResizeForTimeGrid: any;
	    buildEventResizeForDayGrid: any;
	    constructor(calendar: any, viewSpec: any);
	    instantiateTimeGrid(): any;
	    instantiateDayGrid(): any;
	    renderSkeleton(): void;
	    unrenderSkeleton(): void;
	    renderSkeletonHtml(): string;
	    axisStyleAttr(): string;
	    renderChildren(renderState: DateComponentRenderState, forceFlags: RenderForceFlags): void;
	    getNowIndicatorUnit(): string;
	    updateBaseSize(totalHeight: any, isAuto: any): void;
	    computeScrollerHeight(totalHeight: any): number;
	    computeInitialDateScroll(): {
	        top: any;
	    };
	    queryDateScroll(): {
	        top: number;
	    };
	    applyDateScroll(scroll: any): void;
	}
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
declare module 'fullcalendar/BasicView' {
	import ScrollComponent from 'fullcalendar/ScrollComponent';
	import View from 'fullcalendar/View';
	import DayGrid from 'fullcalendar/DayGrid';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export class Default extends View {
	    dateProfileGeneratorClass: any;
	    dayGridClass: any;
	    scroller: ScrollComponent;
	    dayGrid: DayGrid;
	    colWeekNumbersVisible: boolean;
	    weekNumberWidth: any;
	    constructor(calendar: any, viewSpec: any);
	    instantiateDayGrid(): any;
	    renderDates(dateProfile: DateProfile): void;
	    renderSkeleton(): void;
	    unrenderSkeleton(): void;
	    renderSkeletonHtml(): string;
	    weekNumberStyleAttr(): string;
	    hasRigidRows(): boolean;
	    updateBaseSize(totalHeight: any, isAuto: any): void;
	    computeScrollerHeight(totalHeight: any): number;
	    setGridHeight(height: any, isAuto: any): void;
	    computeInitialDateScroll(): {
	        top: number;
	    };
	    queryDateScroll(): {
	        top: number;
	    };
	    applyDateScroll(scroll: any): void;
	}
	export default Default;
}
declare module 'fullcalendar/MonthViewDateProfileGenerator' {
	import BasicViewDateProfileGenerator from 'fullcalendar/BasicViewDateProfileGenerator';
	export class Default extends BasicViewDateProfileGenerator {
	    buildRenderRange(currentRange: any, currentRangeUnit: any, isRangeAllDay: any): {
	        start: Date;
	        end: Date;
	    };
	}
	export default Default;
}
declare module 'fullcalendar/MonthView' {
	import BasicView from 'fullcalendar/BasicView';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	export class Default extends BasicView {
	    setGridHeight(height: any, isAuto: any): void;
	    isDateInOtherMonth(date: DateMarker, dateProfile: any): boolean;
	}
	export default Default;
}
declare module 'fullcalendar/ListEventRenderer' {
	import EventRenderer from 'fullcalendar/EventRenderer';
	import ListView from 'fullcalendar/ListView';
	import { Seg } from 'fullcalendar/DateComponent';
	export class Default extends EventRenderer {
	    component: ListView;
	    renderFgSegs(segs: Seg[]): void;
	    fgSegHtml(seg: Seg): string;
	    computeEventTimeFormat(): {
	        hour: string;
	        minute: string;
	        meridiem: string;
	    };
	}
	export default Default;
}
declare module 'fullcalendar/ListView' {
	import View from 'fullcalendar/View';
	import ScrollComponent from 'fullcalendar/ScrollComponent';
	import { DateMarker } from 'fullcalendar/src/datelib/marker';
	import { DateRange } from 'fullcalendar/src/datelib/date-range';
	import { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export class Default extends View {
	    eventRendererClass: any;
	    isInteractable: boolean;
	    slicingType: 'all-day';
	    fgSegSelector: any;
	    scroller: ScrollComponent;
	    contentEl: HTMLElement;
	    dayDates: DateMarker[];
	    dayRanges: DateRange[];
	    constructor(calendar: any, viewSpec: any);
	    renderSkeleton(): void;
	    unrenderSkeleton(): void;
	    updateBaseSize(totalHeight: any, isAuto: any): void;
	    computeScrollerHeight(totalHeight: any): number;
	    renderDates(dateProfile: DateProfile): void;
	    rangeToSegs(range: DateRange, allDay: boolean): any[];
	    renderEmptyMessage(): void;
	    renderSegList(allSegs: any): void;
	    groupSegsByDay(segs: any): any[];
	    buildDayHeaderRow(dayDate: any): HTMLTableRowElement;
	}
	export default Default;
}
declare module 'fullcalendar/src/structs/drag-meta' {
	import { Duration, DurationInput } from 'fullcalendar/src/datelib/duration';
	import { EventNonDateInput } from 'fullcalendar/src/structs/event';
	export interface DragMetaInput extends EventNonDateInput {
	    time?: DurationInput;
	    duration?: DurationInput;
	    create?: boolean;
	    sourceId?: string;
	}
	export interface DragMeta {
	    time: Duration | null;
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
	import Calendar from 'fullcalendar/Calendar';
	import { EventInteractionState } from 'fullcalendar/src/interactions/event-interaction-state';
	import { DragMetaInput, DragMeta } from 'fullcalendar/src/structs/drag-meta';
	export type DragMetaGenerator = DragMetaInput | ((el: HTMLElement) => DragMetaInput);
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
	export { EventInput, EventDef } from 'fullcalendar/src/structs/event';
	export { BusinessHoursInput } from 'fullcalendar/src/structs/business-hours';
	export { applyAll, debounce, padStart, isInt, capitaliseFirstLetter, parseFieldSpecs, compareByFieldSpecs, compareByFieldSpec, flexibleCompare, log, warn } from 'fullcalendar/src/util/misc';
	export { htmlEscape, cssToStr } from 'fullcalendar/src/util/html';
	export { removeExact } from 'fullcalendar/src/util/array';
	export { intersectRects } from 'fullcalendar/src/util/geom';
	export { assignTo } from 'fullcalendar/src/util/object';
	export { findElements, findChildren, htmlToElement, createElement, insertAfterElement, prependToElement, removeElement, appendToElement, applyStyle, applyStyleProp, elementMatches, forceClassName } from 'fullcalendar/src/util/dom-manip';
	export { preventDefault, listenBySelector, whenTransitionDone } from 'fullcalendar/src/util/dom-event';
	export { computeInnerRect, computeEdges, computeHeightAndMargins } from 'fullcalendar/src/util/dom-geom';
	export { default as EmitterMixin, EmitterInterface } from 'fullcalendar/EmitterMixin';
	export { DateRange, rangeContainsMarker, intersectRanges } from 'fullcalendar/src/datelib/date-range';
	export { defineThemeSystem } from 'fullcalendar/ThemeRegistry';
	export { default as Mixin } from 'fullcalendar/Mixin';
	export { default as PositionCache } from 'fullcalendar/PositionCache';
	export { default as ScrollComponent } from 'fullcalendar/ScrollComponent';
	export { default as Theme } from 'fullcalendar/Theme';
	export { default as DateComponent } from 'fullcalendar/DateComponent';
	export { default as Calendar } from 'fullcalendar/Calendar';
	export { default as View } from 'fullcalendar/View';
	export { defineView, getViewConfig } from 'fullcalendar/ViewRegistry';
	export { default as DayTableMixin } from 'fullcalendar/DayTableMixin';
	export { default as EventRenderer } from 'fullcalendar/EventRenderer';
	export { default as FillRenderer } from 'fullcalendar/FillRenderer';
	export { default as MirrorRenderer } from 'fullcalendar/MirrorRenderer';
	export { default as AgendaView } from 'fullcalendar/AgendaView';
	export { default as TimeGrid } from 'fullcalendar/TimeGrid';
	export { default as DayGrid } from 'fullcalendar/DayGrid';
	export { default as BasicView } from 'fullcalendar/BasicView';
	export { default as MonthView } from 'fullcalendar/MonthView';
	export { default as ListView } from 'fullcalendar/ListView';
	export { DateProfile } from 'fullcalendar/DateProfileGenerator';
	export { DateMarker, addDays, startOfDay, addMs, diffWholeWeeks, diffWholeDays, diffDayAndTime } from 'fullcalendar/src/datelib/marker';
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
	export { formatDate, formatRange } from 'fullcalendar/src/formatting-api';
	export { globalDefaults } from 'fullcalendar/src/options';
	export { registerRecurringType, ParsedRecurring } from 'fullcalendar/src/structs/recurring-event';
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
declare module 'fullcalendar/src/basic/config' {
	export {};
}
declare module 'fullcalendar/src/agenda/config' {
	export {};
}
declare module 'fullcalendar/src/list/config' {
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
declare module 'fullcalendar/src/main' {
	import * as exportHooks from 'fullcalendar/src/exports';
	import 'fullcalendar/src/theme/config';
	import 'fullcalendar/src/basic/config';
	import 'fullcalendar/src/agenda/config';
	import 'fullcalendar/src/list/config';
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
