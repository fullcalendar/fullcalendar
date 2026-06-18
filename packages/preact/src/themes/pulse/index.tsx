import { PluginInput } from '../../plugin-system-struct'
import { CalendarOptions } from '../../options'
import { DayHeaderInfo, DayCellInfo } from '../../render-hook-misc'
import { joinClassNames } from '../../util/html'

// will get stripped during tsc transpile
import {} from '../scheduler-types-hack'

// usually 11px font / 12px line-height
const xxsTextClass = 'text-[0.6875rem]/[1.090909]'

// outline
const outlineWidthClass = 'outline-2'
const outlineWidthFocusClass = 'focus-visible:outline-2'
const outlineWidthGroupFocusClass = 'group-focus-visible:outline-2'
const outlineOffsetClass = 'outline-offset-2'
const outlineInsetClass = '-outline-offset-2'
const tertiaryOutlineColorClass = 'outline-(--fc-pulse-tertiary)'
const tertiaryOutlineFocusClass = `${outlineWidthFocusClass} ${tertiaryOutlineColorClass}`

// shadows
const smallBoxShadowClass = '[box-shadow:0_1px_2px_rgba(0,0,0,0.1)]'
const largeBoxShadowClass = '[box-shadow:0_1px_3px_rgba(0,0,0,0.2)]'

// neutral buttons
const strongSolidPressableClass = joinClassNames(
  '[background:linear-gradient(var(--fc-pulse-strong),var(--fc-pulse-strong))_var(--fc-pulse-background)]',
  'hover:[background:linear-gradient(var(--fc-pulse-stronger),var(--fc-pulse-stronger))_var(--fc-pulse-background)]',
  'active:[background:linear-gradient(var(--fc-pulse-strongest),var(--fc-pulse-strongest))_var(--fc-pulse-background)]',
)
const mutedHoverClass = 'hover:bg-(--fc-pulse-muted)'
const mutedHoverPressableClass = `${mutedHoverClass} active:bg-(--fc-pulse-strong) focus-visible:bg-(--fc-pulse-muted)`
const faintHoverClass = 'hover:bg-(--fc-pulse-faint)'
const faintHoverPressableClass = `${faintHoverClass} active:bg-(--fc-pulse-muted) focus-visible:bg-(--fc-pulse-faint)`

// controls
const selectedButtonClass = `bg-(--fc-pulse-selected) text-(--fc-pulse-selected-foreground) ${largeBoxShadowClass} ${tertiaryOutlineFocusClass}`
const unselectedButtonClass = `text-(--fc-pulse-unselected-foreground) ${mutedHoverPressableClass} ${tertiaryOutlineFocusClass}`

// primary *toolbar button*
const primaryClass = 'bg-(--fc-pulse-primary) text-(--fc-pulse-primary-foreground)'
const primaryPressableClass = `${primaryClass} hover:bg-(--fc-pulse-primary-over) active:bg-(--fc-pulse-primary-down)`
const primaryButtonClass = `${primaryPressableClass} border-transparent ${tertiaryOutlineFocusClass} ${outlineOffsetClass}`

// secondary *toolbar button*
const secondaryPressableClass = 'text-(--fc-pulse-secondary-foreground) hover:bg-(--fc-pulse-secondary-over) focus-visible:bg-(--fc-pulse-secondary-over) active:bg-(--fc-pulse-secondary-down)'
const secondaryButtonClass = `${secondaryPressableClass} ${tertiaryOutlineFocusClass} -outline-offset-1`
const secondaryButtonIconClass = 'size-5 text-(--fc-pulse-secondary-icon) group-hover:text-(--fc-pulse-secondary-icon-over) group-focus-visible:text-(--fc-pulse-secondary-icon-over)'

