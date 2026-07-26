type ClassNameInput = string | false | null | undefined | 0
type CalendarOptions = { [optionName: string]: any }

interface PluginInput {
  name: string
  optionDefaults: CalendarOptions
  views: { [viewName: string]: CalendarOptions }
}

function joinClassNames(...inputs: ClassNameInput[]): string {
  return inputs.filter(Boolean).join(' ')
}

// usually 11px font / 12px line-height
const xxsTextClass = 'text-[0.6875rem]/[1.090909]'

// outline
const outlineWidthClass = 'outline-2'
const outlineWidthFocusClass = 'focus-visible:outline-2'
const outlineOffsetClass = 'outline-offset-2'
const outlineInsetClass = '-outline-offset-2'
const primaryOutlineColorClass = 'outline-(--bs-primary)'
const navIconClass = 'inline-block [[dir=rtl]_&]:-scale-x-100'

// neutral buttons
const strongSolidPressableClass = 'bg-(--bs-border-color)'
const mutedHoverClass = 'hover:bg-(--bs-secondary-bg)'
const mutedHoverPressableClass = `${mutedHoverClass} focus-visible:bg-(--bs-secondary-bg) active:bg-(--bs-border-color)`
const faintHoverClass = 'hover:bg-(--bs-tertiary-bg)'
const faintHoverPressableClass = `${faintHoverClass} focus-visible:bg-(--bs-tertiary-bg) active:bg-(--bs-secondary-bg)`

// transparent resizer for mouse
const blockPointerResizerClass = 'absolute hidden group-hover:block'
const rowPointerResizerClass = `${blockPointerResizerClass} inset-y-0 w-2`
const columnPointerResizerClass = `${blockPointerResizerClass} inset-x-0 h-2`

// circle resizer for touch
const blockTouchResizerClass = 'absolute size-2 border border-(--fc-event-color) bg-body rounded-full'
const rowTouchResizerClass = `${blockTouchResizerClass} top-1/2 -mt-1`
const columnTouchResizerClass = `${blockTouchResizerClass} left-1/2 -ml-1`

const getDayClass = (info: { isMajor: boolean, isToday: boolean, isDisabled: boolean}) => joinClassNames(
  'border',
  info.isMajor ? 'border-(--bs-tertiary-color)' : 'border-(--bs-border-color)',
  info.isDisabled ? 'bg-body-tertiary' :
    info.isToday && 'bg-warning bg-opacity-20 print:bg-transparent',
)

const getSlotClass = (info: { isMinor: boolean }) => joinClassNames(
  'border border-(--bs-border-color)',
  info.isMinor && 'border-dotted',
)

const dayRowCommonClasses: CalendarOptions = {

  /* Day Row > List-Item Event
  ----------------------------------------------------------------------------------------------- */

  listItemEventClass: (info) => joinClassNames(
    'mb-px p-px rounded-sm',
    info.isNarrow ? 'mx-0.5' : 'mx-1',
    info.isSelected
      ? joinClassNames('bg-body-secondary', info.isDragging && 'shadow-sm')
      : (info.isInteractive ? mutedHoverPressableClass : mutedHoverClass),
  ),

  listItemEventBeforeClass: (info) => joinClassNames(
    'border-4',
    info.isNarrow ? 'mx-px' : 'mx-1',
  ),

  listItemEventInnerClass: (info) => joinClassNames(
    'flex flex-row items-center',
    info.isNarrow ? 'py-px' : 'py-0.5',
    info.isNarrow ? xxsTextClass : 'text-xs',
  ),

  listItemEventTimeClass: (info) => joinClassNames(
    info.isNarrow ? 'px-px' : 'px-0.5',
    'whitespace-nowrap overflow-hidden shrink-1',
  ),
  listItemEventTitleClass: (info) => joinClassNames(
    info.isNarrow ? 'px-px' : 'px-0.5',
    'font-bold whitespace-nowrap overflow-hidden shrink-100',
  ),

  /* Day Row > Row Event
  ----------------------------------------------------------------------------------------------- */

  rowEventClass: (info) => joinClassNames(
    info.isStart && joinClassNames('rounded-s-sm', info.isNarrow ? 'ms-0.5' : 'ms-1'),
    info.isEnd && joinClassNames('rounded-e-sm', info.isNarrow ? 'me-0.5' : 'me-1'),
  ),

  rowEventInnerClass: (info) => info.isNarrow ? 'py-px' : 'py-0.5',
  rowEventTimeClass: (info) => info.isNarrow ? 'ps-0.5' : 'ps-1',
  rowEventTitleClass: (info) => info.isNarrow ? 'px-0.5' : 'px-1',

  /* Day Row > More-Link
  ----------------------------------------------------------------------------------------------- */

  rowMoreLinkClass: (info) => joinClassNames(
    'mb-px border rounded-sm',
    info.isNarrow
      ? 'mx-0.5 border-primary'
      : 'self-start mx-1 border-transparent',
    mutedHoverPressableClass,
  ),

  rowMoreLinkInnerClass: (info) => joinClassNames(
    'p-px',
    info.isNarrow ? xxsTextClass : 'text-xs',
  ),
}

