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
const primaryOutlineColorClass = 'outline-(--fc-breezy-primary)'
const primaryOutlineFocusClass = `${outlineWidthFocusClass} ${primaryOutlineColorClass}`

// neutral buttons
const strongSolidPressableClass = joinClassNames(
  '[background:linear-gradient(var(--fc-breezy-strong),var(--fc-breezy-strong))_var(--fc-breezy-background)]',
  'hover:[background:linear-gradient(var(--fc-breezy-stronger),var(--fc-breezy-stronger))_var(--fc-breezy-background)]',
  'active:[background:linear-gradient(var(--fc-breezy-strongest),var(--fc-breezy-strongest))_var(--fc-breezy-background)]',
)
const mutedHoverClass = 'hover:bg-(--fc-breezy-muted)'
const mutedHoverPressableClass = `${mutedHoverClass} focus-visible:bg-(--fc-breezy-muted)`
const faintHoverClass = 'hover:bg-(--fc-breezy-faint)'
const faintHoverPressableClass = `${faintHoverClass} active:bg-(--fc-breezy-muted) focus-visible:bg-(--fc-breezy-faint)`

// controls
const selectedClass = `bg-(--fc-breezy-selected) text-(--fc-breezy-strong-foreground) ${primaryOutlineFocusClass}`
const unselectedClass = `text-(--fc-breezy-muted-foreground) hover:text-(--fc-breezy-strong-foreground) ${primaryOutlineFocusClass}`

// primary
const primaryClass = 'bg-(--fc-breezy-primary) text-(--fc-breezy-primary-foreground)'
const primaryPressableClass = `${primaryClass} hover:bg-(--fc-breezy-primary-over)`
const primaryPressableGroupClass = `${primaryClass} group-hover:bg-(--fc-breezy-primary-over)`
const primaryButtonClass = `${primaryPressableClass} border-transparent ${primaryOutlineFocusClass} ${outlineOffsetClass}`

// secondary
const secondaryClass = 'text-(--fc-breezy-secondary-foreground) bg-(--fc-breezy-secondary)'
const secondaryPressableClass = `${secondaryClass} hover:bg-(--fc-breezy-secondary-over)`
const secondaryButtonClass = `${secondaryPressableClass} border-(--fc-breezy-secondary-border) ${primaryOutlineFocusClass} -outline-offset-1`
const secondaryButtonIconClass = 'size-5 text-(--fc-breezy-secondary-icon) group-hover:text-(--fc-breezy-secondary-icon-over) group-focus-visible:text-(--fc-breezy-secondary-icon-over)'

// event content
const eventMutedFgClass = 'text-[color-mix(in_oklab,var(--fc-event-color)_50%,var(--fc-breezy-foreground))]'
const eventFaintBgClass = 'bg-[color-mix(in_oklab,var(--fc-event-color)_20%,var(--fc-breezy-background))]'
const eventFaintPressableClass = joinClassNames(
  eventFaintBgClass,
  'hover:bg-[color-mix(in_oklab,var(--fc-event-color)_25%,var(--fc-breezy-background))]',
  'active:bg-[color-mix(in_oklab,var(--fc-event-color)_30%,var(--fc-breezy-background))]',
)

// interactive neutral foregrounds
const mutedFgPressableGroupClass = 'text-(--fc-breezy-muted-foreground) group-hover:text-(--fc-breezy-foreground) group-focus-visible:text-(--fc-breezy-foreground)'

// transparent resizer for mouse
const blockPointerResizerClass = 'absolute hidden group-hover:block'
const rowPointerResizerClass = `${blockPointerResizerClass} inset-y-0 w-2`
const columnPointerResizerClass = `${blockPointerResizerClass} inset-x-0 h-2`

// circle resizer for touch
const blockTouchResizerClass = 'absolute size-2 border border-(--fc-event-color) bg-(--fc-breezy-background) rounded-full'
const rowTouchResizerClass = `${blockTouchResizerClass} top-1/2 -mt-1`
const columnTouchResizerClass = `${blockTouchResizerClass} left-1/2 -ml-1`

