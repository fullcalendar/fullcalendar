import { PluginInput } from '../../plugin-system-struct'
import { CalendarOptions } from '../../options'
import { DayCellInfo } from '../../render-hook-misc'
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
const primaryOutlineColorClass = 'outline-(--fc-forma-primary)'
const primaryOutlineFocusClass = `${outlineWidthFocusClass} ${primaryOutlineColorClass}`

// neutral buttons
const strongSolidPressableClass = joinClassNames(
  '[background:linear-gradient(var(--fc-forma-strong),var(--fc-forma-strong))_var(--fc-forma-background)]',
  'hover:[background:linear-gradient(var(--fc-forma-stronger),var(--fc-forma-stronger))_var(--fc-forma-background)]',
  'active:[background:linear-gradient(var(--fc-forma-strongest),var(--fc-forma-strongest))_var(--fc-forma-background)]',
)
const mutedPressableClass = `bg-(--fc-forma-muted) hover:bg-(--fc-forma-strong) active:bg-(--fc-forma-stronger) ${primaryOutlineFocusClass}`
const mutedHoverClass = 'hover:bg-(--fc-forma-muted)'
const mutedHoverPressableClass = `${mutedHoverClass} focus-visible:bg-(--fc-forma-muted) active:bg-(--fc-forma-strong)`
const mutedHoverButtonClass = `${mutedHoverPressableClass} border border-transparent ${primaryOutlineFocusClass}`

// controls
const unselectedPressableClass = mutedHoverPressableClass
const unselectedButtonClass = `${unselectedPressableClass} border border-transparent ${primaryOutlineFocusClass}`
const selectedButtonClass = `bg-(--fc-forma-muted) border border-(--fc-forma-strong-border) ${primaryOutlineFocusClass} -outline-offset-1`

// primary
const primaryClass = 'bg-(--fc-forma-primary) text-(--fc-forma-primary-foreground)'
const primaryPressableClass = `${primaryClass} hover:bg-(--fc-forma-primary-over) focus-visible:bg-(--fc-forma-primary-over) active:bg-(--fc-forma-primary-down)`
const primaryButtonClass = `${primaryPressableClass} border border-transparent ${primaryOutlineFocusClass} ${outlineOffsetClass}`

// secondary
const secondaryButtonClass = `${mutedHoverPressableClass} border border-(--fc-forma-border) hover:border-(--fc-forma-strong-border) ${primaryOutlineFocusClass}`
const secondaryButtonIconClass = 'size-5'

// event content
const eventMutedBgClass = 'bg-[color-mix(in_oklab,var(--fc-event-color)_30%,var(--fc-forma-background))]'
const eventMutedPressableClass = joinClassNames(
  eventMutedBgClass,
  'hover:bg-[color-mix(in_oklab,var(--fc-event-color)_35%,var(--fc-forma-background))]',
  'active:bg-[color-mix(in_oklab,var(--fc-event-color)_40%,var(--fc-forma-background))]',
)
const eventFaintBgClass = 'bg-[color-mix(in_oklab,var(--fc-event-color)_20%,var(--fc-forma-background))]'
const eventFaintPressableClass = joinClassNames(
  eventFaintBgClass,
  'hover:bg-[color-mix(in_oklab,var(--fc-event-color)_25%,var(--fc-forma-background))]',
  'active:bg-[color-mix(in_oklab,var(--fc-event-color)_30%,var(--fc-forma-background))]',
)

// interactive neutral foregrounds
const mutedFgPressableGroupClass = 'text-(--fc-forma-muted-foreground) group-hover:text-(--fc-forma-primary) group-focus-visible:text-(--fc-forma-primary)'

// transparent resizer for mouse
const blockPointerResizerClass = 'absolute hidden group-hover:block'
const rowPointerResizerClass = `${blockPointerResizerClass} inset-y-0 w-2`
const columnPointerResizerClass = `${blockPointerResizerClass} inset-x-0 h-2`

// circle resizer for touch
const blockTouchResizerClass = 'absolute size-2 border border-(--fc-event-color) rounded-full bg-(--fc-forma-background)'
const rowTouchResizerClass = `${blockTouchResizerClass} top-1/2 -mt-1`
const columnTouchResizerClass = `${blockTouchResizerClass} left-1/2 -ml-1`

const tallDayCellBottomClass = 'min-h-4'
const getShortDayCellBottomClass = (info: DayCellInfo) => joinClassNames(
  !info.isNarrow && 'min-h-px'
)