const continuationArrowClass = 'mx-1 border-y-[5px] border-y-transparent opacity-50'

export default {
  name: 'theme-bootstrap5',
  optionDefaults: {
    className: "fc-theme-bootstrap5 gap-5 root-reset",
    viewClass: (info) => {
      const hasBorderTop = info.options.headerToolbar || !info.borderlessTop
      const hasBorderBottom = info.options.footerToolbar || !info.borderlessBottom
      const hasBorderX = !info.borderlessX
      return joinClassNames(
        'bg-body text-body border-(--bs-border-color)',
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
    buttonGroupClass: "btn-group",
    buttonClass: (info) => joinClassNames(
      'btn btn-primary print:border-black print:bg-white print:text-black',
      info.isSelected && 'active',
    ),
    buttons: {
      prev: {
        iconClass: `bi bi-chevron-left ${navIconClass}`,
      },
      next: {
        iconClass: `bi bi-chevron-right ${navIconClass}`,
      },
      prevYear: {
        iconClass: `bi bi-chevron-double-left ${navIconClass}`,
      },
      nextYear: {
        iconClass: `bi bi-chevron-double-right ${navIconClass}`,
      },
    },

    /* Abstract Event
    --------------------------------------------------------------------------------------------- */

    eventColor: "var(--bs-primary)",
    eventContrastColor: "var(--bs-white)",
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

    backgroundEventColor: "var(--bs-success)",
    backgroundEventClass: "not-print:bg-[color-mix(in_oklab,var(--fc-event-color)_20%,transparent)] print:border-1 print:border-(--fc-event-color)",
    backgroundEventTitleClass: (info) => joinClassNames(
      'opacity-50 italic',
      info.isNarrow
        ? `p-0.5 ${xxsTextClass}`
        : 'p-1.5 text-xs',
    ),

    /* List-Item Event
    --------------------------------------------------------------------------------------------- */

    listItemEventClass: "items-center",
    listItemEventBeforeClass: "border-(--fc-event-color) rounded-full",
    listItemEventInnerClass: "text-body",

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
      info.isStart && 'rounded-s-sm border-s',
      info.isEnd && 'rounded-e-sm border-e',
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
      'border-x ring ring-(--bs-body-bg)',
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
        ? 'p-1 flex-row items-center gap-1'
        : 'px-1 py-0.5 flex-col',
    ),
    columnEventTimeClass: (info) => joinClassNames(
      !info.isShort && 'pt-0.5',
      xxsTextClass,
    ),
    columnEventTitleClass: (info) => joinClassNames(
      !info.isShort && 'py-0.5',
      (info.isShort || info.isNarrow) ? xxsTextClass : 'text-xs',
    ),

    /* More-Link
    --------------------------------------------------------------------------------------------- */

    moreLinkClass: `${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    moreLinkInnerClass: "whitespace-nowrap overflow-hidden",
    columnMoreLinkClass: `mb-px rounded-sm border border-transparent print:border-black ${strongSolidPressableClass} print:bg-white ring ring-(--bs-body-bg) ${outlineOffsetClass}`,
    columnMoreLinkInnerClass: (info) => joinClassNames(
      'p-0.5',
      info.isNarrow ? xxsTextClass : 'text-xs',
    ),

    /* Day Header
    --------------------------------------------------------------------------------------------- */

    dayHeaderAlign: (info) => info.inPopover ? 'start' : 'center',
    dayHeaderClass: (info) => (
      info.inPopover
        ? 'popover-header'
        : joinClassNames(
            'justify-center',
            info.isDisabled && 'bg-body-tertiary',
            'border',
            info.isMajor ? 'border-(--bs-tertiary-color)' : 'border-(--bs-border-color)',
          )
    ),
    dayHeaderInnerClass: (info) => (
      info.inPopover
        ? 'flex flex-col'
        : joinClassNames(
            'mx-1 my-0.5 flex flex-col',
            info.isNarrow ? xxsTextClass : 'text-sm',
          )
    ),
    dayHeaderDividerClass: "border-b border-(--bs-border-color)",

    /* Day Cell
    --------------------------------------------------------------------------------------------- */

    dayCellClass: getDayClass,
    dayCellTopClass: (info) => joinClassNames(
      info.isNarrow ? 'min-h-0.5' : 'min-h-1',
      'flex flex-row justify-end',
    ),
    dayCellTopInnerClass: (info) => joinClassNames(
      'mx-1 whitespace-nowrap',
      info.isNarrow
        ? `my-0.5 ${xxsTextClass}`
        : 'my-1 text-sm',
      info.isOther && 'text-body-tertiary',
      info.monthText && 'font-bold',
    ),
    dayCellInnerClass: (info) => info.inPopover ? 'popover-body' : '',

    /* Popover
    --------------------------------------------------------------------------------------------- */

    popoverClass: "popover m-1 bg-body text-body min-w-55 root-reset",
    popoverCloseClass: `group absolute top-3 end-2 ${outlineWidthFocusClass} ${primaryOutlineColorClass} button-reset bi bi-x-lg`,

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

    listDayHeaderClass: "border-b border-(--bs-border-color) bg-body-secondary -mb-px flex flex-row items-center justify-between",
    listDayHeaderInnerClass: "px-3 py-2 text-sm font-bold",

    /* Single Month (in Multi-Month)
    --------------------------------------------------------------------------------------------- */

    singleMonthClass: (info) => joinClassNames(
      info.multiMonthColumns > 1 && 'm-4',
      (info.multiMonthColumns === 1 && !info.isLast) && 'border-b border-(--bs-border-color)',
    ),
    singleMonthHeaderClass: (info) => joinClassNames(
      info.multiMonthColumns > 1
        ? 'pb-4'
        : 'py-2 border-b border-(--bs-border-color) bg-body',
      'items-center',
    ),
    singleMonthHeaderInnerClass: "text-base font-bold",

    /* Misc Table
    --------------------------------------------------------------------------------------------- */

    tableHeaderClass: 'bg-body',
    fillerClass: "border border-(--bs-border-color) opacity-50",
    dayHeaderRowClass: "border border-(--bs-border-color)",
    dayRowClass: "border border-(--bs-border-color)",
    slotHeaderRowClass: "border border-(--bs-border-color)",
    slotHeaderClass: getSlotClass,

    /* Misc Content
    --------------------------------------------------------------------------------------------- */

    navLinkClass: `hover:underline ${outlineWidthFocusClass} ${outlineInsetClass} ${primaryOutlineColorClass}`,
    inlineWeekNumberClass: (info) => joinClassNames(
      'absolute top-0 start-0 rounded-ee-sm p-0.5 text-center text-body-secondary bg-body-secondary',
      info.isNarrow ? xxsTextClass : 'text-sm',
    ),
    nonBusinessHoursClass: "bg-body-tertiary",
    highlightClass: "bg-info bg-opacity-20",

    /* Resource Day Header
    --------------------------------------------------------------------------------------------- */

    resourceDayHeaderAlign: "center",
    resourceDayHeaderClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--bs-tertiary-color)' : 'border-(--bs-border-color)',
    ),
    resourceDayHeaderInnerClass: (info) => joinClassNames(
      'mx-1 my-0.5 flex flex-col',
      info.isNarrow ? xxsTextClass : 'text-sm',
    ),

    /* Resource Data Grid
    --------------------------------------------------------------------------------------------- */

    resourceColumnHeaderClass: "border border-(--bs-border-color) justify-center",
    resourceColumnHeaderInnerClass: "m-2 text-sm",
    resourceColumnResizerClass: "absolute inset-y-0 w-[5px] end-[-3px]",
    resourceGroupHeaderClass: "border border-(--bs-border-color) bg-body-secondary",
    resourceGroupHeaderInnerClass: "m-2 text-sm",
    resourceCellClass: "border border-(--bs-border-color)",
    resourceCellInnerClass: "m-2 text-sm",
    resourceIndentClass: "ms-2 -me-1 justify-center",
    resourceExpanderClass: (info) => joinClassNames(
      `group ${outlineWidthFocusClass} ${primaryOutlineColorClass} bi bi-chevron-down`,
      !info.isExpanded && '-rotate-90 [[dir=rtl]_&]:rotate-90',
    ),
    resourceHeaderRowClass: "border border-(--bs-border-color)",
    resourceRowClass: "border border-(--bs-border-color)",
    resourceColumnDividerClass: "border-x border-(--bs-border-color) ps-0.5 bg-body-secondary",

    /* Timeline Lane
    --------------------------------------------------------------------------------------------- */

    resourceGroupLaneClass: "border border-(--bs-border-color) bg-body-secondary",
    resourceLaneClass: "border border-(--bs-border-color)",
    resourceLaneBottomClass: (info) => info.options.eventOverlap && 'h-2',
    timelineBottomClass: "h-2",
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
        info.multiMonthColumns > 1 && 'border-(--bs-border-color) border',
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
      allDayDividerClass: 'border-y border-(--bs-border-color) pb-0.5 bg-body-secondary',

      /* TimeGrid > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderClass: 'justify-end',
      slotHeaderInnerClass: (info) => joinClassNames(
        'mx-1 my-0.5',
        info.isNarrow ? xxsTextClass : 'text-sm',
      ),
      slotHeaderDividerClass: 'border-e border-(--bs-border-color)',

      /* TimeGrid > Now-Indicator
      ------------------------------------------------------------------------------------------- */

      nowIndicatorHeaderClass: 'start-0 -mt-[5px] border-y-[5px] border-y-transparent border-s-[6px] border-s-(--bs-danger)',
      nowIndicatorLineClass: 'border-t border-(--bs-danger)',
    },
    list: {

      /* List-View > List-Item Event
      ------------------------------------------------------------------------------------------- */

      listDayClass: (info) => joinClassNames(
        !info.isLast && 'border-b border-(--bs-border-color)',
      ),
      listItemEventClass: (info) => joinClassNames(
        'group px-3 py-2 gap-3 border-t border-(--bs-border-color)',
        info.isInteractive
          ? joinClassNames(faintHoverPressableClass, outlineInsetClass)
          : faintHoverClass,
      ),
      listItemEventBeforeClass: 'border-5',
      listItemEventInnerClass: '[display:contents]',
      listItemEventTimeClass: '-order-1 shrink-0 w-1/2 max-w-50 whitespace-nowrap overflow-hidden text-ellipsis text-sm',
      listItemEventTitleClass: (info) => joinClassNames(
        'grow min-w-0 whitespace-nowrap overflow-hidden text-sm',
        info.event.url && 'group-hover:underline',
      ),

      /* No-Events Screen
      ------------------------------------------------------------------------------------------- */

      noEventsClass: 'bg-body-secondary flex flex-col items-center justify-center',
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
      rowEventInnerClass: 'py-0.5',
      rowEventTimeClass: 'px-0.5',
      rowEventTitleClass: 'px-0.5',

      /* Timeline > More-Link
      ------------------------------------------------------------------------------------------- */

      rowMoreLinkClass: `me-px mb-px border border-transparent rounded-sm print:border-black ${strongSolidPressableClass} print:bg-white`,
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
      slotHeaderDividerClass: 'border-b border-(--bs-border-color)',

      /* Timeline > Now-Indicator
      ------------------------------------------------------------------------------------------- */

      nowIndicatorHeaderClass: 'top-0 -mx-[5px] border-x-[5px] border-x-transparent border-t-[6px] border-(--bs-danger)',
      nowIndicatorLineClass: 'border-s border-(--bs-danger)',
    },
  }
} as PluginInput
