import { ViewSpec, ViewSpecHash } from './structs/view-spec.js'
import { Theme } from './theme/Theme.js'
import { CalendarImpl } from './api/CalendarImpl.js'
import { CalendarOptionsRefined, CalendarOptions } from './options.js'
import { ToolbarInput, ToolbarModel, ToolbarWidget, CustomButtonInput } from './toolbar-struct.js'
import { formatWithOrdinals } from './util/misc.js'

export function parseToolbars(
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: CalendarOptions,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarImpl,
) {
  let header = calendarOptions.headerToolbar ? parseToolbar(
    calendarOptions.headerToolbar,
    calendarOptions,
    calendarOptionOverrides,
    theme,
    viewSpecs,
    calendarApi,
  ) : null
  let footer = calendarOptions.footerToolbar ? parseToolbar(
    calendarOptions.footerToolbar,
    calendarOptions,
    calendarOptionOverrides,
    theme,
    viewSpecs,
    calendarApi,
  ) : null

  return { header, footer }
}

function parseToolbar(
  sectionStrHash: ToolbarInput,
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: CalendarOptions,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarImpl,
) : ToolbarModel {
  let sectionWidgets: { [sectionName: string]: ToolbarWidget[][] } = {}
  let viewsWithButtons: string[] = []
  let hasTitle = false

  for (let sectionName in sectionStrHash) {
    let sectionStr = sectionStrHash[sectionName]
    let sectionRes = parseSection(sectionStr, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi)
    sectionWidgets[sectionName] = sectionRes.widgets
    viewsWithButtons.push(...sectionRes.viewsWithButtons)
    hasTitle = hasTitle || sectionRes.hasTitle
  }

  return { sectionWidgets, viewsWithButtons, hasTitle }
}

/*
BAD: querying icons and text here. should be done at render time
*/
function parseSection(
  sectionStr: string,
  calendarOptions: CalendarOptionsRefined, // defaults+overrides, then refined
  calendarOptionOverrides: CalendarOptions, // overrides only!, unrefined :(
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarImpl,
): { widgets: ToolbarWidget[][], viewsWithButtons: string[], hasTitle: boolean } {
  let isRtl = calendarOptions.direction === 'rtl'
  let calendarCustomButtons = calendarOptions.customButtons || {}
  let calendarButtonTextOverrides = calendarOptionOverrides.buttonText || {}
  let calendarButtonText = calendarOptions.buttonText || {}
  let calendarButtonHintOverrides = calendarOptionOverrides.buttonHints || {}
  let calendarButtonHints = calendarOptions.buttonHints || {}
  let sectionSubstrs = sectionStr ? sectionStr.split(' ') : []
  let viewsWithButtons: string[] = []
  let hasTitle = false

  let widgets = sectionSubstrs.map(
    (buttonGroupStr): ToolbarWidget[] => (
      buttonGroupStr.split(',').map((buttonName): ToolbarWidget => {
        if (buttonName === 'title') {
          hasTitle = true
          return { buttonName }
        }

        let customButtonProps: CustomButtonInput
        let viewSpec: ViewSpec
        let buttonClick
        let buttonIcon // only one of these will be set
        let buttonText // "
        let buttonHint: string | ((navUnit: string) => string)
        // ^ for the title="" attribute, for accessibility

        if ((customButtonProps = calendarCustomButtons[buttonName])) {
          buttonClick = (ev: UIEvent) => {
            if (customButtonProps.click) {
              customButtonProps.click.call(ev.target, ev, ev.target) // TODO: use Calendar this context?
            }
          };

          (buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = customButtonProps.text)

          buttonHint = customButtonProps.hint || customButtonProps.text
        } else if ((viewSpec = viewSpecs[buttonName])) {
          viewsWithButtons.push(buttonName)

          buttonClick = () => {
            calendarApi.changeView(buttonName)
          };

          (buttonText = viewSpec.buttonTextOverride) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = viewSpec.buttonTextDefault)

          let textFallback =
            viewSpec.buttonTextOverride ||
            viewSpec.buttonTextDefault

          buttonHint = formatWithOrdinals(
            viewSpec.buttonTitleOverride ||
            viewSpec.buttonTitleDefault ||
            calendarOptions.viewHint,
            [textFallback, buttonName], // view-name = buttonName
            textFallback,
          )
        } else if (calendarApi[buttonName]) { // a calendarApi method
          buttonClick = () => {
            calendarApi[buttonName]()
          };

          (buttonText = calendarButtonTextOverrides[buttonName]) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = calendarButtonText[buttonName]) // everything else is considered default

          if (buttonName === 'prevYear' || buttonName === 'nextYear') {
            let prevOrNext = buttonName === 'prevYear' ? 'prev' : 'next'
            buttonHint = formatWithOrdinals(
              calendarButtonHintOverrides[prevOrNext] ||
              calendarButtonHints[prevOrNext],
              [
                calendarButtonText.year || 'year', // localize unit
                'year',
              ],
              calendarButtonText[buttonName],
            )
          } else {
            buttonHint = (navUnit: string) => formatWithOrdinals(
              calendarButtonHintOverrides[buttonName] ||
              calendarButtonHints[buttonName],
              [
                calendarButtonText[navUnit] || navUnit, // localized unit
                navUnit,
              ],
              calendarButtonText[buttonName],
            )
          }
        }

        return { buttonName, buttonClick, buttonIcon, buttonText, buttonHint }
      })
    ),
  )

  return { widgets, viewsWithButtons, hasTitle }
}
