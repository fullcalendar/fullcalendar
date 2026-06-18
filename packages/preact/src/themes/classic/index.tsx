import { PluginInput } from '../../plugin-system-struct'
import { type CalendarOptions } from '../../options'
import { joinClassNames } from '../../util/html'

// will get stripped during tsc transpile
import {} from '../scheduler-types-hack'

// usually 11px font / 12px line-height
const xxsTextClass = 'text-[0.6875rem]/[1.090909]'

// outline
const outlineWidthClass = 'outline-2'
const outlineWidthFocusClass = 'focus-visible:outline-2'
const outlineOffsetClass = 'outline-offset-2'
const outlineInsetClass = '-outline-offset-2'
const primaryOutlineColorClass = 'outline-(--fc-classic-primary)'

// neutral buttons
const strongSolidPressableClass = '[background:linear-gradient(var(--fc-classic-strong),var(--fc-classic-strong))_var(--fc-classic-background)]'
const mutedHoverClass = 'hover:bg-(--fc-classic-muted)'
const mutedHoverPressableClass = `${mutedHoverClass} focus-visible:bg-(--fc-classic-muted) active:bg-(--fc-classic-strong)`
const faintHoverClass = 'hover:bg-(--fc-classic-faint)'
const faintHoverPressableClass = `${faintHoverClass} focus-visible:bg-(--fc-classic-faint) active:bg-(--fc-classic-muted)`

const buttonIconClass = 'size-5'

// transparent resizer for mouse
const blockPointerResizerClass = 'absolute hidden group-hover:block'
const rowPointerResizerClass = `${blockPointerResizerClass} inset-y-0 w-2`
const columnPointerResizerClass = `${blockPointerResizerClass} inset-x-0 h-2`

// circle resizer for touch
const blockTouchResizerClass = 'absolute size-2 border border-(--fc-event-color) bg-(--fc-classic-background) rounded-full'
const rowTouchResizerClass = `${blockTouchResizerClass} top-1/2 -mt-1`
const columnTouchResizerClass = `${blockTouchResizerClass} left-1/2 -ml-1`

const getDayClass = (info: { isMajor: boolean, isToday: boolean, isDisabled: boolean}) => joinClassNames(
  'border',
  info.isMajor ? 'border-(--fc-classic-strong-border)' : 'border-(--fc-classic-border)',
  info.isDisabled ? 'bg-(--fc-classic-faint)' :
    info.isToday && 'not-print:bg-(--fc-classic-today)',
)

const getSlotClass = (info: { isMinor: boolean }) => joinClassNames(
  'border border-(--fc-classic-border)',
  info.isMinor && 'border-dotted',
)

const dayRowCommonClasses: CalendarOptions = {

  /* Day Row > List-Item Event
  ----------------------------------------------------------------------------------------------- */

  listItemEventClass: (info) => joinClassNames(
    'mb-px p-px rounded-sm',
    info.isNarrow ? 'mx-px' : 'mx-0.5',
    info.isSelected
      ? joinClassNames('bg-(--fc-classic-muted)', info.isDragging && 'shadow-sm')
      : (info.isInteractive ? mutedHoverPressableClass : mutedHoverClass),
  ),

  listItemEventBeforeClass: (info) => joinClassNames(
    'border-[calc(var(--fc-classic-small-dot-width)/2)]',
    info.isNarrow ? 'mx-px' : 'mx-1',
  ),

  listItemEventInnerClass: (info) => joinClassNames(
    'flex flex-row items-center py-px gap-0.5',
    info.isNarrow ? xxsTextClass : 'text-xs',
  ),

  listItemEventTimeClass: 'px-px whitespace-nowrap overflow-hidden shrink-1',
  listItemEventTitleClass: 'px-px font-bold whitespace-nowrap overflow-hidden shrink-100',

  /* Day Row > Row Event
  ----------------------------------------------------------------------------------------------- */

  rowEventClass: (info) => joinClassNames(
    info.isStart && joinClassNames('rounded-s-sm', info.isNarrow ? 'ms-px' : 'ms-0.5'),
    info.isEnd && joinClassNames('rounded-e-sm', info.isNarrow ? 'me-px' : 'me-0.5'),
  ),

  rowEventInnerClass: 'py-px gap-0.5',
  rowEventTimeClass: 'px-px',
  rowEventTitleClass: 'px-px',

  /* Day Row > More-Link
  ----------------------------------------------------------------------------------------------- */

  rowMoreLinkClass: (info) => joinClassNames(
    'mb-px border rounded-sm',
    info.isNarrow
      ? 'mx-px border-(--fc-classic-primary)'
      : 'self-start mx-0.5 border-transparent',
    mutedHoverPressableClass,
  ),

  rowMoreLinkInnerClass: (info) => joinClassNames(
    'p-px',
    info.isNarrow ? xxsTextClass : 'text-xs',
  ),
}

