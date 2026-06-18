import { CalendarApiImpl } from './api/CalendarApiImpl'
import { CalendarOptionsRefined } from './options'
import { ViewSpec, ViewSpecHash } from './structs/view-spec'
import { ToolbarInput, ToolbarModel, ToolbarWidget } from './toolbar-struct'
import { formatWithOrdinals } from './util/misc'

export function parseToolbars(
  calendarOptions: CalendarOptionsRefined,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApiImpl,
) {
  let header = calendarOptions.headerToolbar ? parseToolbar(
    calendarOptions.headerToolbar,
    calendarOptions,
    viewSpecs,
    calendarApi,
  ) : null

  let footer = calendarOptions.footerToolbar ? parseToolbar(
    calendarOptions.footerToolbar,
    calendarOptions,
    viewSpecs,
    calendarApi,
  ) : null

  return { header, footer }
}

function parseToolbar(
  sectionStrHash: ToolbarInput,
  calendarOptions: CalendarOptionsRefined,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApiImpl,
) : ToolbarModel {
  let isRtl = calendarOptions.direction === 'rtl'
  let viewsWithButtons: string[] = []
  let hasTitle = false

  function processSectionStr(sectionStr: string): ToolbarWidget[][] {
    let sectionRes = parseSection(sectionStr, calendarOptions, viewSpecs, calendarApi)
    viewsWithButtons.push(...sectionRes.viewsWithButtons)
    hasTitle = hasTitle || sectionRes.hasTitle
    return sectionRes.widgets
  }

  const sectionWidgets = {
    start: processSectionStr(sectionStrHash[isRtl ? 'right' : 'left'] || sectionStrHash.start || ''),
    center: processSectionStr(sectionStrHash.center || ''),
    end: processSectionStr(sectionStrHash[isRtl ? 'left' : 'right'] || sectionStrHash.end || ''),
  }

  return {
    sectionWidgets,
    viewsWithButtons,
    hasTitle,
  }
}

/*
BAD: querying icons and text here. should be done at render time
*/
function parseSection(
  sectionStr: string,
  calendarOptions: CalendarOptionsRefined,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApiImpl,
): { widgets: ToolbarWidget[][], viewsWithButtons: string[], hasTitle: boolean } {
  let calendarButtons = calendarOptions.buttons || {}
  let customElements = calendarOptions.toolbarElements || {}
  let sectionSubstrs = sectionStr ? sectionStr.split(' ') : []
  let viewsWithButtons: string[] = []
  let hasTitle = false

  let widgets = sectionSubstrs.map(
    (buttonGroupStr): ToolbarWidget[] => (
      buttonGroupStr.split(',').map((name): ToolbarWidget => {
        if (name === 'title') {
          hasTitle = true
          return { name }
        }
        if (customElements[name]) {
          return { name, customElement: customElements[name] }
        }

        let viewSpec: ViewSpec
        let buttonInput = calendarButtons[name] || {}
        let buttonText: string
        let buttonHint: string | ((unitText: string) => string)
        let buttonClick: (ev: MouseEvent) => void

        if ((viewSpec = viewSpecs[name])) {
          viewsWithButtons.push(name)
          const buttonTextKey = viewSpec.optionDefaults.buttonTextKey as string

          buttonText = buttonInput.text ||
            (buttonTextKey ? calendarOptions[buttonTextKey] : '') ||
            (viewSpec.singleUnit
              ? (calendarOptions[viewSpec.singleUnit + 'TextLong'] ||
                  calendarOptions[viewSpec.singleUnit + 'Text'])
              : '') ||
            name

          /*
          buttons{}.hint(viewButtonText, viewName)
          viewHint(viewButtonText, viewName)
          */
          buttonHint = formatWithOrdinals(
            buttonInput.hint || calendarOptions.viewHint,
            [buttonText, name], // ordinal arguments
            buttonText, // fallback text
          )

          buttonClick = (ev: MouseEvent) => {
            buttonInput?.click?.(ev)
            if (!ev.defaultPrevented) {
              calendarApi.changeView(name)
            }
          }
        } else {
          buttonText = buttonInput.text ||
            calendarOptions[name + 'TextLong'] ||
            calendarOptions[name + 'Text'] ||
            name

          /*
          buttons{}.hint(currentUnitText, currentUnit)
          prevHint(currentUnitUnitext, currentUnit)
          nextHint -- same
          todayHint -- same
          */
          if (name === 'prevYear') {
            buttonHint = formatWithOrdinals(
              buttonInput.hint || calendarOptions.prevHint,
              [calendarOptions.yearText, 'year'],
              buttonText,
            )
          } else if (name === 'nextYear') {
            buttonHint = formatWithOrdinals(
              buttonInput.hint || calendarOptions.nextHint,
              [calendarOptions.yearText, 'year'],
              buttonText,
            )
          } else {
            buttonHint = (currentUnit: string) => { // dynamic
              return formatWithOrdinals(
                buttonInput.hint || calendarOptions[name + 'Hint'], // todayHint/prevHint/nextHint
                [ // ordinal arguments
                  calendarOptions[currentUnit + 'TextLong'] ||
                    calendarOptions[currentUnit + 'Text'],
                  currentUnit
                ],
                buttonText, // fallback text
              )
            }
          }

          buttonClick = (ev: MouseEvent) => {
            buttonInput?.click?.(ev)
            if (!ev.defaultPrevented) {
              calendarApi[name]?.()
            }
          }
        }

        return {
          name,
          isView: Boolean(viewSpec),
          buttonText,
          buttonHint,
          buttonDisplay: buttonInput.display,
          buttonIconClass: buttonInput.iconClass,
          buttonIconContent: buttonInput.iconContent,
          buttonClick,
          buttonIsPrimary: buttonInput.isPrimary || false,
          buttonClass: buttonInput.class ?? buttonInput.className,
          buttonDidMount: buttonInput.didMount,
          buttonWillUnmount: buttonInput.willUnmount,
        }
      })
    ),
  )

  return { widgets, viewsWithButtons, hasTitle }
}