const getNormalDayHeaderBorderClass = (info: DayHeaderInfo) => joinClassNames(
  !info.inPopover && (
    info.isMajor ? 'border border-(--fc-breezy-strong-border)' :
      !info.isNarrow && 'border border-(--fc-breezy-border)'
  )
)

const getMutedDayHeaderBorderClass = (info: DayHeaderInfo) => joinClassNames(
  !info.inPopover && (
    info.isMajor ? 'border border-(--fc-breezy-strong-border)' :
      !info.isNarrow && 'border border-(--fc-breezy-muted-border)'
  )
)

const getNormalDayCellBorderColorClass = (info: DayCellInfo) => (
  info.isMajor ? 'border-(--fc-breezy-strong-border)' : 'border-(--fc-breezy-border)'
)

const getMutedDayCellBorderColorClass = (info: DayCellInfo) => (
  info.isMajor ? 'border-(--fc-breezy-strong-border)' : 'border-(--fc-breezy-muted-border)'
)

const tallDayCellBottomClass = 'min-h-3'
const getShortDayCellBottomClass = (info: DayCellInfo) => joinClassNames(
  !info.isNarrow && 'min-h-px'
)

const mutedHoverButtonClass = joinClassNames(
  mutedHoverPressableClass,
  outlineWidthFocusClass,
  primaryOutlineColorClass,
)

const dayRowCommonClasses: CalendarOptions = {

  /* Day Row > List-Item Event
  ----------------------------------------------------------------------------------------------- */

  listItemEventClass: (info) => joinClassNames(
    'mb-px p-px',
    info.isNarrow
      ? 'mx-px rounded-sm'
      : 'mx-1 rounded-md',
    info.isSelected
      ? 'bg-(--fc-breezy-muted)'
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
    'text-(--fc-breezy-muted-foreground) order-1 whitespace-nowrap overflow-hidden shrink-1',
  ),

  listItemEventTitleClass: (info) => joinClassNames(
    info.isNarrow ? 'px-px' : 'px-0.5',
    'text-(--fc-breezy-strong-foreground) font-medium whitespace-nowrap overflow-hidden shrink-100',
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
    'mb-px border',
    info.isNarrow
      ? 'mx-px border-(--fc-breezy-primary) rounded-sm'
      : 'self-start mx-1 border-transparent rounded-md',
    mutedHoverPressableClass,
  ),
  rowMoreLinkInnerClass: (info) => joinClassNames(
    info.isNarrow
      ? `p-px ${xxsTextClass}`
      : 'p-0.5 text-xs',
    'text-(--fc-breezy-strong-foreground)',
  ),
}