const getSlotClass = (info: { isMinor: boolean }) => joinClassNames(
  'border border-(--fc-forma-border)',
  info.isMinor && 'border-dotted',
)

const dayRowCommonClasses: CalendarOptions = {

  /* Day Row > List-Item Event
  ----------------------------------------------------------------------------------------------- */

  listItemEventClass: (info) => joinClassNames(
    'mb-px p-px rounded-sm',
    info.isNarrow ? 'mx-px' : 'mx-0.5',
    info.isSelected
      ? 'bg-(--fc-forma-muted)'
      : info.isInteractive
        ? mutedHoverPressableClass
        : mutedHoverClass,
  ),
  listItemEventBeforeClass: (info) => joinClassNames(
    'border-4 border-(--fc-event-color) rounded-full',
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

  rowEventClass: (info) => joinClassNames(info.isEnd && (info.isNarrow ? 'me-px' : 'me-0.5')),
  rowEventInnerClass: (info) => info.isNarrow ? 'py-px' : 'py-0.5',

  /* Day Row > More-Link
  ----------------------------------------------------------------------------------------------- */

  rowMoreLinkClass: (info) => joinClassNames(
    'mb-px border rounded-sm',
    info.isNarrow
      ? 'mx-px border-(--fc-forma-primary)'
      : 'mx-0.5 border-transparent self-start',
    mutedHoverPressableClass,
  ),
  rowMoreLinkInnerClass: (info) => (
    info.isNarrow
      ? `px-0.5 py-px ${xxsTextClass}`
      : 'px-1 py-0.5 text-xs'
  ),
}

export default {
  name: 'theme-forma',
  optionDefaults: {
    className: (info) => joinClassNames(
      'text-(--fc-forma-foreground) root-reset',
      !(info.borderlessTop || info.borderlessBottom || info.borderlessX) && 'rounded-sm shadow-xs',
    ),

    viewClass: (info) => {
      const hasBorderTop = !info.options.headerToolbar && !info.borderlessTop
      const hasBorderBottom = !info.options.footerToolbar && !info.borderlessBottom
      const hasBorderX = !info.borderlessX

      return joinClassNames(
        'bg-(--fc-forma-background) border-(--fc-forma-border)',
        hasBorderTop && 'border-t',
        hasBorderBottom && 'border-b',
        hasBorderX && 'border-x',
        (hasBorderTop && hasBorderX) && 'rounded-t-sm',
        (hasBorderBottom && hasBorderX) && 'rounded-b-sm',
        !info.isHeightAuto && 'overflow-hidden',
      )
    },

    /* Toolbar
    --------------------------------------------------------------------------------------------- */

    toolbarClass: (info) => joinClassNames(
      'p-3 flex flex-row flex-wrap items-center justify-between gap-3',
      'bg-(--fc-forma-background) border-(--fc-forma-border)',
      !info.borderlessX && 'border-x',
    ),
    headerToolbarClass: (info) => joinClassNames(
      'border-b',
      !info.borderlessTop && 'border-t',
      !(info.borderlessTop || info.borderlessX) && 'rounded-t-sm',
    ),
    footerToolbarClass: (info) => joinClassNames(
      'border-t',
      !info.borderlessBottom && 'border-b',
      !(info.borderlessBottom || info.borderlessX) && 'rounded-b-sm',
    ),
    toolbarSectionClass: "shrink-0 flex flex-row items-center gap-3",
    toolbarTitleClass: "text-xl",
    buttonGroupClass: "flex flex-row items-center",
    buttonClass: (info) => joinClassNames(
      'group py-1.5 rounded-sm flex flex-row items-center text-sm button-reset',
      info.isIconOnly ? 'px-2' : 'px-3',
      info.isIconOnly
        ? mutedHoverButtonClass
        : info.buttonGroup?.hasSelection
          ? info.isSelected
            ? selectedButtonClass
            : unselectedButtonClass
          : info.isPrimary
            ? primaryButtonClass
            : secondaryButtonClass,
    ),
    buttons: {
      prev: {
        iconContent: () => chevronDown(
          joinClassNames(secondaryButtonIconClass, 'rotate-90 [[dir=rtl]_&]:-rotate-90'),
        )
      },
      next: {
        iconContent: () => chevronDown(
          joinClassNames(secondaryButtonIconClass, '-rotate-90 [[dir=rtl]_&]:rotate-90'),
        )
      },
      prevYear: {
        iconContent: () => chevronDoubleLeft(
          joinClassNames(secondaryButtonIconClass, '[[dir=rtl]_&]:rotate-180'),
        )
      },
      nextYear: {
        iconContent: () => chevronDoubleLeft(
          joinClassNames(secondaryButtonIconClass, 'rotate-180 [[dir=rtl]_&]:rotate-0'),
        )
      },
    },

    /* Abstract Event
    --------------------------------------------------------------------------------------------- */

    eventShortHeight: 50,
    eventColor: "var(--fc-forma-event)",
    eventContrastColor: "var(--fc-forma-event-contrast)",
    eventClass: (info) => joinClassNames(
      info.isDragging && 'root-reset',
      info.event.url && 'link-reset',
      info.isSelected
        ? joinClassNames(
            outlineWidthClass,
            info.isDragging && 'shadow-lg',
          )
        : outlineWidthFocusClass,
      primaryOutlineColorClass,
    ),

    /* Background Event
    --------------------------------------------------------------------------------------------- */

    backgroundEventColor: "var(--fc-forma-background-event)",
    backgroundEventClass: "not-print:bg-[color-mix(in_oklab,var(--fc-event-color)_15%,transparent)] print:border-1 print:border-(--fc-event-color)",
    backgroundEventTitleClass: (info) => joinClassNames(
      'opacity-50 italic',
      info.isNarrow
        ? `p-1 ${xxsTextClass}`
        : 'p-2 text-xs',
    ),

    /* List-Item Event
    --------------------------------------------------------------------------------------------- */

    listItemEventClass: "items-center",
    listItemEventInnerClass: "text-(--fc-forma-foreground) flex flex-row items-center",

    /* Block Event
    --------------------------------------------------------------------------------------------- */

    blockEventClass: (info) => joinClassNames(
      'group relative border-(--fc-event-color) print:bg-white',
      info.isInteractive
        ? eventMutedPressableClass
        : eventMutedBgClass,
      (info.isDragging && !info.isSelected) && 'opacity-75',
      outlineOffsetClass,
    ),
    blockEventTimeClass: "whitespace-nowrap overflow-hidden shrink-1",
    blockEventTitleClass: "whitespace-nowrap overflow-hidden shrink-100",

    /* Row Event
    --------------------------------------------------------------------------------------------- */

    rowEventClass: (info) => joinClassNames(
      'mb-px not-print:py-px print:border-y items-center',
      info.isStart && 'border-s-6 rounded-s-sm',
      info.isEnd && 'not-print:pe-px print:border-e rounded-e-sm',
    ),
    rowEventBeforeClass: (info) => joinClassNames(
      info.isStartResizable ? joinClassNames(
        info.isSelected ? rowTouchResizerClass : rowPointerResizerClass,
        '-start-2',
      ) : (!info.isStart && !info.isNarrow) && joinClassNames(
        `ms-1 size-2 border-t-1 border-s-1 border-(--fc-forma-muted-foreground)`,
        '-rotate-45 [[dir=rtl]_&]:rotate-45',
      )
    ),
    rowEventAfterClass: (info) => joinClassNames(
      info.isEndResizable ? joinClassNames(
        info.isSelected ? rowTouchResizerClass : rowPointerResizerClass,
        '-end-1',
      ) : (!info.isEnd && !info.isNarrow) && joinClassNames(
        `me-1 size-2 border-t-1 border-e-1 border-(--fc-forma-muted-foreground)`,
        'rotate-45 [[dir=rtl]_&]:-rotate-45',
      )
    ),
    rowEventInnerClass: (info) => joinClassNames(
      'flex flex-row items-center',
      info.isNarrow ? xxsTextClass : 'text-xs',
    ),
    rowEventTimeClass: (info) => joinClassNames(
      'font-medium',
      info.isNarrow ? 'ps-0.5' : 'ps-1',
    ),
    rowEventTitleClass: (info) => (
      info.isNarrow ? 'px-0.5' : 'px-1'
    ),

    /* Column Event
    --------------------------------------------------------------------------------------------- */

    columnEventClass: (info) => joinClassNames(
      'border-s-6 not-print:pe-px print:border-e ring ring-(--fc-forma-background)',
      info.isStart && 'not-print:pt-px print:border-t rounded-t-sm',
      info.isEnd && 'mb-px not-print:pb-px print:border-b rounded-b-sm',
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
            info.isNarrow ? 'px-0.5' : 'px-1',
          )
    ),
    columnEventTimeClass: (info) => joinClassNames(
      !info.isShort && (info.isNarrow ? 'pt-0.5' : 'pt-1'),
      xxsTextClass,
    ),
    columnEventTitleClass: (info) => joinClassNames(
      !info.isShort && (info.isNarrow ? 'py-0.5' : 'py-1'),
      (info.isShort || info.isNarrow) ? xxsTextClass : 'text-xs',
    ),

    /* More-Link
    --------------------------------------------------------------------------------------------- */

    moreLinkClass: `${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    moreLinkInnerClass: "whitespace-nowrap overflow-hidden",
    columnMoreLinkClass: `mb-px border border-transparent print:border-black rounded-sm ${strongSolidPressableClass} print:bg-white ring ring-(--fc-forma-background) ${outlineOffsetClass}`,
    columnMoreLinkInnerClass: (info) => (
      info.isNarrow
        ? `p-0.5 ${xxsTextClass}`
        : 'p-1 text-xs'
    ),

    /* Day Header
    --------------------------------------------------------------------------------------------- */

    dayHeaderAlign: (info) => info.isNarrow ? 'center' : 'start',
    dayHeaderClass: (info) => joinClassNames(
      'justify-center',
      info.isToday && !info.level && 'relative',
      info.isDisabled && 'bg-(--fc-forma-faint)',
      info.inPopover
        ? 'border-b border-(--fc-forma-border) bg-(--fc-forma-faint)'
        : joinClassNames(
            info.isMajor ? 'border border-(--fc-forma-strong-border)' :
              !info.isNarrow && 'border border-(--fc-forma-border)',
          ),
    ),
    dayHeaderInnerClass: (info) => joinClassNames(
      'p-2 flex flex-col',
      info.isToday && info.level && 'relative',
      info.hasNavLink && `${mutedHoverPressableClass} ${outlineInsetClass}`,
    ),
    dayHeaderContent: (info) => (
      <>
        {info.isToday && (
          <div className="absolute top-0 inset-x-0 border-t-4 border-(--fc-forma-primary) pointer-events-none" />
        )}
        {info.dayNumberText && (
          <div
            className={joinClassNames(
              info.isToday && 'font-bold',
              info.isNarrow ? 'text-base' : 'text-lg',
            )}
          >{info.dayNumberText}</div>
        )}
        {info.weekdayText && (
          <div className="text-xs">{info.weekdayText}</div>
        )}
      </>
    ),

    /* Day Cell
    --------------------------------------------------------------------------------------------- */

    dayCellClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-forma-strong-border)' : 'border-(--fc-forma-border)',
      ((info.isOther || info.isDisabled) && !info.options.businessHours) && 'bg-(--fc-forma-faint)',
    ),
    dayCellTopClass: (info) => joinClassNames(
      info.isNarrow ? 'min-h-px' : 'min-h-0.5',
      'flex flex-row',
      ((info.isOther || info.isDisabled) && info.options.businessHours) && 'text-(--fc-forma-faint-foreground)',
    ),
    dayCellTopInnerClass: (info) => joinClassNames(
      'flex flex-row items-center justify-center whitespace-nowrap',
      info.isNarrow
        ? `my-px h-5 ${xxsTextClass}`
        : 'my-1 h-6 text-sm',
      info.isToday
        ? joinClassNames(
            'rounded-full',
            info.isNarrow ? 'ms-px' : 'ms-1',
            info.text === info.dayNumberText
              ? (info.isNarrow ? 'w-5' : 'w-6')
              : (info.isNarrow ? 'px-1' : 'px-2'),
            info.hasNavLink
              ? joinClassNames(primaryPressableClass, outlineOffsetClass)
              : primaryClass,
          )
        : joinClassNames(
            'rounded-e-sm',
            info.isNarrow ? 'px-1' : 'px-2',
            info.hasNavLink && mutedHoverPressableClass,
          ),
      info.monthText && 'font-bold',
    ),
    dayCellInnerClass: (info) => joinClassNames(info.inPopover && 'p-2'),

    /* Popover
    --------------------------------------------------------------------------------------------- */

    popoverFormat: { day: 'numeric', weekday: 'long' },
    popoverClass: "border border-(--fc-forma-border) bg-(--fc-forma-background) text-(--fc-forma-foreground) shadow-md min-w-55 root-reset",
    popoverCloseClass: `group absolute top-1 end-1 p-1 rounded-sm ${mutedHoverPressableClass} ${outlineWidthFocusClass} ${primaryOutlineColorClass} button-reset`,
    popoverCloseContent: () => dismiss(`size-5 ${mutedFgPressableGroupClass}`),

    /* Lane
    --------------------------------------------------------------------------------------------- */

    dayLaneClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-forma-strong-border)' : 'border-(--fc-forma-border)',
      info.isDisabled && 'bg-(--fc-forma-faint)',
    ),
    dayLaneInnerClass: (info) => (
      info.isStack
        ? 'm-1'
        : info.isNarrow ? 'mx-px' : 'ms-0.5 me-[2.5%]'
    ),
    slotLaneClass: getSlotClass,

    /* List Day
    --------------------------------------------------------------------------------------------- */

    listDayClass: (info) => joinClassNames(
      !info.isLast && 'border-b border-(--fc-forma-border)',
      'flex flex-row items-start',
    ),
    listDayHeaderClass: (info) => joinClassNames(
      'shrink-0 w-1/4 max-w-40 p-3 flex flex-col items-start',
      info.isToday && 'border-s-4 border-(--fc-forma-primary)',
    ),
    listDayHeaderInnerClass: (info) => joinClassNames(
      'my-0.5',
      !info.level
        ? joinClassNames('text-lg', info.isToday && 'font-bold')
        : 'text-xs',
      info.hasNavLink && 'hover:underline',
    ),
    listDayBodyClass: "grow min-w-0 p-4 gap-4",

    /* Single Month (in Multi-Month)
    --------------------------------------------------------------------------------------------- */

    singleMonthClass: (info) => joinClassNames(
      info.multiMonthColumns > 1 && 'm-4',
      (info.multiMonthColumns === 1 && !info.isLast) && 'border-(--fc-forma-border) border-b',
    ),
    singleMonthHeaderClass: (info) => joinClassNames(
      info.multiMonthColumns > 1
        ? 'pb-4'
        : 'py-2 border-b border-(--fc-forma-border) bg-(--fc-forma-background)',
      'items-center',
    ),
    singleMonthHeaderInnerClass: (info) => joinClassNames(
      'px-1 rounded-sm font-bold',
      info.hasNavLink && mutedHoverPressableClass,
      info.isNarrow ? 'text-base' : 'text-lg',
    ),

    /* Misc Table
    --------------------------------------------------------------------------------------------- */

    tableHeaderClass: 'bg-(--fc-forma-background)',
    fillerClass: "border border-(--fc-forma-border) opacity-50",
    dayNarrowWidth: 100,
    dayHeaderRowClass: "border border-(--fc-forma-border)",
    dayRowClass: "border border-(--fc-forma-border)",
    slotHeaderRowClass: "border border-(--fc-forma-border)",
    slotHeaderClass: getSlotClass,

    /* Misc Content
    --------------------------------------------------------------------------------------------- */

    navLinkClass: `${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    inlineWeekNumberClass: (info) => joinClassNames(
      'absolute end-0 whitespace-nowrap rounded-s-sm',
      info.isNarrow
        ? `top-0.5 my-px p-0.5 ${xxsTextClass}`
        : 'top-1 p-1 text-xs',
      info.hasNavLink
        ? mutedPressableClass
        : 'bg-(--fc-forma-muted)',
    ),
    nonBusinessHoursClass: "bg-(--fc-forma-faint)",
    highlightClass: "bg-(--fc-forma-highlight)",
    nowIndicatorLineClass: "-m-px border-1 border-(--fc-forma-primary)",
    nowIndicatorDotClass: "-m-[6px] border-6 border-(--fc-forma-primary) size-0 rounded-full ring-2 ring-(--fc-forma-background)",

    /* Resource Day Header
    --------------------------------------------------------------------------------------------- */

    resourceDayHeaderClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-forma-strong-border)' : 'border-(--fc-forma-border)',
    ),
    resourceDayHeaderInnerClass: (info) => joinClassNames(
      'm-2 flex flex-col',
      info.isNarrow ? 'text-xs' : 'text-sm',
    ),

    /* Resource Data Grid
    --------------------------------------------------------------------------------------------- */

    resourceColumnHeaderClass: "border border-(--fc-forma-border) justify-center",
    resourceColumnHeaderInnerClass: "m-2 text-sm",
    resourceColumnResizerClass: "absolute inset-y-0 w-[5px] end-[-3px]",
    resourceGroupHeaderClass: "border border-(--fc-forma-border) bg-(--fc-forma-muted)",
    resourceGroupHeaderInnerClass: "m-2 text-sm",
    resourceCellClass: "border border-(--fc-forma-border)",
    resourceCellInnerClass: "m-2 text-sm",
    resourceIndentClass: "ms-1 -me-1.5 justify-center",
    resourceExpanderClass: `group p-0.5 rounded-sm ${mutedHoverPressableClass} ${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    resourceExpanderContent: (info) => chevronDown(
      joinClassNames(
        `size-4 ${mutedFgPressableGroupClass}`,
        !info.isExpanded && '-rotate-90 [[dir=rtl]_&]:rotate-90',
      )
    ),
    resourceHeaderRowClass: "border border-(--fc-forma-border)",
    resourceRowClass: "border border-(--fc-forma-border)",
    resourceColumnDividerClass: "border-x border-(--fc-forma-border) ps-0.5 bg-(--fc-forma-muted)",

    /* Timeline Lane
    --------------------------------------------------------------------------------------------- */

    resourceGroupLaneClass: "border border-(--fc-forma-border) bg-(--fc-forma-muted)",
    resourceLaneClass: "border border-(--fc-forma-border)",
    resourceLaneBottomClass: (info) => info.options.eventOverlap && 'h-2.5',
    timelineBottomClass: "h-2.5",
  },
  views: {
    dayGrid: {
      ...dayRowCommonClasses,
      dayHeaderDividerClass: 'border-b border-(--fc-forma-border)',
      dayCellBottomClass: getShortDayCellBottomClass,
      backgroundEventInnerClass: 'flex flex-row justify-end',
    },
    dayGridMonth: {
      dayHeaderFormat: { weekday: 'long' },
    },
    multiMonth: {
      ...dayRowCommonClasses,
      dayHeaderDividerClass: (info) => joinClassNames(
        info.multiMonthColumns === 1 && 'border-b border-(--fc-forma-border)',
      ),
      dayCellBottomClass: getShortDayCellBottomClass,
      dayHeaderInnerClass: (info) => info.isNarrow && 'text-(--fc-forma-muted-foreground)',
      tableBodyClass: (info) => joinClassNames(
        info.multiMonthColumns > 1 && 'border border-(--fc-forma-border) rounded-sm overflow-hidden',
      ),
    },
    timeGrid: {
      ...dayRowCommonClasses,
      dayHeaderDividerClass: 'border-b border-(--fc-forma-border)',
      dayCellBottomClass: tallDayCellBottomClass,
      dayHeaderAlign: 'start',

      /* TimeGrid > Week Number Header
      ------------------------------------------------------------------------------------------- */

      weekNumberHeaderClass: 'items-end justify-end',
      weekNumberHeaderInnerClass: (info) => joinClassNames(
        'm-1 p-1 rounded-sm text-xs',
        info.hasNavLink && mutedHoverPressableClass,
      ),

      /* TimeGrid > All-Day Header
      ------------------------------------------------------------------------------------------- */

      allDayHeaderClass: 'items-center justify-end',
      allDayHeaderInnerClass: (info) => joinClassNames(
        'm-2 text-end',
        info.isNarrow ? xxsTextClass : 'text-xs',
      ),
      allDayDividerClass: 'border-b border-(--fc-forma-border)',

      /* TimeGrid > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderClass: 'justify-end',
      slotHeaderInnerClass: (info) => joinClassNames(
        'm-2',
        info.isNarrow ? xxsTextClass : 'text-xs',
      ),
      slotHeaderDividerClass: 'border-e border-(--fc-forma-border)',
    },
    list: {

      /* List-View > List-Item Event
      ------------------------------------------------------------------------------------------- */

      listItemEventClass: (info) => joinClassNames(
        'group border-s-6 border-(--fc-event-color) p-3 rounded-sm',
        info.isInteractive
          ? eventFaintPressableClass
          : eventFaintBgClass,
      ),
      listItemEventInnerClass: 'gap-2 text-sm',
      listItemEventTimeClass: 'shrink-0 w-1/2 max-w-40 whitespace-nowrap overflow-hidden text-ellipsis',
      listItemEventTitleClass: (info) => joinClassNames(
        'grow min-w-0 whitespace-nowrap overflow-hidden font-semibold',
        info.event.url && 'group-hover:underline',
      ),

      /* No-Events Screen
      ------------------------------------------------------------------------------------------- */

      noEventsClass: 'grow flex flex-col items-center justify-center',
      noEventsInnerClass: 'py-15',
    },
    timeline: {

      /* Timeline > Row Event
      ------------------------------------------------------------------------------------------- */

      rowEventClass: (info) => info.isEnd && 'me-px',
      rowEventInnerClass: (info) => (
        info.options.eventOverlap
          ? 'py-[0.1875rem]'
          : 'py-2'
      ),

      /* Timeline > More-Link
      ------------------------------------------------------------------------------------------- */

      rowMoreLinkClass: `me-px mb-px rounded-sm border border-transparent print:border-black ${strongSolidPressableClass} print:bg-white`,
      rowMoreLinkInnerClass: 'px-1 py-[0.1875rem] text-xs',

      /* Timeline > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderAlign: (info) => info.isTime ? 'start' : 'center',
      slotHeaderClass: (info) => joinClassNames(
        'justify-center',
        !info.level && 'overflow-hidden',
      ),
      slotHeaderInnerClass: (info) => joinClassNames(
        'm-2 text-sm',
        info.hasNavLink && 'hover:underline',
      ),
      slotHeaderDividerClass: 'border-b border-(--fc-forma-border)',
    },
  },
} as PluginInput

/* SVGs
------------------------------------------------------------------------------------------------- */

function chevronDown(className?: string) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M15.8527 7.64582C16.0484 7.84073 16.0489 8.15731 15.854 8.35292L10.389 13.8374C10.1741 14.0531 9.82477 14.0531 9.60982 13.8374L4.14484 8.35292C3.94993 8.15731 3.95049 7.84073 4.1461 7.64582C4.34171 7.4509 4.65829 7.45147 4.85321 7.64708L9.99942 12.8117L15.1456 7.64708C15.3406 7.45147 15.6571 7.4509 15.8527 7.64582Z"/></svg>
}

function chevronDoubleLeft(className?: string) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M11.3544 15.8527C11.1594 16.0484 10.8429 16.0489 10.6472 15.854L5.16276 10.389C4.94705 10.1741 4.94705 9.82477 5.16276 9.60982L10.6472 4.14484C10.8429 3.94993 11.1594 3.95049 11.3544 4.1461C11.5493 4.34171 11.5487 4.65829 11.3531 4.85321L6.18851 9.99942L11.3531 15.1456C11.5487 15.3406 11.5493 15.6571 11.3544 15.8527ZM15.3534 15.8527C15.1585 16.0484 14.8419 16.0489 14.6463 15.854L9.16178 10.389C8.94607 10.1741 8.94607 9.82477 9.16178 9.60982L14.6463 4.14484C14.8419 3.94993 15.1585 3.95049 15.3534 4.1461C15.5483 4.34171 15.5477 4.65829 15.3521 4.85321L10.1875 9.99942L15.3521 15.1456C15.5477 15.3406 15.5483 15.6571 15.3534 15.8527Z"/></svg>
}

function dismiss(className?: string) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4.08859 4.21569L4.14645 4.14645C4.32001 3.97288 4.58944 3.9536 4.78431 4.08859L4.85355 4.14645L10 9.293L15.1464 4.14645C15.32 3.97288 15.5894 3.9536 15.7843 4.08859L15.8536 4.14645C16.0271 4.32001 16.0464 4.58944 15.9114 4.78431L15.8536 4.85355L10.707 10L15.8536 15.1464C16.0271 15.32 16.0464 15.5894 15.9114 15.7843L15.8536 15.8536C15.68 16.0271 15.4106 16.0464 15.2157 15.9114L15.1464 15.8536L10 10.707L4.85355 15.8536C4.67999 16.0271 4.41056 16.0464 4.21569 15.9114L4.14645 15.8536C3.97288 15.68 3.9536 15.4106 4.08859 15.2157L4.14645 15.1464L9.293 10L4.14645 4.85355C3.97288 4.67999 3.9536 4.41056 4.08859 4.21569L4.14645 4.14645L4.08859 4.21569Z"/></svg>
}

