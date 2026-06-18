import { PluginInput } from '../../plugin-system-struct'
import { CalendarOptions } from '../../options'
import { DayCellInfo } from '../../render-hook-misc'
import { joinClassNames } from '../../util/html'

// will get stripped during tsc transpile
import {} from '../scheduler-types-hack'

// usually 11px font / 12px line-height
const xxsTextClass = 'text-[0.6875rem]/[1.090909]'

// outline
const outlineWidthClass = 'outline-3'
const outlineWidthFocusClass = 'focus-visible:outline-3'
const outlineWidthGroupFocusClass = 'group-focus-visible:outline-3'
const outlineColorClass = 'outline-(--fc-monarch-outline)'
const outlineFocusClass = `${outlineColorClass} ${outlineWidthFocusClass}`

// neutral buttons
const strongSolidPressableClass = joinClassNames(
  '[background:linear-gradient(var(--fc-monarch-strong),var(--fc-monarch-strong))_var(--fc-monarch-background)]',
  'hover:[background:linear-gradient(var(--fc-monarch-stronger),var(--fc-monarch-stronger))_var(--fc-monarch-background)]',
  'active:[background:linear-gradient(var(--fc-monarch-strongest),var(--fc-monarch-strongest))_var(--fc-monarch-background)]',
)
const mutedHoverClass = 'hover:bg-(--fc-monarch-muted)'
const mutedHoverGroupClass = 'group-hover:bg-(--fc-monarch-muted)'
const mutedHoverPressableClass = `${mutedHoverClass} focus-visible:bg-(--fc-monarch-muted) active:bg-(--fc-monarch-strong)`
const mutedHoverPressableGroupClass = `${mutedHoverGroupClass} group-focus-visible:bg-(--fc-monarch-muted) group-active:bg-(--fc-monarch-strong)`

// controls
const selectedClass = 'bg-(--fc-monarch-selected) text-(--fc-monarch-selected-foreground)'
const selectedPressableClasss = `${selectedClass} hover:bg-(--fc-monarch-selected-over) active:bg-(--fc-monarch-selected-down)`
const selectedButtonClass = `${selectedPressableClasss} border border-transparent ${outlineFocusClass} -outline-offset-1`
const unselectedButtonClass = `${mutedHoverPressableClass} border border-transparent ${outlineFocusClass} -outline-offset-1`

// primary
const primaryClass = 'bg-(--fc-monarch-primary) text-(--fc-monarch-primary-foreground)'
const primaryPressableClass = `${primaryClass} hover:bg-(--fc-monarch-primary-over) active:bg-(--fc-monarch-primary-down)`
const primaryButtonClass = `${primaryPressableClass} border border-transparent ${outlineFocusClass}`

// secondary *calendar content* (has muted color)
const secondaryClass = 'bg-(--fc-monarch-secondary) text-(--fc-monarch-secondary-foreground)'
const secondaryPressableClass = `${secondaryClass} hover:bg-(--fc-monarch-secondary-over) active:bg-(--fc-monarch-secondary-down) ${outlineFocusClass}`

// secondary *toolbar button* (neutral)
const secondaryButtonClass = `${mutedHoverPressableClass} border border-(--fc-monarch-strong-border) ${outlineFocusClass} -outline-offset-1`
const secondaryButtonIconClass = `size-5 text-(--fc-monarch-foreground) group-hover:text-(--fc-monarch-strong-foreground) group-focus-visible:text-(--fc-monarch-strong-foreground)`

// tertiary
const tertiaryClass = 'bg-(--fc-monarch-tertiary) text-(--fc-monarch-tertiary-foreground)'
const tertiaryPressableClass = `${tertiaryClass} hover:bg-(--fc-monarch-tertiary-over) active:bg-(--fc-monarch-tertiary-down)`
const tertiaryPressableGroupClass = `${tertiaryClass} group-hover:bg-(--fc-monarch-tertiary-over) group-active:bg-(--fc-monarch-tertiary-down) ${outlineFocusClass}`