export default {
  name: 'theme-breezy',
  optionDefaults: {
    className: (info) => joinClassNames(
      'bg-(--fc-breezy-background) root-reset',
      !(info.borderlessTop || info.borderlessBottom || info.borderlessX) && 'rounded-lg',
    ),

    viewClass: (info) => {
      const hasBorderTop = !info.options.headerToolbar && !info.borderlessTop
      const hasBorderBottom = !info.options.footerToolbar && !info.borderlessBottom
      const hasBorderX = !info.borderlessX

      return joinClassNames(
        'border-(--fc-breezy-border)',
        hasBorderTop && 'border-t',
        hasBorderBottom && 'border-b',
        hasBorderX && 'border-x',
        (hasBorderTop && hasBorderX) && 'rounded-t-lg',
        (hasBorderBottom && hasBorderX) && 'rounded-b-lg',
        !info.isHeightAuto && 'overflow-hidden',
      )
    },

    /* Toolbar
    --------------------------------------------------------------------------------------------- */

    toolbarClass: (info) => joinClassNames(
      'px-4 py-4 bg-(--fc-breezy-faint) flex flex-row flex-wrap items-center justify-between gap-4 overflow-hidden border-(--fc-breezy-border)',
      !info.borderlessX && 'border-x',
    ),
    headerToolbarClass: (info) => joinClassNames(
      'border-b',
      !info.borderlessTop && 'border-t',
      !(info.borderlessTop || info.borderlessX) && 'rounded-t-lg',
    ),
    footerToolbarClass: (info) => joinClassNames(
      'border-t',
      !info.borderlessBottom && 'border-b',
      !(info.borderlessBottom || info.borderlessX) && 'rounded-b-lg',
    ),
    toolbarSectionClass: "shrink-0 flex flex-row items-center gap-4",
    toolbarTitleClass: "text-lg font-semibold text-(--fc-breezy-strong-foreground)",
    buttonGroupClass: (info) => joinClassNames(
      'flex flex-row items-center',
      !info.hasSelection && 'rounded-md shadow-xs',
    ),
    buttonClass: (info) => joinClassNames(
      'group py-2 flex flex-row items-center text-sm button-reset',
      info.isIconOnly ? 'px-2' : 'px-3',
      info.buttonGroup?.hasSelection ? joinClassNames(
        'rounded-md font-medium',
        info.isSelected
          ? selectedClass
          : unselectedClass,
      ) : joinClassNames(
        'font-semibold',
        info.isPrimary
          ? primaryButtonClass
          : secondaryButtonClass,
        info.buttonGroup
          ? 'first:rounded-s-md first:border-s last:rounded-e-md last:border-e border-y'
          : 'rounded-md shadow-xs border',
      ),
    ),
    buttons: {
      prev: {
        iconContent: () => chevronDown(
          joinClassNames(secondaryButtonIconClass, 'rotate-90 [[dir=rtl]_&]:-rotate-90'),
        ),
      },
      next: {
        iconContent: () => chevronDown(
          joinClassNames(secondaryButtonIconClass, '-rotate-90 [[dir=rtl]_&]:rotate-90'),
        ),
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
    eventColor: "var(--fc-breezy-event)",
    eventContrastColor: "var(--fc-breezy-event-contrast)",
    eventClass: (info) => joinClassNames(
      info.isDragging && 'root-reset',
      info.event.url && 'link-reset',
      info.isSelected
        ? joinClassNames(outlineWidthClass, info.isDragging && 'shadow-md')
        : outlineWidthFocusClass,
      primaryOutlineColorClass,
    ),

    /* Background Event
    --------------------------------------------------------------------------------------------- */

    backgroundEventColor: 'var(--fc-breezy-background-event)',
    backgroundEventClass: 'not-print:bg-[color-mix(in_oklab,var(--fc-event-color)_8%,transparent)] print:border-1 print:border-(--fc-event-color)',
    backgroundEventTitleClass: (info) => joinClassNames(
      'opacity-50 italic',
      info.isNarrow
        ? `p-1 ${xxsTextClass}`
        : 'p-2 text-xs',
      'text-(--fc-breezy-foreground)',
    ),

    /* Block Event
    --------------------------------------------------------------------------------------------- */

    blockEventClass: (info) => joinClassNames(
      'group relative print:bg-white border-transparent print:border-(--fc-event-color)',
      info.isInteractive ? eventFaintPressableClass : eventFaintBgClass,
      (info.isDragging && !info.isSelected) && 'opacity-75',
    ),
    blockEventInnerClass: eventMutedFgClass,
    blockEventTimeClass: "whitespace-nowrap overflow-hidden shrink-1",
    blockEventTitleClass: "whitespace-nowrap overflow-hidden shrink-100",

    /* Row Event
    --------------------------------------------------------------------------------------------- */

    rowEventClass: (info) => joinClassNames(
      'mb-px border-y',
      info.isStart && joinClassNames('border-s', info.isNarrow ? 'rounded-s-sm' : 'rounded-s-md'),
      info.isEnd && joinClassNames('border-e', info.isNarrow ? 'rounded-e-sm' : 'rounded-e-md'),
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
    rowEventTimeClass: (info) => joinClassNames(
      info.isNarrow ? 'ps-0.5' : 'ps-1',
      'font-medium',
    ),
    rowEventTitleClass: (info) => (
      info.isNarrow ? 'px-0.5' : 'px-1'
    ),

    /* Column Event
    --------------------------------------------------------------------------------------------- */

    columnEventClass: (info) => joinClassNames(
      'border-x ring ring-(--fc-breezy-background)',
      info.isStart && joinClassNames('border-t rounded-t-lg', info.isNarrow ? 'mt-px' : 'mt-1'),
      info.isEnd && joinClassNames('border-b rounded-b-lg', info.isNarrow ? 'mb-px' : 'mb-1'),
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
      (info.isShort || info.isNarrow) ? xxsTextClass : 'text-xs',
    ),
    columnEventTimeClass: (info) => (
      !info.isShort && (info.isNarrow ? 'pt-0.5' : 'pt-1')
    ),
    columnEventTitleClass: (info) => joinClassNames(
      !info.isShort && (info.isNarrow ? 'py-0.5' : 'py-1'),
      'font-semibold',
    ),

    /* More-Link
    --------------------------------------------------------------------------------------------- */

    moreLinkClass: `${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    moreLinkInnerClass: "whitespace-nowrap overflow-hidden",
    columnMoreLinkClass: (info) => joinClassNames(
      info.isNarrow ? 'my-px' : 'my-1',
      `border border-transparent print:border-black rounded-md ${strongSolidPressableClass} print:bg-white ring ring-(--fc-breezy-background)`,
    ),
    columnMoreLinkInnerClass: (info) => joinClassNames(
      info.isNarrow
        ? `p-0.5 ${xxsTextClass}`
        : 'p-1 text-xs',
      'text-(--fc-breezy-foreground)',
    ),

    /* Day Header
    --------------------------------------------------------------------------------------------- */

    dayHeaderAlign: (info) => info.inPopover ? 'start' : 'center',
    dayHeaderClass: (info) => joinClassNames(
      'justify-center',
      info.inPopover && 'border-b border-(--fc-breezy-border) bg-(--fc-breezy-faint)',
    ),
    dayHeaderInnerClass: (info) => joinClassNames(
      'flex flex-row items-center',
      (!info.dayNumberText && !info.inPopover)
        ? joinClassNames(
            'py-1 rounded-sm text-xs',
            info.isNarrow
              ? 'px-1 m-1 text-(--fc-breezy-muted-foreground)'
              : 'px-1.5 m-2 font-semibold text-(--fc-breezy-foreground)',
            info.hasNavLink && mutedHoverButtonClass,
          )
        : (info.isToday && info.dayNumberText && !info.inPopover)
            ? joinClassNames(
                'group m-2 outline-none',
                info.isNarrow ? 'h-6' : 'h-8',
              )
            : joinClassNames(
                'rounded-sm',
                info.inPopover
                  ? 'm-2 px-1 py-0.5'
                  : joinClassNames(
                      'mx-2 h-6 px-1.5',
                      info.isNarrow ? 'my-2' : 'my-3',
                    ),
                info.hasNavLink && mutedHoverButtonClass,
              ),
    ),
    dayHeaderContent: (info) => (
      (!info.dayNumberText && !info.inPopover) ? (
        <>{info.text}</>
      ) : (
        <>
          {info.textParts.map((textPart, i) => (
            <span
              key={i}
              className={joinClassNames(
                'whitespace-pre',
                info.isNarrow ? 'text-xs' : 'text-sm',
                textPart.type === 'day'
                  ? joinClassNames(
                      'flex flex-row items-center',
                      !info.isNarrow && 'font-semibold',
                      (info.isToday && !info.inPopover)
                        ? joinClassNames(
                            'mx-0.5 rounded-full justify-center',
                            info.isNarrow ? 'size-6' : 'size-8',
                            info.hasNavLink
                              ? `${primaryPressableGroupClass} ${outlineWidthGroupFocusClass} ${outlineOffsetClass} ${primaryOutlineColorClass}`
                              : primaryClass,
                          )
                        : 'text-(--fc-breezy-strong-foreground)',
                    )
                  : 'text-(--fc-breezy-muted-foreground)',
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
      ((info.isOther || info.isDisabled) && !info.options.businessHours) && 'bg-(--fc-breezy-faint)',
    ),
    dayCellTopClass: (info) => joinClassNames(
      info.isNarrow ? 'min-h-0.5' : 'min-h-1',
      'flex flex-row',
    ),
    dayCellTopInnerClass: (info) => joinClassNames(
      'flex flex-row items-center justify-center whitespace-nowrap',
      info.isNarrow
        ? `my-px h-5 ${xxsTextClass}`
        : 'my-1 h-6 text-xs',
      info.isToday
        ? joinClassNames(
            'rounded-full font-semibold',
            info.isNarrow ? 'ms-px' : 'ms-1',
            info.text === info.dayNumberText
              ? (info.isNarrow ? 'w-5' : 'w-6')
              : (info.isNarrow ? 'px-1' : 'px-2'),
            info.hasNavLink
              ? `${primaryPressableClass} ${outlineOffsetClass}`
              : primaryClass,
          )
        : joinClassNames(
            'rounded-e-sm',
            info.isNarrow ? 'px-1' : 'px-2',
            info.hasNavLink && mutedHoverPressableClass,
            info.isOther
              ? 'text-(--fc-breezy-faint-foreground)'
              : (info.monthText ? 'text-(--fc-breezy-foreground)' : 'text-(--fc-breezy-muted-foreground)'),
            info.monthText && 'font-bold',
          ),
    ),
    dayCellInnerClass: (info) => joinClassNames(info.inPopover && 'p-2'),

    /* Popover
    --------------------------------------------------------------------------------------------- */

    popoverClass: "bg-(--fc-breezy-popover) border border-(--fc-breezy-popover-border) rounded-lg overflow-hidden shadow-lg m-1 min-w-55 root-reset",
    popoverCloseClass: `group absolute top-2 end-2 p-0.5 rounded-sm ${mutedHoverButtonClass} button-reset`,
    popoverCloseContent: () => x(`size-5 ${mutedFgPressableGroupClass}`),

    /* Lane
    --------------------------------------------------------------------------------------------- */

    dayLaneClass: (info) => joinClassNames(
      'border',
      info.isMajor ? 'border-(--fc-breezy-strong-border)' : 'border-(--fc-breezy-muted-border)',
      info.isDisabled && 'bg-(--fc-breezy-faint)',
    ),
    dayLaneInnerClass: (info) => (
      info.isStack
        ? 'm-1'
        : info.isNarrow ? 'mx-px' : 'mx-1'
    ),
    slotLaneClass: (info) => joinClassNames(
      'border border-(--fc-breezy-muted-border)',
      info.isMinor && 'border-dotted',
    ),

    /* List Day
    --------------------------------------------------------------------------------------------- */

    listDaysClass: "my-10 mx-auto w-full max-w-218 px-4",
    listDayClass: (info) => joinClassNames(
      !info.isLast && 'border-b border-(--fc-breezy-muted-border)',
      'flex flex-row items-start gap-2',
    ),
    listDayHeaderClass: "my-px shrink-0 w-1/4 max-w-50 py-3.5 flex flex-col items-start",
    listDayHeaderInnerClass: (info) => joinClassNames(
      'my-0.5 py-0.5 px-2 -mx-2 rounded-full text-sm',
      !info.level
        ? joinClassNames(
            info.isToday
              ? joinClassNames(
                  'font-semibold',
                  info.hasNavLink ? primaryPressableClass : primaryClass,
                )
              : joinClassNames(
                  'font-medium text-(--fc-breezy-strong-foreground)',
                  info.hasNavLink && mutedHoverPressableClass,
                ),
          )
        : joinClassNames(
            'text-(--fc-breezy-faint-foreground)',
            info.hasNavLink && `${mutedHoverPressableClass} hover:text-(--fc-breezy-muted-foreground)`,
          ),
    ),
    listDayBodyClass: "my-4 grow min-w-0 border border-(--fc-breezy-border) rounded-md",

    /* Single Month (in Multi-Month)
    --------------------------------------------------------------------------------------------- */

    singleMonthClass: (info) => joinClassNames(
      info.multiMonthColumns > 1 && 'm-4',
      (info.multiMonthColumns === 1 && !info.isLast) && 'border-b border-(--fc-breezy-border)',
    ),
    singleMonthHeaderClass: (info) => joinClassNames(
      info.multiMonthColumns > 1
        ? 'pb-1'
        : 'py-1.5 bg-(--fc-breezy-background) border-b border-(--fc-breezy-border)',
      'items-center',
    ),
    singleMonthHeaderInnerClass: (info) => joinClassNames(
      'py-1 px-2 rounded-md text-sm text-(--fc-breezy-strong-foreground) font-semibold',
      info.hasNavLink && mutedHoverPressableClass,
    ),

    /* Misc Table
    --------------------------------------------------------------------------------------------- */

    tableHeaderClass: 'bg-(--fc-breezy-background)',
    fillerClass: "border border-(--fc-breezy-muted-border)",
    dayNarrowWidth: 100,
    dayHeaderRowClass: "border border-(--fc-breezy-muted-border)",
    dayRowClass: "border border-(--fc-breezy-border)",
    slotHeaderRowClass: "border border-(--fc-breezy-border)",
    slotHeaderInnerClass: "text-(--fc-breezy-faint-foreground) uppercase",

    /* Misc Content
    --------------------------------------------------------------------------------------------- */

    navLinkClass: `${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    inlineWeekNumberClass: (info) => joinClassNames(
      'absolute top-0 end-0 bg-(--fc-breezy-background) text-(--fc-breezy-muted-foreground) whitespace-nowrap rounded-es-md border-b border-b-(--fc-breezy-strong-border) border-s border-s-(--fc-breezy-border)',
      info.isNarrow
        ? `p-0.5 ${xxsTextClass}`
        : 'p-1.5 text-xs',
      info.hasNavLink
        ? `${mutedHoverPressableClass} -outline-offset-1`
        : mutedHoverClass,
    ),
    highlightClass: "bg-(--fc-breezy-highlight)",
    nonBusinessHoursClass: "bg-(--fc-breezy-faint)",
    nowIndicatorLineClass: "-m-px border-1 border-(--fc-breezy-now)",
    nowIndicatorDotClass: "-m-[6px] border-6 border-(--fc-breezy-now) size-0 rounded-full ring-2 ring-(--fc-breezy-background)",

    /* Resource Day Header
    --------------------------------------------------------------------------------------------- */

    resourceDayHeaderAlign: "center",
    resourceDayHeaderClass: "border",
    resourceDayHeaderInnerClass: (info) => joinClassNames(
      'm-2 text-(--fc-breezy-foreground) font-semibold',
      info.isNarrow ? 'text-xs' : 'text-sm',
    ),

    /* Resource Data Grid
    --------------------------------------------------------------------------------------------- */

    resourceColumnHeaderClass: "border border-(--fc-breezy-muted-border) justify-center",
    resourceColumnHeaderInnerClass: "m-2 text-(--fc-breezy-foreground) text-sm",
    resourceColumnResizerClass: "absolute inset-y-0 w-[5px] end-[-3px]",
    resourceGroupHeaderClass: "border border-(--fc-breezy-border) bg-(--fc-breezy-muted)",
    resourceGroupHeaderInnerClass: "m-2 text-(--fc-breezy-foreground) text-sm",
    resourceCellClass: "border border-(--fc-breezy-muted-border)",
    resourceCellInnerClass: "m-2 text-(--fc-breezy-foreground) text-sm",
    resourceIndentClass: "ms-1 -me-1.5 justify-center",
    resourceExpanderClass: `group p-0.5 rounded-full ${mutedHoverPressableClass} ${outlineWidthFocusClass} ${primaryOutlineColorClass}`,
    resourceExpanderContent: (info) => chevronDown(
      joinClassNames(
        `size-5 ${mutedFgPressableGroupClass}`,
        !info.isExpanded && '-rotate-90 [[dir=rtl]_&]:rotate-90',
      )
    ),
    resourceHeaderRowClass: "border border-(--fc-breezy-border)",
    resourceRowClass: "border border-(--fc-breezy-border)",
    resourceColumnDividerClass: "border-e border-(--fc-breezy-strong-border)",

    /* Timeline Lane
    --------------------------------------------------------------------------------------------- */

    resourceGroupLaneClass: "border border-(--fc-breezy-border) bg-(--fc-breezy-muted)",
    resourceLaneClass: "border border-(--fc-breezy-border)",
    resourceLaneBottomClass: (info) => joinClassNames(info.options.eventOverlap && 'h-2'),
    timelineBottomClass: "h-2",
  },
  views: {
    dayGrid: {
      ...dayRowCommonClasses,
      dayHeaderClass: getNormalDayHeaderBorderClass,
      dayHeaderDividerClass: 'border-b border-(--fc-breezy-strong-border)',
      dayCellClass: getNormalDayCellBorderColorClass,
      dayCellBottomClass: getShortDayCellBottomClass,
      backgroundEventInnerClass: 'flex flex-row justify-end',
    },
    multiMonth: {
      ...dayRowCommonClasses,
      dayHeaderClass: getNormalDayHeaderBorderClass,
      dayHeaderDividerClass: (info) => joinClassNames(
        info.multiMonthColumns === 1 && 'border-b border-(--fc-breezy-strong-border) shadow-sm'
      ),
      dayCellClass: getNormalDayCellBorderColorClass,
      dayCellBottomClass: getShortDayCellBottomClass,
      tableBodyClass: (info) => joinClassNames(
        info.multiMonthColumns > 1 && 'border border-(--fc-breezy-border) rounded-md shadow-xs overflow-hidden'
      ),
    },
    timeGrid: {
      ...dayRowCommonClasses,
      dayHeaderClass: getMutedDayHeaderBorderClass,
      dayHeaderDividerClass: (info) => joinClassNames(
        'border-b',
        info.options.allDaySlot
          ? 'border-(--fc-breezy-border)'
          : 'border-(--fc-breezy-strong-border) not-print:shadow-sm',
      ),
      dayCellClass: getMutedDayCellBorderColorClass,
      dayCellBottomClass: tallDayCellBottomClass,

      /* TimeGrid > Week Number Header
      ------------------------------------------------------------------------------------------- */

      weekNumberHeaderClass: 'items-center justify-end',
      weekNumberHeaderInnerClass: (info) => joinClassNames(
        'm-1.5 h-6 px-1.5 text-(--fc-breezy-muted-foreground) rounded-sm flex flex-row items-center',
        info.hasNavLink && mutedHoverPressableClass,
        info.isNarrow ? 'text-xs' : 'text-sm',
      ),

      /* TimeGrid > All-Day Header
      ------------------------------------------------------------------------------------------- */

      allDayHeaderClass: 'items-center',
      allDayHeaderInnerClass: (info) => joinClassNames(
        'm-3 text-(--fc-breezy-faint-foreground)',
        info.isNarrow ? xxsTextClass : 'text-xs',
      ),
      allDayDividerClass: 'border-b border-(--fc-breezy-strong-border) not-print:shadow-sm',

      /* TimeGrid > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderClass: 'justify-end',
      slotHeaderInnerClass: (info) => joinClassNames(
        'relative mx-3 my-2',
        info.isNarrow
          ? `-top-3.5 ${xxsTextClass}`
          : '-top-4 text-xs',
        info.isFirst && 'hidden',
      ),
      slotHeaderDividerClass: 'border-e border-(--fc-breezy-muted-border)',
    },
    list: {

      /* List-View > List-Item Event
      ------------------------------------------------------------------------------------------- */

      listItemEventClass: (info) => joinClassNames(
        'group p-4 items-center gap-3',
        !info.isLast && 'border-b border-(--fc-breezy-muted-border)',
        info.isInteractive
          ? faintHoverPressableClass
          : faintHoverClass,
      ),
      listItemEventBeforeClass: 'border-4 border-(--fc-event-color) rounded-full',
      listItemEventInnerClass: 'flex flex-row items-center gap-3 text-sm',
      listItemEventTimeClass: 'shrink-0 w-1/2 max-w-50 whitespace-nowrap overflow-hidden text-ellipsis text-(--fc-breezy-muted-foreground)',
      listItemEventTitleClass: (info) => joinClassNames(
        'grow min-w-0 font-medium whitespace-nowrap overflow-hidden text-(--fc-breezy-foreground)',
        info.event.url && 'group-hover:underline',
      ),

      /* No-Events Screen
      ------------------------------------------------------------------------------------------- */

      noEventsClass: 'grow flex flex-col items-center justify-center',
      noEventsInnerClass: 'py-15 text-(--fc-breezy-muted-foreground)',
    },
    resourceDayGrid: {
      resourceDayHeaderClass: (info) => (
        info.isMajor
          ? 'border-(--fc-breezy-strong-border)'
          : 'border-(--fc-breezy-border)'
      ),
    },
    resourceTimeGrid: {
      resourceDayHeaderClass: (info) => (
        info.isMajor
          ? 'border-(--fc-breezy-strong-border)'
          : 'border-(--fc-breezy-muted-border)'
      ),
    },
    timeline: {

      /* Timeline > Row Event
      ------------------------------------------------------------------------------------------- */

      rowEventClass: (info) => info.isEnd && 'me-px',
      rowEventInnerClass: (info) => info.options.eventOverlap ? 'py-1' : 'py-2',

      /* Timeline > More-Link
      ------------------------------------------------------------------------------------------- */

      rowMoreLinkClass: `me-px mb-px border border-transparent print:border-black rounded-md ${strongSolidPressableClass} print:bg-white`,
      rowMoreLinkInnerClass: 'p-1 text-(--fc-breezy-foreground) text-xs',

      /* Timeline > Slot Header
      ------------------------------------------------------------------------------------------- */

      slotHeaderAlign: (info) => info.isTime ? 'start' : 'center',
      slotHeaderClass: (info) => joinClassNames(
        info.level > 0 && 'border border-(--fc-breezy-muted-border)',
        'justify-end',
      ),
      slotHeaderInnerClass: (info) => joinClassNames(
        'mx-3 my-2 text-xs',
        info.isTime && joinClassNames(
          'relative -start-4',
          info.isFirst && 'hidden',
        ),
        info.hasNavLink && 'hover:underline',
      ),
      slotHeaderDividerClass: 'border-b border-(--fc-breezy-strong-border) shadow-sm',
    },
  },
} as PluginInput

/* SVGs
------------------------------------------------------------------------------------------------- */

function chevronDown(className?: string) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
}

function chevronDoubleLeft(className?: string) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L6.31 10l3.72-3.72a.75.75 0 1 0-1.06-1.06L4.72 9.47Zm9.25-4.25L9.72 9.47a.75.75 0 0 0 0 1.06l4.25 4.25a.75.75 0 1 0 1.06-1.06L11.31 10l3.72-3.72a.75.75 0 0 0-1.06-1.06Z" clipRule="evenodd" /></svg>
}

function x(className?: string) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
}
