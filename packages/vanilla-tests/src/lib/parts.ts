import { PluginInput } from 'fullcalendar'

/*
TESTS ONLY. Marks each element a `*Class` option styles with a `test-part-<name>` class, where <name> is
the option name without `Class` (dayCellClass -> test-part-dayCell). The calendar root gets
test-part-root, from the `class` option. Tests find elements by these parts, through the helpers below.

Core joins a class option's values from every plugin and from the calendar's options, so the marker is
added to the theme's classes and a test's own, never replacing them.

The lists are kept by hand: a new `*Class` option gets no marker until its name is added here.
*/

const PART_CLASS_PREFIX = 'test-part-'

// the `*Class` options in standard/packages/preact/src/options.ts, without `Class`
const STANDARD_PART_NAMES = [
  'allDayDivider', 'allDayHeader', 'allDayHeaderInner',
  'backgroundEvent', 'backgroundEventInner', 'backgroundEventTitle',
  'blockEvent', 'blockEventAfter', 'blockEventBefore', 'blockEventInner', 'blockEventTime', 'blockEventTitle',
  'button', 'buttonGroup',
  'columnEvent', 'columnEventAfter', 'columnEventBefore', 'columnEventInner', 'columnEventTime', 'columnEventTitle',
  'columnMoreLink', 'columnMoreLinkInner',
  'dayCell', 'dayCellBottom', 'dayCellInner', 'dayCellTop', 'dayCellTopInner',
  'dayHeader', 'dayHeaderDivider', 'dayHeaderInner', 'dayHeaderRow',
  'dayLane', 'dayLaneInner', 'dayRow',
  'event', 'eventAfter', 'eventBefore', 'eventInner', 'eventTime', 'eventTitle',
  'filler', 'footerToolbar', 'headerToolbar', 'highlight', 'inlineWeekNumber',
  'listDay', 'listDayBody', 'listDayHeader', 'listDayHeaderInner', 'listDays',
  'listItemEvent', 'listItemEventAfter', 'listItemEventBefore', 'listItemEventInner', 'listItemEventTime',
  'listItemEventTitle',
  'moreLink', 'moreLinkInner', 'navLink', 'noEvents', 'noEventsInner', 'nonBusinessHours',
  'nowIndicatorDot', 'nowIndicatorHeader', 'nowIndicatorLine',
  'popover', 'popoverClose',
  'rowEvent', 'rowEventAfter', 'rowEventBefore', 'rowEventInner', 'rowEventTime', 'rowEventTitle',
  'rowMoreLink', 'rowMoreLinkInner',
  'singleMonth', 'singleMonthHeader', 'singleMonthHeaderInner',
  'slotHeader', 'slotHeaderDivider', 'slotHeaderInner', 'slotHeaderRow', 'slotLane',
  'table', 'tableBody', 'tableHeader',
  'toolbar', 'toolbarSection', 'toolbarTitle',
  'view', 'weekNumberHeader', 'weekNumberHeaderInner',
]

// the `*Class` options in premium/packages/preact-scheduler/src/common/options.ts, without `Class`
export const SCHEDULER_PART_NAMES = [
  'resourceCell', 'resourceCellInner', 'resourceColumnDivider', 'resourceColumnHeader',
  'resourceColumnHeaderInner', 'resourceColumnResizer', 'resourceDayHeader', 'resourceDayHeaderInner',
  'resourceExpander', 'resourceGroupHeader', 'resourceGroupHeaderInner', 'resourceGroupLane',
  'resourceGroupLaneInner', 'resourceHeaderRow', 'resourceIndent', 'resourceLane', 'resourceLaneBottom',
  'resourceLaneTop', 'resourceRow', 'timelineBottom', 'timelineTop',
]

/*
A plugin whose option defaults put each part's marker class on its `*Class` option.
*/
export function createPartsPlugin(name: string, partNames: string[]): PluginInput {
  const optionDefaults: Record<string, string> = {}

  for (const partName of partNames) {
    optionDefaults[partName + 'Class'] = PART_CLASS_PREFIX + partName
  }

  return { name, optionDefaults }
}

export const standardPartsPlugin = createPartsPlugin('test-parts', STANDARD_PART_NAMES)
standardPartsPlugin.optionDefaults!.class = PART_CLASS_PREFIX + 'root' // the root has no `rootClass`

/*
A CSS selector for elements of the part.
*/
export function partSelector(part: string): string {
  return '.' + PART_CLASS_PREFIX + part
}

export function hasPart(el: Element, part: string): boolean {
  return el.classList.contains(PART_CLASS_PREFIX + part)
}

/*
The element's parts, in class order.
*/
export function getParts(el: Element): string[] {
  return Array.from(el.classList)
    .filter((className) => className.startsWith(PART_CLASS_PREFIX))
    .map((className) => className.slice(PART_CLASS_PREFIX.length))
}