// tertiary
const tertiaryClass = 'bg-(--fc-pulse-tertiary) text-(--fc-pulse-tertiary-foreground)'
const tertiaryPressableClass = `${tertiaryClass} hover:bg-(--fc-pulse-tertiary-over) active:bg-(--fc-pulse-tertiary-down) focus-visible:bg-(--fc-pulse-tertiary-over)`
const tertiaryPressableGroupClass = `${tertiaryClass} group-hover:bg-(--fc-pulse-tertiary-over) group-active:bg-(--fc-pulse-tertiary-down) group-focus-visible:bg-(--fc-pulse-tertiary-over)`

// interactive neutral foregrounds
const mutedFgPressableGroupClass = 'text-(--fc-pulse-muted-foreground) group-hover:text-(--fc-pulse-foreground) group-focus-visible:text-(--fc-pulse-foreground)'

// transparent resizer for mouse
const blockPointerResizerClass = 'absolute hidden group-hover:block'
const rowPointerResizerClass = `${blockPointerResizerClass} inset-y-0 w-2`
const columnPointerResizerClass = `${blockPointerResizerClass} inset-x-0 h-2`

// circle resizer for touch
const blockTouchResizerClass = 'absolute size-2 border border-(--fc-event-color) bg-(--fc-pulse-background) rounded-full'
const rowTouchResizerClass = `${blockTouchResizerClass} top-1/2 -mt-1`
const columnTouchResizerClass = `${blockTouchResizerClass} left-1/2 -ml-1`

const tallDayCellBottomClass = 'min-h-3'
const getShortDayCellBottomClass = (info: DayCellInfo) => joinClassNames(
  !info.isNarrow && 'min-h-0.5'
)

const dayRowCommonClasses: CalendarOptions = {

  /* Day Row > List-Item Event
  ----------------------------------------------------------------------------------------------- */

  listItemEventClass: (info) => joinClassNames(
    'mb-px p-px rounded-sm',
    info.isNarrow ? 'mx-0.5' : 'mx-1',
    info.isSelected
      ? 'bg-(--fc-pulse-muted)'
      : info.isInteractive
        ? mutedHoverPressableClass
        : mutedHoverClass,
  ),

  listItemEventInnerClass: (info) => joinClassNames(
    'flex flex-row items-center justify-between',
    info.isNarrow
      ? `py-px ${xxsTextClass}`
      : 'py-0.5 text-xs',
  ),

  listItemEventTimeClass: (info) => joinClassNames(
    info.isNarrow ? 'px-px' : 'px-0.5',
    'order-1 whitespace-nowrap overflow-hidden shrink-1',
  ),

  listItemEventTitleClass: (info) => joinClassNames(
    info.isNarrow ? 'px-px' : 'px-0.5',
    'font-medium whitespace-nowrap overflow-hidden shrink-100',
    info.timeText && 'text-ellipsis',
  ),

  /* Day Row > Row Event
  ----------------------------------------------------------------------------------------------- */

  rowEventClass: (info) => joinClassNames(
    info.isStart && (info.isNarrow ? 'ms-0.5' : 'ms-1'),
    info.isEnd && (info.isNarrow ? 'me-0.5' : 'me-1'),
  ),

  rowEventInnerClass: (info) => info.isNarrow ? 'py-px' : 'py-0.5',

  /* Day Row > More-Link
  ----------------------------------------------------------------------------------------------- */

  rowMoreLinkClass: (info) => joinClassNames(
    'mb-px border rounded-sm',
    info.isNarrow
      ? `mx-0.5 border-(--fc-pulse-primary) ${mutedHoverPressableClass}`
      : 'self-start mx-1 border-transparent bg-(--fc-pulse-muted) hover:bg-(--fc-pulse-strong) active:bg-(--fc-pulse-stronger)',
  ),

  rowMoreLinkInnerClass: (info) => joinClassNames(
    info.isNarrow
      ? `p-px ${xxsTextClass}`
      : 'p-0.5 text-xs',
    'text-(--fc-pulse-foreground)',
  ),
}