// interactive neutral foregrounds
const mutedFgPressableGroupClass = 'text-(--fc-monarch-muted-foreground) group-hover:text-(--fc-monarch-foreground) group-focus-visible:text-(--fc-monarch-foreground)'

// transparent resizer for mouse
const blockPointerResizerClass = 'absolute hidden group-hover:block'
const rowPointerResizerClass = `${blockPointerResizerClass} inset-y-0 w-2`
const columnPointerResizerClass = `${blockPointerResizerClass} inset-x-0 h-2`

// circle resizer for touch
const blockTouchResizerClass = 'absolute size-2 border border-(--fc-event-color) bg-(--fc-monarch-background) rounded-full'
const rowTouchResizerClass = `${blockTouchResizerClass} top-1/2 -mt-1`
const columnTouchResizerClass = `${blockTouchResizerClass} left-1/2 -ml-1`

const tallDayCellBottomClass = 'min-h-4'
const getShortDayCellBottomClass = (info: DayCellInfo) => joinClassNames(
  !info.isNarrow && 'min-h-px'
)

const dayRowCommonClasses: CalendarOptions = {

  /* Day Row > List-Item Event
  ----------------------------------------------------------------------------------------------- */

  listItemEventClass: (info) => joinClassNames(
    'mb-px p-px rounded-sm',
    info.isNarrow ? 'mx-px' : 'mx-0.5',
  ),
  listItemEventBeforeClass: (info) => joinClassNames(
    'border-4',
    info.isNarrow ? 'ms-0.5' : 'ms-1',
  ),
  listItemEventInnerClass: (info) => (
    info.isNarrow
      ? `py-px ${xxsTextClass}`
      : 'py-0.5 text-xs'
  ),
  listItemEventTimeClass: (info) => joinClassNames(
    info.isNarrow ? 'ps-0.5' : 'ps-1',
    'whitespace-nowrap overflow-hidden shrink-1',
  ),
  listItemEventTitleClass: (info) => joinClassNames(
    info.isNarrow ? 'px-0.5' : 'px-1',
    'font-bold whitespace-nowrap overflow-hidden shrink-100',
  ),

  /* Day Row > Row Event
  ----------------------------------------------------------------------------------------------- */

  rowEventClass: (info) => joinClassNames(
    info.isStart && 'ms-px',
    info.isEnd && 'me-px',
  ),
  rowEventInnerClass: (info) => info.isNarrow ? 'py-px' : 'py-0.5',

  /* Day Row > More-Link
  ----------------------------------------------------------------------------------------------- */

  rowMoreLinkClass: (info) => joinClassNames(
    'mb-px border rounded-sm',
    info.isNarrow
      ? 'mx-px border-(--fc-monarch-primary)'
      : 'mx-0.5 border-transparent',
    mutedHoverPressableClass,
  ),
  rowMoreLinkInnerClass: (info) => (
    info.isNarrow
      ? `px-0.5 py-px ${xxsTextClass}`
      : 'px-1 py-0.5 text-xs'
  ),
}

const resourceDayHeaderClasses = {
  dayHeaderInnerClass: 'mb-1',
  dayHeaderDividerClass: 'border-b border-(--fc-monarch-border)',
}