const expanderIconClass = 'size-4 not-group-hover:opacity-65'
const continuationArrowClass = 'mx-1 border-y-[5px] border-y-transparent opacity-50'

export default {
  name: 'theme-classic',
  optionDefaults: {
    className: "gap-5 root-reset",
    viewClass: (info) => {
      const hasBorderTop = info.options.headerToolbar || !info.borderlessTop
      const hasBorderBottom = info.options.footerToolbar || !info.borderlessBottom
      const hasBorderX = !info.borderlessX
      return joinClassNames(
        'bg-(--fc-classic-background) text-(--fc-classic-foreground) border-(--fc-classic-border)',
        hasBorderTop && 'border-t',
        hasBorderBottom && 'border-b',
        hasBorderX && 'border-x',
      )
    },

    /* Toolbar
    --------------------------------------------------------------------------------------------- */

    toolbarClass: (info) => joinClassNames(
      'flex flex-row flex-wrap items-center justify-between gap-3',
      info.borderlessX && 'px-3',
    ),
    toolbarSectionClass: "shrink-0 flex flex-row items-center gap-3",
    toolbarTitleClass: "text-2xl font-bold",
    buttonGroupClass: "flex flex-row items-center",
    buttonClass: (info) => joinClassNames(
      'py-2 border-x flex flex-row items-center focus-visible:outline-3 outline-(--fc-classic-button-outline) print:bg-white text-sm text-(--fc-classic-button-foreground) print:text-black button-reset',
      info.isIconOnly ? 'px-2.5' : 'px-3',
      info.buttonGroup
        ? 'first:rounded-s-[4px] last:rounded-e-[4px]'
        : 'rounded-[4px]',
      info.isSelected
        ? 'border-(--fc-classic-button-strong-border) bg-(--fc-classic-button-strong)'
        : 'border-(--fc-classic-button-border) hover:border-(--fc-classic-button-strong-border) active:border-(--fc-classic-button-strong-border) print:border-(--fc-classic-button-strong-border) bg-(--fc-classic-button) hover:bg-(--fc-classic-button-strong) active:bg-(--fc-classic-button-strong)',
      info.isDisabled && 'opacity-65 pointer-events-none',
    ),
    buttons: {
      prev: {
        iconContent: () => chevronLeft(`${buttonIconClass} [[dir=rtl]_&]:rotate-180`),
      },
      next: {
        iconContent: () => chevronLeft(`${buttonIconClass} rotate-180 [[dir=rtl]_&]:rotate-0`),
      },
      prevYear: {
        iconContent: () => chevronsLeft(`${buttonIconClass} [[dir=rtl]_&]:rotate-180`),
      },
      nextYear: {
        iconContent: () => chevronsLeft(`${buttonIconClass} rotate-180 [[dir=rtl]_&]:rotate-0`),
      },
    },

    /* Abstract Event
    --------------------------------------------------------------------------------------------- */

    eventColor: "var(--fc-classic-event)",
    eventContrastColor: "var(--fc-classic-event-contrast)",
    eventClass: (info) => joinClassNames(
      info.isDragging && 'root-reset',
      info.event.url && 'link-reset',
      info.isSelected
        ? joinClassNames(
            outlineWidthClass,
            info.isDragging ? 'shadow-lg' : 'shadow-md',
          )
        : outlineWidthFocusClass,
      primaryOutlineColorClass,
    ),

    /* Background Event
    --------------------------------------------------------------------------------------------- */

    backgroundEventColor: "var(--fc-classic-background-event)",
    backgroundEventClass: "not-print:bg-[color-mix(in_oklab,var(--fc-event-color)_var(--fc-classic-background-event-opacity),transparent)] print:border-1 print:border-(--fc-event-color)",
    backgroundEventTitleClass: (info) => joinClassNames(
      'opacity-(--fc-classic-background-event-foreground-opacity) italic',
      info.isNarrow
        ? `p-0.5 ${xxsTextClass}`
        : 'p-1.5 text-xs',
    ),

    /* List-Item Event
    --------------------------------------------------------------------------------------------- */

    listItemEventClass: "items-center",
    listItemEventBeforeClass: "border-(--fc-event-color) rounded-full",
    listItemEventInnerClass: "text-(--fc-classic-foreground)",

    /* Block Event
    --------------------------------------------------------------------------------------------- */

    blockEventClass: (info) => joinClassNames(
      'group relative border-transparent print:border-(--fc-event-color) bg-(--fc-event-color) print:bg-white',
      (info.isDragging && !info.isSelected) && 'opacity-75',
      outlineOffsetClass,
    ),
    blockEventInnerClass: "text-(--fc-event-contrast-color) print:text-black",
    blockEventTimeClass: "whitespace-nowrap overflow-hidden shrink-1",
    blockEventTitleClass: "whitespace-nowrap overflow-hidden shrink-100",

    /* Row Event
    --------------------------------------------------------------------------------------------- */

    rowEventClass: (info) => joinClassNames(
      'mb-px border-y',
      info.isStart && 'border-s',
      info.isEnd && 'border-e',
    ),
    rowEventBeforeClass: (info) => joinClassNames(
      info.isStartResizable && joinClassNames(
        info.isSelected ? rowTouchResizerClass : rowPointerResizerClass,
        '-start-1',
      )
    ),
    rowEventAfterClass: (info) => joinClassNames(
      info.isEndResizable && joinClassNames(
        info.isSelected ? rowTouchResizerClass : rowPointerResizerClass,
        '-end-1',
      )
    ),
    rowEventInnerClass: (info) => joinClassNames(
      'flex flex-row items-center',
      info.isNarrow ? xxsTextClass : 'text-xs',
    ),
    rowEventTimeClass: "font-bold",

    /* Column Event
    --------------------------------------------------------------------------------------------- */

    columnEventClass: (info) => joinClassNames(
      'border-x ring ring-(--fc-classic-background)',
      info.isStart && 'border-t rounded-t-sm',
      info.isEnd && 'mb-px border-b rounded-b-sm',
    ),
    columnEventBeforeClass: (info) => joinClassNames(
      info.isStartResizable && joinClassNames(
        info.isSelected ? columnTouchResizerClass : columnPointerResizerClass,
        '-top-1',
      )
    ),
    columnEventAfterClass: (info) => joinClassNames(
      info.isEndResizable && joinClassNames(
        info.isSelected ? columnTouchResizerClass : columnPointerResizerClass,
        '-bottom-1',
      )
    ),
    columnEventInnerClass: (info) => joinClassNames(
      'flex',
      info.isShort
        ? 'p-0.5 flex-row items-center gap-1'
        : 'px-0.5 flex-col',
    ),
    columnEventTimeClass: (info) => joinClassNames(
      !info.isShort && 'pt-0.5',
      xxsTextClass,
    ),
    columnEventTitleClass: (info) => joinClassNames(
      !info.isShort &&  'py-0.5',
      (info.isShort || info.isNarrow) ? xxsTextClass : 'text-xs',
    ),

    /* More-Link
    --------------------------------------------------------------------------------------------- */

    moreLinkClass: `${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    moreLinkInnerClass: "whitespace-nowrap overflow-hidden",
    columnMoreLinkClass: `mb-px rounded-sm border border-transparent print:border-black ${strongSolidPressableClass} print:bg-white ring ring-(--fc-classic-background) ${outlineOffsetClass}`,
    columnMoreLinkInnerClass: (info) => joinClassNames(
      'p-0.5',
      info.isNarrow ? xxsTextClass : 'text-xs',
    ),

    /* Day Header
    --------------------------------------------------------------------------------------------- */

    dayHeaderAlign: (info) => info.inPopover ? 'start' : 'center',
    dayHeaderClass: (info) => joinClassNames(
      'justify-center',
      info.isDisabled && 'bg-(--fc-classic-faint)',
      info.inPopover
        ? 'border-b border-(--fc-classic-border) bg-(--fc-classic-muted)'
        : joinClassNames(
            'border',
            info.isMajor ? 'border-(--fc-classic-strong-border)' : 'border-(--fc-classic-border)',
          ),
    ),
    dayHeaderInnerClass: (info) => joinClassNames(
      'mx-1 my-0.5 flex flex-col',
      info.isNarrow ? xxsTextClass : 'text-sm',
    ),
    dayHeaderDividerClass: "border-b border-(--fc-classic-border)",

    /* Day Cell
    --------------------------------------------------------------------------------------------- */

    dayCellClass: getDayClass,
    dayCellTopClass: (info) => joinClassNames(
      info.isNarrow ? 'min-h-px' : 'min-h-0.5',
      'flex flex-row justify-end',
    ),
    dayCellTopInnerClass: (info) => joinClassNames(
      'mx-1 whitespace-nowrap',
      info.isNarrow
        ? `my-0.5 ${xxsTextClass}`
        : 'my-1 text-sm',
      info.isOther && 'text-(--fc-classic-faint-foreground)',
      info.monthText && 'font-bold',
    ),
    dayCellInnerClass: (info) => joinClassNames(info.inPopover && 'p-2'),

    /* Popover
    --------------------------------------------------------------------------------------------- */

    popoverClass: "bg-(--fc-classic-background) text-(--fc-classic-foreground) border border-(--fc-classic-border) shadow-md min-w-55 root-reset",
    popoverCloseClass: `group absolute top-0.5 end-0.5 ${outlineWidthFocusClass} ${primaryOutlineColorClass} button-reset`,
    popoverCloseContent: () => x('size-5 text-sm not-group-hover:opacity-65'),

    /* Lane
    --------------------------------------------------------------------------------------------- */

    dayLaneClass: getDayClass,
    dayLaneInnerClass: (info) => (
      info.isStack
        ? 'm-1'
        : info.isNarrow ? 'mx-px' : 'ms-0.5 me-[2.5%]'
    ),
    slotLaneClass: getSlotClass,

    /* List Day
    --------------------------------------------------------------------------------------------- */

    listDayHeaderClass: "border-b border-(--fc-classic-border) [background:linear-gradient(var(--fc-classic-muted),var(--fc-classic-muted))_var(--fc-classic-background)] -mb-px flex flex-row items-center justify-between",
    listDayHeaderInnerClass: "px-3 py-2 text-sm font-bold",

    /* Single Month (in Multi-Month)
    --------------------------------------------------------------------------------------------- */

    singleMonthClass: (info) => joinClassNames(
      info.multiMonthColumns > 1 && 'm-4',
      (info.multiMonthColumns === 1 && !info.isLast) && 'border-b border-(--fc-classic-border)',
    ),
    singleMonthHeaderClass: (info) => joinClassNames(
      info.multiMonthColumns > 1
        ? 'pb-4'
        : 'py-2 border-b border-(--fc-classic-border) bg-(--fc-classic-background)',
      'items-center',
    ),
    singleMonthHeaderInnerClass: "text-base font-bold",

    /* Misc Table
    --------------------------------------------------------------------------------------------- */

    tableHeaderClass: 'bg-(--fc-classic-background)',
    fillerClass: "border border-(--fc-classic-border) opacity-50",
    dayHeaderRowClass: "border border-(--fc-classic-border)",
    dayRowClass: "border border-(--fc-classic-border)",
    slotHeaderRowClass: "border border-(--fc-classic-border)",
    slotHeaderClass: getSlotClass,

    /* Misc Content
    --------------------------------------------------------------------------------------------- */

    navLinkClass: `hover:underline ${outlineWidthFocusClass} ${outlineInsetClass} ${primaryOutlineColorClass}`,
    inlineWeekNumberClass: (info) => joinClassNames(
      'absolute top-0 start-0 rounded-ee-sm p-0.5 text-center text-(--fc-classic-muted-foreground) bg-(--fc-classic-muted)',
      info.isNarrow ? xxsTextClass : 'text-sm',
    ),
    nonBusinessHoursClass: "bg-(--fc-classic-faint)",
    highlightClass: "bg-(--fc-classic-highlight)",

    /* Resource Day Header
    --------------------------------------------------------------------------------------------- */

    resourceDayHeaderAlign: "center",
    resourceDayHeaderClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-classic-strong-border)' : 'border-(--fc-classic-border)',
    ),
    resourceDayHeaderInnerClass: (info) => joinClassNames(
      'mx-1 my-0.5 flex flex-col',
      info.isNarrow ? xxsTextClass : 'text-sm',
    ),

    /* Resource Data Grid
    --------------------------------------------------------------------------------------------- */

    resourceColumnHeaderClass: "border border-(--fc-classic-border) justify-center",
    resourceColumnHeaderInnerClass: "m-2 text-sm",
    resourceColumnResizerClass: "absolute inset-y-0 w-[5px] end-[-3px]",
    resourceGroupHeaderClass: "border border-(--fc-classic-border) bg-(--fc-classic-muted)",
    resourceGroupHeaderInnerClass: "m-2 text-sm",
    resourceCellClass: "border border-(--fc-classic-border)",
    resourceCellInnerClass: "m-2 text-sm",
    resourceIndentClass: "ms-2 -me-1 justify-center",
    resourceExpanderClass: `group ${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    resourceExpanderContent: (info) => info.isExpanded
      ? minusSquare(expanderIconClass)
      : plusSquare(expanderIconClass),
    resourceHeaderRowClass: "border border-(--fc-classic-border)",
    resourceRowClass: "border border-(--fc-classic-border)",
    resourceColumnDividerClass: "border-x border-(--fc-classic-border) ps-0.5 bg-(--fc-classic-muted)",

    /* Timeline Lane
    --------------------------------------------------------------------------------------------- */

    resourceGroupLaneClass: "border border-(--fc-classic-border) bg-(--fc-classic-muted)",
    resourceLaneClass: "border border-(--fc-classic-border)",
    resourceLaneBottomClass: (info) => info.options.eventOverlap && 'h-3',
    timelineBottomClass: "h-3",
  },
  views: {
    dayGrid: {
      ...dayRowCommonClasses,
      dayCellBottomClass: 'min-h-px',
    },
    multiMonth: {
      ...dayRowCommonClasses,
      dayCellBottomClass: 'min-h-px',
      tableClass: (info) => joinClassNames(
        info.multiMonthColumns > 1 && 'border-(--fc-classic-border) border',
      ),
    },
    timeGrid: {
      ...dayRowCommonClasses,
      dayCellBottomClass: 'min-h-3',

      /* TimeGrid > Week Number Header
      ------------------------------------------------------------------------------------------- */

      weekNumberHeaderClass: 'items-center justify-end',
      weekNumberHeaderInnerClass: (info) => joinClassNames(
        'mx-1 my-0.5',
        info.isNarrow ? xxsTextClass : 'text-sm',
      ),

      /* TimeGrid > All-Day Header
      ------------------------------------------------------------------------------------------- */

      allDayHeaderClass: 'items-center justify-end',
      allDayHeaderInnerClass: (info) => joinClassNames(
        'mx-1 my-2 text-end',
        info.isNarrow ? xxsTextClass : 'text-sm',
      ),
      allDayDividerClass: 'border-y border-(--fc-classic-border) pb-0.5 bg-(--fc-classic-muted)',

      /* TimeGrid > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderClass: 'justify-end',
      slotHeaderInnerClass: (info) => joinClassNames(
        'mx-1 my-0.5',
        info.isNarrow ? xxsTextClass : 'text-sm',
      ),
      slotHeaderDividerClass: 'border-e border-(--fc-classic-border)',

      /* TimeGrid > Now-Indicator
      ------------------------------------------------------------------------------------------- */

      nowIndicatorHeaderClass: 'start-0 -mt-[5px] border-y-[5px] border-y-transparent border-s-[6px] border-s-(--fc-classic-now)',
      nowIndicatorLineClass: 'border-t border-(--fc-classic-now)',
    },
    list: {

      /* List-View > List-Item Event
      ------------------------------------------------------------------------------------------- */

      listDayClass: (info) => joinClassNames(
        !info.isLast && 'border-b border-(--fc-classic-border)',
      ),
      listItemEventClass: (info) => joinClassNames(
        'group px-3 py-2 gap-3 border-t border-(--fc-classic-border)',
        info.isInteractive
          ? joinClassNames(faintHoverPressableClass, outlineInsetClass)
          : faintHoverClass,
      ),
      listItemEventBeforeClass: 'border-[calc(var(--fc-classic-large-dot-width)/2)]',
      listItemEventInnerClass: '[display:contents]',
      listItemEventTimeClass: '-order-1 shrink-0 w-1/2 max-w-50 whitespace-nowrap overflow-hidden text-ellipsis text-sm',
      listItemEventTitleClass: (info) => joinClassNames(
        'grow min-w-0 whitespace-nowrap overflow-hidden text-sm',
        info.event.url && 'group-hover:underline',
      ),

      /* No-Events Screen
      ------------------------------------------------------------------------------------------- */

      noEventsClass: 'bg-(--fc-classic-muted) flex flex-col items-center justify-center',
      noEventsInnerClass: 'sticky bottom-0 py-15',
    },
    timeline: {

      /* Timeline > Row Event
      ------------------------------------------------------------------------------------------- */

      rowEventClass: (info) => joinClassNames(
        info.isEnd && 'me-px',
        'items-center',
      ),
      rowEventBeforeClass: (info) => (
        !info.isStart && `${continuationArrowClass} border-e-[5px] border-e-black`
      ),
      rowEventAfterClass: (info) => (
        !info.isEnd && `${continuationArrowClass} border-s-[5px] border-s-black`
      ),
      rowEventInnerClass: (info) => (
        info.options.eventOverlap
          ? 'py-0.5'
          : 'py-1.5'
      ),
      rowEventTimeClass: 'px-0.5',
      rowEventTitleClass: 'px-0.5',

      /* Timeline > More-Link
      ------------------------------------------------------------------------------------------- */

      rowMoreLinkClass: `me-px mb-px border border-transparent print:border-black ${strongSolidPressableClass} print:bg-white`,
      rowMoreLinkInnerClass: 'p-0.5 text-xs',

      /* Timeline > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderAlign: (info) => info.isTime ? 'start' : 'center',
      slotHeaderClass: (info) => joinClassNames(
        'justify-center',
        !info.level && 'overflow-hidden',
      ),
      slotHeaderInnerClass: (info) => joinClassNames(
        'mx-2 my-1 text-sm',
        info.hasNavLink && 'hover:underline',
      ),
      slotHeaderDividerClass: 'border-b border-(--fc-classic-border)',

      /* Timeline > Now-Indicator
      ------------------------------------------------------------------------------------------- */

      nowIndicatorHeaderClass: 'top-0 -mx-[5px] border-x-[5px] border-x-transparent border-t-[6px] border-(--fc-classic-now)',
      nowIndicatorLineClass: 'border-s border-(--fc-classic-now)',
    },
  }
} as PluginInput

/* SVGs
------------------------------------------------------------------------------------------------- */

function chevronLeft(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
}

function chevronsLeft(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
}

function x(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}

function plusSquare(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
}

function minusSquare(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>
}