export default {
  name: 'theme-pulse',
  optionDefaults: {
    className: "gap-6 root-reset",
    viewClass: (info) => {
      const hasBorderTop = info.options.headerToolbar || !info.borderlessTop
      const hasBorderBottom = info.options.footerToolbar || !info.borderlessBottom
      const hasBorderX = !info.borderlessX
      return joinClassNames(
        'border-(--fc-pulse-border)',
        hasBorderTop && 'border-t',
        hasBorderBottom && 'border-b',
        hasBorderX && 'border-x',
        (hasBorderTop && hasBorderX) && 'rounded-t-sm',
        (hasBorderBottom && hasBorderX) && 'rounded-b-sm',
        (hasBorderTop && hasBorderBottom && hasBorderX) && smallBoxShadowClass,
        !info.isHeightAuto && 'overflow-hidden',
      )
    },

    /* Toolbar
    --------------------------------------------------------------------------------------------- */

    toolbarClass: (info) => joinClassNames(
      'flex flex-row flex-wrap items-center justify-between gap-5',
      info.borderlessX && 'px-3',
    ),
    toolbarSectionClass: "shrink-0 flex flex-row items-center gap-5",
    toolbarTitleClass: "text-2xl font-bold text-(--fc-pulse-foreground)",
    buttonGroupClass: (info) => joinClassNames(
      'py-px rounded-sm flex flex-row items-center',
      info.hasSelection
        ? 'bg-(--fc-pulse-unselected)'
        : `bg-(--fc-pulse-secondary) ${smallBoxShadowClass}`
    ),
    buttonClass: (info) => joinClassNames(
      'group py-2 flex flex-row items-center text-sm button-reset',
      info.isIconOnly ? 'px-2.5' : 'px-4',
      info.buttonGroup?.hasSelection
        ? joinClassNames(
            'rounded-sm',
            info.isSelected
              ? selectedButtonClass
              : joinClassNames(
                  unselectedButtonClass,
                  '-my-px border-y border-transparent',
                )
          )
        : joinClassNames(
            'border',
            info.buttonGroup
              ? '-my-px not-first:-ms-px first:rounded-s-sm last:rounded-e-sm'
              : 'rounded-sm',
            info.isPrimary
              ? joinClassNames(
                  primaryButtonClass,
                  !info.buttonGroup && largeBoxShadowClass,
                )
              : joinClassNames(
                  secondaryButtonClass,
                  'border-(--fc-pulse-strong-border)',
                  !info.buttonGroup
                    ? `bg-(--fc-pulse-secondary) ${smallBoxShadowClass}`
                    : 'not-first:border-s-transparent not-last:border-e-(--fc-pulse-border)',
                )
          ),
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
        iconContent: () => chevronsLeft(
          joinClassNames(secondaryButtonIconClass, '[[dir=rtl]_&]:rotate-180'),
        )
      },
      nextYear: {
        iconContent: () => chevronsLeft(
          joinClassNames(secondaryButtonIconClass, 'rotate-180 [[dir=rtl]_&]:rotate-0'),
        )
      },
    },

    /* Abstract Event
    --------------------------------------------------------------------------------------------- */

    eventShortHeight: 50,
    eventColor: "var(--fc-pulse-event)",
    eventContrastColor: "var(--fc-pulse-event-contrast)",
    eventClass: (info) => joinClassNames(
      info.isDragging && 'root-reset',
      info.event.url && 'link-reset',
      info.isSelected
        ? joinClassNames(
            outlineWidthClass,
            info.isDragging && 'shadow-lg',
          )
        : outlineWidthFocusClass,
      tertiaryOutlineColorClass,
    ),

    /* Background Event
    --------------------------------------------------------------------------------------------- */

    backgroundEventColor: "var(--fc-pulse-background-event)",
    backgroundEventClass: "not-print:bg-[color-mix(in_oklab,var(--fc-event-color)_15%,transparent)] print:border-1 print:border-(--fc-event-color)",
    backgroundEventTitleClass: (info) => joinClassNames(
      'opacity-50 italic',
      (info.isNarrow || info.isShort)
        ? `p-1 ${xxsTextClass}`
        : 'p-2 text-xs',
      'text-(--fc-pulse-foreground)',
    ),

    /* List-Item Event
    --------------------------------------------------------------------------------------------- */

    listItemEventTitleClass: "text-(--fc-pulse-foreground)",
    listItemEventTimeClass: "text-(--fc-pulse-muted-foreground)",

    /* Block Event
    --------------------------------------------------------------------------------------------- */

    blockEventClass: (info) => joinClassNames(
      'group relative border-transparent print:border-(--fc-event-color) bg-(--fc-event-color) print:bg-white hover:bg-[color-mix(in_oklab,var(--fc-event-color)_92%,var(--fc-event-contrast-color))]',
      info.isInteractive && 'active:bg-[color-mix(in_oklab,var(--fc-event-color)_85%,var(--fc-event-contrast-color))]',
      (info.isDragging && !info.isSelected) && 'opacity-75',
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
    rowEventTimeClass: (info) => (
      info.isNarrow ? 'ps-0.5' : 'ps-1'
    ),
    rowEventTitleClass: (info) => joinClassNames(
      info.isNarrow ? 'px-0.5' : 'px-1',
      'font-medium',
    ),

    /* Column Event
    --------------------------------------------------------------------------------------------- */

    columnEventClass: (info) => joinClassNames(
      'border-x ring ring-(--fc-pulse-background)',
      info.isStart && joinClassNames('border-t rounded-t-lg', info.isNarrow ? 'mt-px' : 'mt-0.5'),
      info.isEnd && joinClassNames('border-b rounded-b-lg', info.isNarrow ? 'mb-px' : 'mb-0.5'),
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
        ? 'flex-row items-center gap-1 p-1'
        : joinClassNames(
            'flex-col',
            info.isNarrow ? 'px-1 py-0.5' : 'px-2 py-1',
          ),
      (info.isNarrow || info.isShort) ? xxsTextClass : 'text-xs',
    ),
    columnEventTimeClass: (info) => joinClassNames(
      !info.isShort && (info.isNarrow ? 'pt-0.5' : 'pt-1')
    ),
    columnEventTitleClass: (info) => joinClassNames(
      !info.isShort && (info.isNarrow ? 'py-0.5' : 'py-1'),
      'font-medium',
    ),

    /* More-Link
    --------------------------------------------------------------------------------------------- */

    moreLinkClass: `${outlineWidthFocusClass} ${tertiaryOutlineColorClass}`,
    moreLinkInnerClass: "whitespace-nowrap overflow-hidden",
    columnMoreLinkClass: `my-0.5 border border-transparent print:border-black rounded-md ${strongSolidPressableClass} print:bg-white ring ring-(--fc-pulse-background)`,
    columnMoreLinkInnerClass: (info) => joinClassNames(
      info.isNarrow
        ? `p-0.5 ${xxsTextClass}`
        : 'p-1 text-xs',
      'text-(--fc-pulse-foreground)',
    ),

    /* Day Header
    --------------------------------------------------------------------------------------------- */

    dayHeaderClass: (info) => joinClassNames(
      'justify-center',
      info.inPopover ? 'border-b border-(--fc-pulse-border) bg-(--fc-pulse-faint)' :
        info.isMajor && 'border border-(--fc-pulse-strong-border)',
    ),
    dayHeaderInnerClass: (info) => joinClassNames(
      'flex flex-row items-center',
      info.isNarrow ? 'text-xs' : 'text-sm',
      info.inPopover ? joinClassNames(
        'm-1.5 px-1 py-0.5 rounded-sm font-semibold',
        'text-(--fc-pulse-foreground)',
        info.hasNavLink && mutedHoverPressableClass,
      ) : !info.dayNumberText ? joinClassNames(
        'mx-0.5 my-1.5 py-0.5 px-1.5 rounded-sm',
        'text-(--fc-pulse-muted-foreground)',
        info.hasNavLink && mutedHoverPressableClass,
      ) : !info.isToday ? joinClassNames(
        'mx-2 my-2.5 h-6 px-1.5 rounded-sm',
        'text-(--fc-pulse-muted-foreground)',
        info.hasNavLink && mutedHoverPressableClass,
      ) : (
        'group mx-2 my-2 h-7 outline-none'
      )
    ),
    dayHeaderContent: (info: DayHeaderInfo) => (
      (info.inPopover || !info.dayNumberText || !info.isToday) ? (
        <>{info.text}</>
      ) : (
        <>
          {info.textParts.map((textPart, i) => (
            <span
              key={i}
              className={joinClassNames(
                'whitespace-pre',
                (textPart.type === 'day' && info.isToday)
                  ? joinClassNames(
                      'first:-ms-1 last:-me-1 size-7 rounded-full font-semibold',
                      'flex flex-row items-center justify-center',
                      info.hasNavLink
                        ? `${tertiaryPressableGroupClass} ${outlineWidthGroupFocusClass} ${outlineOffsetClass} ${tertiaryOutlineColorClass}`
                        : tertiaryClass,
                    )
                  : 'text-(--fc-pulse-muted-foreground)',
              )}
            >{textPart.value}</span>
          ))}
        </>
      )
    ),

    /* Day Cell
    --------------------------------------------------------------------------------------------- */

    dayCellClass: (info) => joinClassNames(
      'border',
      info.isMajor
        ? 'border-(--fc-pulse-strong-border)'
        : 'border-(--fc-pulse-border)',
    ),
    dayCellTopClass: (info) => joinClassNames(
      info.isNarrow ? 'min-h-0.5' : 'min-h-1',
      'flex flex-row justify-end',
    ),
    dayCellTopInnerClass: (info) => joinClassNames(
      'flex flex-row items-center',
      info.isNarrow
        ? `my-px h-5 ${xxsTextClass}`
        : 'my-1 h-6 text-sm',
      !info.isToday
        ? joinClassNames(
            'rounded-s-sm whitespace-nowrap',
            !info.isOther && 'font-semibold',
            info.isNarrow ? 'px-1' : 'px-2',
            info.monthText ? 'text-(--fc-pulse-foreground)' : 'text-(--fc-pulse-muted-foreground)',
            info.hasNavLink && mutedHoverPressableClass,
          )
        : joinClassNames(
            'group outline-none',
            info.isNarrow
              ? 'mx-px'
              : 'mx-2',
          )
    ),
    dayCellTopContent: (info: DayCellInfo) => (
      !info.isToday ? (
        <>{info.text}</>
      ) : (
        <>
          {info.textParts.map((textPart, i) => (
            <span
              key={i}
              className={joinClassNames(
                'whitespace-pre',
                (textPart.type === 'day' && info.isToday)
                  ? joinClassNames(
                      'rounded-full font-semibold',
                      'flex flex-row items-center justify-center',
                      info.isNarrow
                        ? 'size-5'
                        : 'size-6 first:-ms-1 last:-me-1',
                      info.hasNavLink
                        ? `${tertiaryPressableGroupClass} ${outlineWidthGroupFocusClass} ${outlineOffsetClass} ${tertiaryOutlineColorClass}`
                        : tertiaryClass,
                    )
                  : (info.monthText ? 'text-(--fc-pulse-foreground)' : 'text-(--fc-pulse-muted-foreground)'),
              )}
            >{textPart.value}</span>
          ))}
        </>
      )
    ),
    dayCellInnerClass: (info) => joinClassNames(info.inPopover && 'p-2'),

    /* Popover
    --------------------------------------------------------------------------------------------- */

    popoverClass: "bg-(--fc-pulse-background) border border-(--fc-pulse-strong-border) rounded-sm overflow-hidden shadow-md m-1 min-w-55 root-reset",
    popoverCloseClass: `group absolute top-1.5 end-1.5 p-0.5 rounded-sm ${mutedHoverPressableClass} ${outlineWidthFocusClass} ${tertiaryOutlineColorClass} button-reset`,
    popoverCloseContent: () => x(`size-5 ${mutedFgPressableGroupClass}`),

    /* Lane
    --------------------------------------------------------------------------------------------- */

    dayLaneClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-pulse-strong-border)' : 'border-(--fc-pulse-border)',
      info.isDisabled && 'bg-(--fc-pulse-faint)',
    ),
    dayLaneInnerClass: (info) => (
      info.isStack
        ? 'm-1'
        : info.isNarrow ? 'mx-px' : 'mx-0.5'
    ),
    slotLaneClass: (info) => joinClassNames(
      'border border-(--fc-pulse-border)',
      info.isMinor && 'border-dotted',
    ),

    /* List Day
    --------------------------------------------------------------------------------------------- */

    listDayClass: (info) => joinClassNames(
      'flex flex-col',
      !info.isLast && 'border-b border-(--fc-pulse-border)',
    ),
    listDayHeaderClass: "-mb-px border-b border-(--fc-pulse-border) [background:linear-gradient(var(--fc-pulse-faint),var(--fc-pulse-faint))_var(--fc-pulse-background)] text-(--fc-pulse-foreground) flex flex-row items-center justify-between",
    listDayHeaderInnerClass: (info) => joinClassNames(
      'm-1.5 px-1.5 py-0.5 rounded-sm text-sm',
      !info.level && 'font-semibold',
      (!info.level && info.isToday)
        ? info.hasNavLink
            ? joinClassNames(tertiaryPressableClass, outlineOffsetClass)
            : tertiaryClass
        : info.hasNavLink && mutedHoverPressableClass,
    ),
    listDayBodyClass: "mt-px px-1.5 py-2 gap-2",

    /* Single Month (in Multi-Month)
    --------------------------------------------------------------------------------------------- */

    singleMonthClass: (info) => joinClassNames(
      info.multiMonthColumns > 1 && 'm-3',
      (info.multiMonthColumns === 1 && !info.isLast) && 'border-b border-(--fc-pulse-border)',
    ),
    singleMonthHeaderClass: (info) => joinClassNames(
      info.multiMonthColumns > 1
        ? 'pb-2'
        : 'py-1 border-b border-(--fc-pulse-border) bg-(--fc-pulse-background)',
      'items-center',
    ),
    singleMonthHeaderInnerClass: (info) => joinClassNames(
      'px-1.5 py-0.5 rounded-sm text-base text-(--fc-pulse-foreground) font-semibold',
      info.hasNavLink && mutedHoverPressableClass,
    ),

    /* Misc Table
    --------------------------------------------------------------------------------------------- */

    tableBodyClass: 'bg-(--fc-pulse-background)',
    fillerClass: "border border-(--fc-pulse-border) opacity-50",
    dayNarrowWidth: 100,
    dayHeaderRowClass: "border border-(--fc-pulse-border)",
    dayRowClass: "border border-(--fc-pulse-border)",
    slotHeaderRowClass: "border border-(--fc-pulse-border)",
    slotHeaderInnerClass: "text-(--fc-pulse-muted-foreground)",

    /* Misc Content
    --------------------------------------------------------------------------------------------- */

    navLinkClass: `${outlineWidthFocusClass} ${tertiaryOutlineColorClass}`,
    inlineWeekNumberClass: (info) => joinClassNames(
      'absolute start-0 whitespace-nowrap rounded-e-sm text-(--fc-pulse-muted-foreground)',
      info.isNarrow
        ? `top-0.5 my-px p-0.5 ${xxsTextClass}`
        : 'top-1 p-1 text-xs',
      info.hasNavLink && mutedHoverPressableClass,
    ),
    highlightClass: "bg-(--fc-pulse-highlight)",
    nonBusinessHoursClass: "bg-(--fc-pulse-faint)",
    nowIndicatorLineClass: "-m-px border-1 border-(--fc-pulse-now)",
    nowIndicatorDotClass: "-m-[6px] border-6 border-(--fc-pulse-now) size-0 rounded-full ring-2 ring-(--fc-pulse-background)",

    /* Resource Day Header
    --------------------------------------------------------------------------------------------- */

    resourceDayHeaderAlign: "center",
    resourceDayHeaderClass: (info) => joinClassNames(info.isMajor && 'border border-(--fc-pulse-strong-border)'),
    resourceDayHeaderInnerClass: (info) => joinClassNames(
      'm-2 flex flex-row items-center text-(--fc-pulse-muted-foreground)',
      info.isNarrow ? 'text-xs' : 'text-sm',
    ),

    /* Resource Data Grid
    --------------------------------------------------------------------------------------------- */

    resourceColumnHeaderClass: "border border-(--fc-pulse-border) justify-center",
    resourceColumnHeaderInnerClass: "m-2 text-(--fc-pulse-foreground) text-sm",
    resourceColumnResizerClass: "absolute inset-y-0 w-[5px] end-[-3px]",
    resourceGroupHeaderClass: "border border-(--fc-pulse-border) bg-(--fc-pulse-muted)",
    resourceGroupHeaderInnerClass: "m-2 text-(--fc-pulse-foreground) text-sm",
    resourceCellClass: "border border-(--fc-pulse-border)",
    resourceCellInnerClass: "m-2 text-(--fc-pulse-foreground) text-sm",
    resourceIndentClass: "ms-1 -me-1.5 justify-center",
    resourceExpanderClass: `group p-0.5 rounded-sm ${mutedHoverPressableClass} ${outlineWidthFocusClass} ${tertiaryOutlineColorClass}`,
    resourceExpanderContent: (info) => chevronDown(
      joinClassNames(
        `size-5 ${mutedFgPressableGroupClass}`,
        !info.isExpanded && '-rotate-90 [[dir=rtl]_&]:rotate-90'
      )
    ),
    resourceHeaderRowClass: "border border-(--fc-pulse-border)",
    resourceRowClass: "border border-(--fc-pulse-border)",
    resourceColumnDividerClass: "border-e border-(--fc-pulse-strong-border)",

    /* Timeline Lane
    --------------------------------------------------------------------------------------------- */

    resourceGroupLaneClass: "border border-(--fc-pulse-border) bg-(--fc-pulse-muted)",
    resourceLaneClass: "border border-(--fc-pulse-border)",
    resourceLaneBottomClass: (info) => joinClassNames(info.options.eventOverlap && 'h-2'),
    timelineBottomClass: "h-2",
  },
  views: {
    dayGrid: {
      ...dayRowCommonClasses,
      tableHeaderClass: 'bg-(--fc-pulse-background)',
      dayHeaderAlign: (info) => info.inPopover ? 'start' : info.isNarrow ? 'center' : 'end',
      dayHeaderDividerClass: 'border-b border-(--fc-pulse-border)',
      dayCellBottomClass: getShortDayCellBottomClass,
    },
    multiMonth: {
      ...dayRowCommonClasses,
      viewClass: 'bg-(--fc-pulse-faint)',
      tableHeaderClass: (info) => joinClassNames(
        info.multiMonthColumns === 1 && 'bg-(--fc-pulse-background)'
      ),
      tableBodyClass: (info) => joinClassNames(
        info.multiMonthColumns > 1 && 'border border-(--fc-pulse-border) rounded-sm overflow-hidden'
      ),
      dayHeaderAlign: (info) => info.inPopover ? 'start' : info.isNarrow ? 'center' : 'end',
      dayHeaderDividerClass: (info) => joinClassNames(info.multiMonthColumns === 1 && 'border-b border-(--fc-pulse-border)'),
      dayCellBottomClass: getShortDayCellBottomClass,
    },
    timeGrid: {
      ...dayRowCommonClasses,
      tableHeaderClass: 'bg-(--fc-pulse-background)',
      dayHeaderAlign: (info) => info.inPopover ? 'start' : 'center',
      dayHeaderDividerClass: (info) => joinClassNames(
        'border-b',
        info.options.allDaySlot
          ? 'border-(--fc-pulse-border)'
          : 'border-(--fc-pulse-strong-border) not-print:shadow-sm'
      ),
      dayCellBottomClass: tallDayCellBottomClass,

      /* TimeGrid > Week Number Header
      ------------------------------------------------------------------------------------------- */

      weekNumberHeaderClass: 'items-center justify-end',
      weekNumberHeaderInnerClass: (info) => joinClassNames(
        'mx-0.5 h-6 px-1.5 text-(--fc-pulse-muted-foreground) flex flex-row items-center rounded-sm',
        info.isNarrow ? 'text-xs' : 'text-sm',
        info.hasNavLink && mutedHoverPressableClass,
      ),

      /* TimeGrid > All-Day Header
      ------------------------------------------------------------------------------------------- */

      allDayHeaderClass: 'items-center',
      allDayHeaderInnerClass: (info) => joinClassNames(
        'm-2 text-(--fc-pulse-muted-foreground)',
        info.isNarrow ? xxsTextClass : 'text-xs',
      ),
      allDayDividerClass: 'border-b border-(--fc-pulse-strong-border) not-print:shadow-sm',

      /* TimeGrid > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderClass: 'justify-end',
      slotHeaderInnerClass: (info) => joinClassNames(
        'relative m-2',
        info.isNarrow
          ? `-top-3.5 ${xxsTextClass}`
          : '-top-4 text-xs',
        info.isFirst && 'hidden',
      ),
      slotHeaderDividerClass: 'border-e border-(--fc-pulse-border)',
    },
    list: {
      viewClass: 'bg-(--fc-pulse-background)',

      /* List-View > List-Item Event
      ------------------------------------------------------------------------------------------- */

      listItemEventClass: (info) => joinClassNames(
        'group py-1 rounded-sm',
        info.isInteractive
          ? joinClassNames(faintHoverPressableClass, outlineInsetClass)
          : faintHoverClass,
      ),
      listItemEventBeforeClass: 'w-1.5 bg-(--fc-event-color) rounded-full',
      listItemEventInnerClass: '[display:contents]',
      listItemEventTimeClass: '-order-1 shrink-0 w-1/2 max-w-60 px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis text-sm',
      listItemEventTitleClass: (info) => joinClassNames(
        'grow min-w-0 px-4 py-2 whitespace-nowrap overflow-hidden text-sm',
        info.event.url && 'group-hover:underline',
      ),

      /* No-Events Screen
      ------------------------------------------------------------------------------------------- */

      noEventsClass: 'grow flex flex-col items-center justify-center',
      noEventsInnerClass: 'py-15 text-(--fc-pulse-muted-foreground)',
    },
    timeline: {
      tableHeaderClass: 'bg-(--fc-pulse-background)',

      /* Timeline > Row Event
      ------------------------------------------------------------------------------------------- */

      rowEventClass: (info) => joinClassNames(info.isEnd && 'me-px'),
      rowEventInnerClass: (info) => info.options.eventOverlap ? 'py-1' : 'py-2',

      /* Timeline > More-Link
      ------------------------------------------------------------------------------------------- */

      rowMoreLinkClass: `me-px mb-px border border-transparent print:border-black rounded-sm ${strongSolidPressableClass} print:bg-white`,
      rowMoreLinkInnerClass: 'p-1 text-(--fc-pulse-foreground) text-xs',

      /* Timeline > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderAlign: (info) => info.isTime ? 'start' : 'center',
      slotHeaderClass: (info) => joinClassNames(
        info.level > 0 && 'border border-(--fc-pulse-border)',
        'justify-center',
      ),
      slotHeaderInnerClass: (info) => joinClassNames(
        'm-2 text-sm',
        info.isTime && joinClassNames(
          'relative -start-3',
          info.isFirst && 'hidden',
        ),
        info.hasNavLink && 'hover:underline',
      ),
      slotHeaderDividerClass: 'border-b border-(--fc-pulse-strong-border) shadow-sm',
    },
  },
} as PluginInput

/* SVGs
------------------------------------------------------------------------------------------------- */

function chevronDown(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
}

function chevronsLeft(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
}

function x(className?: string) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}