export default {
  name: 'theme-monarch',
  optionDefaults: {
    className: "text-(--fc-monarch-foreground) root-reset",

    viewClass: (info) => {
      const hasBorderTop = !info.options.headerToolbar && !info.borderlessTop
      const hasBorderBottom = !info.options.footerToolbar && !info.borderlessBottom
      const hasBorderX = !info.borderlessX

      return joinClassNames(
        'bg-(--fc-monarch-background) border-(--fc-monarch-border)',
        hasBorderTop && 'border-t',
        hasBorderBottom && 'border-b',
        hasBorderX && 'border-x',
        (hasBorderTop && hasBorderX) && 'rounded-t-xl',
        (hasBorderBottom && hasBorderX) && 'rounded-b-xl',
        !info.isHeightAuto && 'overflow-hidden',
      )
    },

    /* Toolbar
    --------------------------------------------------------------------------------------------- */

    toolbarClass: (info) => joinClassNames(
      'p-4 flex flex-row flex-wrap items-center justify-between gap-3',
      'bg-(--fc-monarch-background) border-(--fc-monarch-border)',
      !info.borderlessX && 'border-x',
    ),
    headerToolbarClass: (info) => joinClassNames(
      !info.borderlessTop && 'border-t',
      !(info.borderlessTop || info.borderlessX) && 'rounded-t-xl',
    ),
    footerToolbarClass: (info) => joinClassNames(
      !info.borderlessBottom && 'border-b',
      !(info.borderlessBottom || info.borderlessX) && 'rounded-b-xl',
    ),

    toolbarSectionClass: "shrink-0 flex flex-row items-center gap-3",
    toolbarTitleClass: "text-2xl font-bold",

    buttonGroupClass: (info) => joinClassNames(
      'rounded-full flex flex-row items-center',
      info.hasSelection && 'border border-(--fc-monarch-border)'
    ),
    buttonClass: (info) => joinClassNames(
      'py-2.5 rounded-full flex flex-row items-center text-sm button-reset',
      info.isIconOnly ? 'px-2.5' : 'px-5',
      info.buttonGroup?.hasSelection && '-m-px',
      (info.isIconOnly || (info.buttonGroup?.hasSelection && !info.isSelected))
        ? unselectedButtonClass
        : info.isSelected
          ? selectedButtonClass
          : info.isPrimary
            ? primaryButtonClass
            : secondaryButtonClass
    ),
    buttons: {
      prev: {
        iconContent: () => chevronDown(
          joinClassNames(
            secondaryButtonIconClass,
            'rotate-90 [[dir=rtl]_&]:-rotate-90',
          )
        )
      },
      next: {
        iconContent: () => chevronDown(
          joinClassNames(
            secondaryButtonIconClass,
            '-rotate-90 [[dir=rtl]_&]:rotate-90',
          )
        )
      },
      prevYear: {
        iconContent: () => chevronDoubleLeft(
          joinClassNames(
            secondaryButtonIconClass,
            '[[dir=rtl]_&]:rotate-180'
          )
        )
      },
      nextYear: {
        iconContent: () => chevronDoubleLeft(
          joinClassNames(
            secondaryButtonIconClass,
            'rotate-180 [[dir=rtl]_&]:rotate-0',
          )
        )
      },
    },

    /* Abstract Event
    --------------------------------------------------------------------------------------------- */

    eventShortHeight: 50,
    eventColor: "var(--fc-monarch-event)",
    eventContrastColor: "var(--fc-monarch-event-contrast)",
    eventClass: (info) => joinClassNames(
      info.isDragging && 'root-reset',
      info.event.url && 'link-reset',
      info.isSelected
        ? joinClassNames(
            outlineWidthClass,
            info.isDragging ? 'shadow-lg' : 'shadow-md',
          )
        : outlineWidthFocusClass,
      outlineColorClass,
    ),

    /* Background Event
    --------------------------------------------------------------------------------------------- */

    backgroundEventColor: "var(--fc-monarch-tertiary)",
    backgroundEventClass: "not-print:bg-[color-mix(in_oklab,var(--fc-event-color)_15%,transparent)] print:border-1 print:border-(--fc-event-color)",
    backgroundEventTitleClass: (info) => joinClassNames(
      'opacity-50 italic',
      info.isNarrow
        ? `px-1 py-1.5 ${xxsTextClass}`
        : 'px-2 py-2.5 text-xs',
    ),

    /* List-Item Event
    --------------------------------------------------------------------------------------------- */

    listItemEventClass: (info) => joinClassNames(
      'items-center',
      info.isSelected
        ? 'bg-(--fc-monarch-muted)'
        : info.isInteractive
          ? mutedHoverPressableClass
          : mutedHoverClass,
    ),
    listItemEventBeforeClass: "rounded-full border-(--fc-event-color)",
    listItemEventInnerClass: "text-(--fc-monarch-foreground) flex flex-row items-center",

    /* Block Event
    --------------------------------------------------------------------------------------------- */

    blockEventClass: (info) => joinClassNames(
      'group relative border-transparent print:border-(--fc-event-color) bg-(--fc-event-color) hover:bg-[color-mix(in_oklab,var(--fc-event-color)_92%,var(--fc-event-contrast-color))] print:bg-white',
      info.isInteractive && 'active:bg-[color-mix(in_oklab,var(--fc-event-color)_85%,var(--fc-event-contrast-color))]',
      (!info.isSelected && info.isDragging) && 'opacity-75',
    ),
    blockEventInnerClass: "text-(--fc-event-contrast-color) print:text-black",
    blockEventTimeClass: "whitespace-nowrap overflow-hidden",
    blockEventTitleClass: "whitespace-nowrap overflow-hidden",

    /* Row Event
    --------------------------------------------------------------------------------------------- */

    rowEventClass: (info) => joinClassNames(
      'mb-px border-y',
      info.isStart ? 'border-s rounded-s-sm' : (!info.isNarrow && 'ms-2'),
      info.isEnd ? 'border-e rounded-e-sm' : (!info.isNarrow && 'me-2'),
    ),
    rowEventBeforeClass: (info) => joinClassNames(
      info.isStartResizable ? joinClassNames(
        info.isSelected ? rowTouchResizerClass : rowPointerResizerClass,
        '-start-1',
      ) : (!info.isStart && !info.isNarrow) && 'absolute -start-2 w-2 -top-px -bottom-px'
    ),
    rowEventBeforeContent: (info) => (
      (!info.isStart && !info.isNarrow) ? filledRightTriangle(
        'size-full rotate-180 [[dir=rtl]_&]:rotate-0 text-(--fc-event-color)',
      ) : <></>
    ),
    rowEventAfterClass: (info) => joinClassNames(
      info.isEndResizable ? joinClassNames(
        info.isSelected ? rowTouchResizerClass : rowPointerResizerClass,
        '-end-1',
      ) : (!info.isEnd && !info.isNarrow) && 'absolute -end-2 w-2 -top-px -bottom-px'
    ),
    rowEventAfterContent: (info) => (
      (!info.isEnd && !info.isNarrow) ? filledRightTriangle(
        'size-full [[dir=rtl]_&]:rotate-180 text-(--fc-event-color)',
      ) : <></>
    ),
    rowEventInnerClass: (info) => joinClassNames(
      'flex flex-row items-center',
      info.isNarrow ? xxsTextClass : 'text-xs',
    ),
    rowEventTimeClass: (info) => joinClassNames(
      'font-bold shrink-1',
      info.isNarrow ? 'ps-0.5' : 'ps-1',
    ),
    rowEventTitleClass: (info) => joinClassNames(
      'shrink-100',
      info.isNarrow ? 'px-0.5' : 'px-1',
    ),

    /* Column Event
    --------------------------------------------------------------------------------------------- */

    columnEventTitleSticky: false,
    columnEventClass: (info) => joinClassNames(
      `border-x ring ring-(--fc-monarch-background)`,
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
        ? 'flex-row items-center p-1 gap-1'
        : joinClassNames(
            'flex-col',
            info.isNarrow ? 'px-1 py-0.5' : 'px-2 py-1',
          ),
      (info.isShort || info.isNarrow) ? xxsTextClass : 'text-xs',
    ),
    columnEventTimeClass: (info) => joinClassNames(
      'order-1 shrink-100',
      !info.isShort && (info.isNarrow ? 'pb-0.5' : 'pb-1'),
    ),
    columnEventTitleClass: (info) => joinClassNames(
      'shrink-1',
      !info.isShort && (info.isNarrow ? 'py-0.5' : 'py-1'),
    ),

    /* More-Link
    --------------------------------------------------------------------------------------------- */

    moreLinkClass: `${outlineWidthFocusClass} ${outlineColorClass}`,
    moreLinkInnerClass: "whitespace-nowrap overflow-hidden",
    columnMoreLinkClass: `mb-px border border-transparent print:border-black rounded-sm ${strongSolidPressableClass} print:bg-white ring ring-(--fc-monarch-background)`,
    columnMoreLinkInnerClass: (info) => (
      info.isNarrow
        ? `p-0.5 ${xxsTextClass}`
        : 'p-1 text-xs'
    ),

    /* Day Header
    --------------------------------------------------------------------------------------------- */

    dayHeaderAlign: "center",
    dayHeaderClass: (info) => joinClassNames(
      'justify-center',
      info.isMajor && 'border border-(--fc-monarch-strong-border)',
      (info.isDisabled && !info.inPopover) && 'bg-(--fc-monarch-faint)',
    ),
    dayHeaderInnerClass: "group mt-2 mx-2 flex flex-col items-center outline-none",
    dayHeaderContent: (info) => (
      <>
        {info.weekdayText && (
          <div
            className="text-xs uppercase text-(--fc-monarch-muted-foreground)"
          >{info.weekdayText}</div>
        )}
        {info.dayNumberText && (
          <div
            className={joinClassNames(
              'm-0.5 rounded-full flex flex-row items-center justify-center',
              info.isNarrow
                ? 'size-7 text-base'
                : 'size-8 text-lg',
              info.isToday
                ? (info.hasNavLink ? tertiaryPressableGroupClass : tertiaryClass)
                : (info.hasNavLink && mutedHoverPressableGroupClass),
              info.hasNavLink && `${outlineWidthGroupFocusClass} ${outlineColorClass}`,
            )}
          >{info.dayNumberText}</div>
        )}
      </>
    ),

    /* Day Cell
    --------------------------------------------------------------------------------------------- */

    dayCellClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-monarch-strong-border)' : 'border-(--fc-monarch-border)',
      info.isDisabled && 'bg-(--fc-monarch-faint)',
    ),
    dayCellTopClass: (info) => joinClassNames(
      'flex flex-row',
      info.isNarrow
        ? 'justify-end min-h-px'
        : 'justify-center min-h-0.5',
    ),
    dayCellTopInnerClass: (info) => joinClassNames(
      'flex flex-row items-center justify-center whitespace-nowrap rounded-full',
      info.isNarrow
        ? `m-px h-5 ${xxsTextClass}`
        : 'm-1.5 h-6 text-sm',
      info.text === info.dayNumberText
        ? (info.isNarrow ? 'w-5' : 'w-6')
        : (info.isNarrow ? 'px-1' : 'px-2'),
      info.isToday
        ? (info.hasNavLink ? tertiaryPressableClass : tertiaryClass)
        : (info.hasNavLink && mutedHoverPressableClass),
      info.isOther && 'text-(--fc-monarch-faint-foreground)',
      info.monthText && 'font-bold',
    ),
    dayCellInnerClass: (info) => joinClassNames(info.inPopover && 'p-2'),

    /* Popover
    --------------------------------------------------------------------------------------------- */

    popoverFormat: { day: 'numeric', weekday: 'short' },
    popoverClass: "border border-(--fc-monarch-border) rounded-lg overflow-hidden m-2 bg-(--fc-monarch-popover) text-(--fc-monarch-popover-foreground) shadow-lg min-w-60 root-reset",
    popoverCloseClass: `group absolute top-2 end-2 size-8 rounded-full items-center justify-center ${mutedHoverPressableClass} ${outlineWidthFocusClass} ${outlineColorClass} button-reset`,
    popoverCloseContent: () => x(`size-5 ${mutedFgPressableGroupClass}`),

    /* Lane
    --------------------------------------------------------------------------------------------- */

    dayLaneClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-monarch-strong-border)' : 'border-(--fc-monarch-border)',
      info.isDisabled && 'bg-(--fc-monarch-faint)',
    ),
    dayLaneInnerClass: (info) => (
      info.isStack
        ? 'm-1'
        : info.isNarrow ? 'mx-px' : 'ms-0.5 me-[2.5%]'
    ),
    slotLaneClass: (info) => joinClassNames(
      'border border-(--fc-monarch-border)',
      info.isMinor && 'border-dotted',
    ),

    /* List Day
    --------------------------------------------------------------------------------------------- */

    listDayFormat: { day: 'numeric' },
    listDayAltFormat: { month: 'short', weekday: 'short', forceCommas: true },
    listDayClass: (info) => joinClassNames(
      !info.isLast && 'border-b border-(--fc-monarch-border)',
      'flex flex-row items-start',
    ),
    listDayHeaderClass: "p-2 shrink-0 w-1/3 max-w-44 min-h-9 flex flex-row items-center gap-2",
    listDayHeaderInnerClass: (info) => (
      !info.level
        ? joinClassNames(
            'h-9 rounded-full flex flex-row items-center text-lg',
            info.text === info.dayNumberText
              ? 'w-9 justify-center'
              : 'px-3',
            info.isToday
              ? (info.hasNavLink ? tertiaryPressableClass : tertiaryClass)
              : (info.hasNavLink && mutedHoverPressableClass)
          )
        : joinClassNames(
            'text-xs uppercase',
            info.hasNavLink && 'hover:underline',
          )
    ),
    listDayBodyClass: "grow min-w-0 py-2 gap-1",

    /* Single Month (in Multi-Month)
    --------------------------------------------------------------------------------------------- */

    singleMonthClass: (info) => joinClassNames(
      info.multiMonthColumns > 1 && 'm-4',
      (info.multiMonthColumns === 1 && !info.isLast) &&
        'border-(--fc-monarch-border) border-b',
    ),
    singleMonthHeaderClass: (info) => joinClassNames(
      info.multiMonthColumns > 1
        ? 'pb-2'
        : 'py-1 border-b border-(--fc-monarch-border) bg-(--fc-monarch-background)',
      'items-center',
    ),
    singleMonthHeaderInnerClass: (info) => joinClassNames(
      'px-3 py-1 rounded-full text-base font-bold',
      info.hasNavLink && mutedHoverPressableClass,
    ),

    /* Misc Table
    --------------------------------------------------------------------------------------------- */

    tableHeaderClass: 'bg-(--fc-monarch-background)',
    fillerClass: (info) => joinClassNames(
      'opacity-50 border',
      info.inTableHeader ? 'border-transparent' : 'border-(--fc-monarch-border)',
    ),
    dayNarrowWidth: 100,
    dayHeaderRowClass: "border border-(--fc-monarch-border)",
    dayRowClass: "border border-(--fc-monarch-border)",

    /* Misc Content
    --------------------------------------------------------------------------------------------- */

    navLinkClass: `${outlineWidthFocusClass} ${outlineColorClass}`,
    inlineWeekNumberClass: (info) => joinClassNames(
      'absolute flex flex-row items-center whitespace-nowrap',
      info.isNarrow
        ? `top-0.5 start-0 my-px h-4 pe-1 rounded-e-full ${xxsTextClass}`
        : 'top-1.5 start-1 h-6 px-2 rounded-full text-sm',
      info.hasNavLink
        ? secondaryPressableClass
        : secondaryClass,
    ),
    nonBusinessHoursClass: "bg-(--fc-monarch-faint)",
    highlightClass: "bg-(--fc-monarch-highlight)",
    nowIndicatorLineClass: "-m-px border-1 border-(--fc-monarch-now)",
    nowIndicatorDotClass: "-m-[6px] border-6 border-(--fc-monarch-now) size-0 rounded-full ring-2 ring-(--fc-monarch-background)",

    /* Resource Day Header
    --------------------------------------------------------------------------------------------- */

    resourceDayHeaderAlign: "center",
    resourceDayHeaderClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-monarch-strong-border)' : 'border-(--fc-monarch-border)',
    ),
    resourceDayHeaderInnerClass: (info) => joinClassNames(
      'm-2 flex flex-col',
      info.isNarrow ? 'text-xs' : 'text-sm',
    ),

    /* Resource Data Grid
    --------------------------------------------------------------------------------------------- */

    resourceColumnHeaderClass: "border border-(--fc-monarch-border) justify-center",
    resourceColumnHeaderInnerClass: "m-2 text-sm",
    resourceColumnResizerClass: "absolute inset-y-0 w-[5px] end-[-3px]",
    resourceGroupHeaderClass: "border border-(--fc-monarch-border) bg-(--fc-monarch-faint)",
    resourceGroupHeaderInnerClass: "m-2 text-sm",
    resourceCellClass: "border border-(--fc-monarch-border)",
    resourceCellInnerClass: "m-2 text-sm",
    resourceIndentClass: "ms-1 -me-1.5 justify-center",
    resourceExpanderClass: `group p-1 rounded-full ${mutedHoverPressableClass} ${outlineWidthFocusClass} ${outlineColorClass}`,
    resourceExpanderContent: (info) => chevronDown(
      joinClassNames(
        `size-4 ${mutedFgPressableGroupClass}`,
        !info.isExpanded && '-rotate-90 [[dir=rtl]_&]:rotate-90'
      ),
    ),
    resourceHeaderRowClass: "border border-(--fc-monarch-border)",
    resourceRowClass: "border border-(--fc-monarch-border)",
    resourceColumnDividerClass: "border-e border-(--fc-monarch-strong-border)",

    /* Timeline Lane
    --------------------------------------------------------------------------------------------- */

    resourceGroupLaneClass: "border border-(--fc-monarch-border) bg-(--fc-monarch-faint)",
    resourceLaneClass: "border border-(--fc-monarch-border)",
    resourceLaneBottomClass: (info) => info.options.eventOverlap && 'h-2',
    timelineBottomClass: "h-2",
  },
  views: {
    dayGrid: {
      ...dayRowCommonClasses,
      dayCellBottomClass: getShortDayCellBottomClass,
    },
    multiMonth: {
      ...dayRowCommonClasses,
      dayCellBottomClass: getShortDayCellBottomClass,
      dayHeaderInnerClass: (info) => !info.inPopover && 'mb-2',
      dayHeaderDividerClass: (info) => joinClassNames(
        info.multiMonthColumns === 1 &&
          'border-b border-(--fc-monarch-border)',
      ),
      tableBodyClass: (info) => joinClassNames(
        info.multiMonthColumns > 1 &&
          'border border-(--fc-monarch-border) rounded-sm overflow-hidden',
      ),
    },
    timeGrid: {
      ...dayRowCommonClasses,
      dayCellBottomClass: tallDayCellBottomClass,

      /* TimeGrid > Week Number Header
      ------------------------------------------------------------------------------------------- */

      weekNumberHeaderClass: 'items-center justify-end',
      weekNumberHeaderInnerClass: (info) => joinClassNames(
        'ms-1 my-2 flex flex-row items-center rounded-full',
        info.options.dayMinWidth !== undefined && 'me-1',
        info.isNarrow
          ? 'h-5 px-1.5 text-xs'
          : 'h-6 px-2 text-sm',
        info.hasNavLink
          ? secondaryPressableClass
          : secondaryClass,
      ),

      /* TimeGrid > All-Day Header
      ------------------------------------------------------------------------------------------- */

      allDayHeaderClass: 'items-center justify-end',
      allDayHeaderInnerClass: (info) => joinClassNames(
        'm-2 text-end',
        info.isNarrow ? xxsTextClass : 'text-sm',
      ),
      allDayDividerClass: 'border-b border-(--fc-monarch-border)',

      /* TimeGrid > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderClass: (info) => joinClassNames(
        'w-2 self-end justify-end border border-(--fc-monarch-border)',
        info.isMinor && 'border-dotted',
      ),
      slotHeaderInnerClass: (info) => joinClassNames(
        'relative ms-2 me-3 my-2',
        info.isNarrow
          ? `-top-4 ${xxsTextClass}`
          : '-top-5 text-sm',
        info.isFirst && 'hidden',
      ),
      slotHeaderDividerClass: (info) => joinClassNames(
        'border-e',
        (info.inTableHeader && info.options.dayMinWidth === undefined)
          ? 'border-transparent'
          : 'border-(--fc-monarch-border)',
      ),
    },
    list: {

      /* List-View > List-Item Event
      ------------------------------------------------------------------------------------------- */

      listItemEventClass: 'group p-2 rounded-s-full gap-2',
      listItemEventBeforeClass: 'mx-2 border-5',
      listItemEventInnerClass: 'gap-2 text-sm',
      listItemEventTimeClass: 'shrink-0 w-1/2 max-w-40 whitespace-nowrap overflow-hidden text-ellipsis',
      listItemEventTitleClass: (info) => joinClassNames(
        'grow min-w-0 whitespace-nowrap overflow-hidden',
        info.event.url && 'group-hover:underline',
      ),

      /* No-Events Screen
      ------------------------------------------------------------------------------------------- */

      noEventsClass: 'grow flex flex-col items-center justify-center',
      noEventsInnerClass: 'py-15',
    },
    resourceTimeGrid: resourceDayHeaderClasses,
    resourceDayGrid: resourceDayHeaderClasses,
    timeline: {

      /* Timeline > Row Event
      ------------------------------------------------------------------------------------------- */

      rowEventClass: (info) => joinClassNames(info.isEnd && 'me-px'),
      rowEventInnerClass: (info) => info.options.eventOverlap ? 'py-1' : 'py-2',

      /* Timeline > More-Link
      ------------------------------------------------------------------------------------------- */

      rowMoreLinkClass: `me-px mb-px rounded-sm border border-transparent print:border-black ${strongSolidPressableClass} print:bg-white`,
      rowMoreLinkInnerClass: 'p-1 text-xs',

      /* Timeline > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderSticky: '0.5rem',
      slotHeaderAlign: (info) => (
        (info.level || info.isTime)
          ? 'start'
          : 'center'
      ),
      slotHeaderClass: (info) => joinClassNames(
        'border',
        info.level
          ? 'border-transparent justify-start'
          : joinClassNames(
              'border-(--fc-monarch-border)',
              info.isTime
                ? 'h-2 self-end justify-end'
                : 'justify-center',
            ),
      ),
      slotHeaderInnerClass: (info) => joinClassNames(
        'text-sm',
        info.level
          ? joinClassNames(
              'my-0.5 px-2 py-1 rounded-full',
              info.hasNavLink
                ? secondaryPressableClass
                : secondaryClass,
            )
          : joinClassNames(
              'px-2',
              info.isTime
                ? joinClassNames(
                    'pb-3 relative -start-3',
                    info.isFirst && 'hidden',
                  )
                : 'py-2',
              info.hasNavLink && 'hover:underline',
            )
      ),
      slotHeaderDividerClass: 'border-b border-(--fc-monarch-border)',
    },
  }
} as PluginInput

/* SVGs
------------------------------------------------------------------------------------------------- */

function chevronDown(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="80 -880 800 800" fill="currentColor"><path d="M480-304 240-544l56-56 184 184 184-184 56 56-240 240Z"/></svg>
}

function chevronDoubleLeft(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="80 -880 800 800" fill="currentColor"><path d="M440-240 200-480l240-240 56 56-183 184 183 184-56 56Zm264 0L464-480l240-240 56 56-183 184 183 184-56 56Z"/></svg>
}

function x(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="80 -880 800 800" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
}

function filledRightTriangle(className?: string) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 2200"
      preserveAspectRatio="none"
      className={className}
     >
      <polygon points="0,0 66,0 800,1100 66,2200 0,2200" fill="currentColor" />
    </svg>
  )
}
