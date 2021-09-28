import { ViewSpec, ViewSpecHash } from './structs/view-spec'
import { Theme } from './theme/Theme'
import { mapHash } from './util/object'
import { CalendarApi } from './CalendarApi'
import { CalendarOptionsRefined, CalendarOptions } from './options'
import { ToolbarInput, ToolbarModel, ToolbarWidget, CustomButtonInput } from './toolbar-struct'

export function parseToolbars(
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: CalendarOptions,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi,
) {
  let viewsWithButtons: string[] = []
  let headerToolbar = calendarOptions.headerToolbar ? parseToolbar(
    calendarOptions.headerToolbar,
    calendarOptions,
    calendarOptionOverrides,
    theme,
    viewSpecs,
    calendarApi,
    viewsWithButtons,
  ) : null
  let footerToolbar = calendarOptions.footerToolbar ? parseToolbar(
    calendarOptions.footerToolbar,
    calendarOptions,
    calendarOptionOverrides,
    theme,
    viewSpecs,
    calendarApi,
    viewsWithButtons,
  ) : null

  return { headerToolbar, footerToolbar, viewsWithButtons }
}

function parseToolbar(
  sectionStrHash: ToolbarInput,
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: CalendarOptions,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi,
  viewsWithButtons: string[], // dump side effects
) : ToolbarModel {
  return mapHash(
    sectionStrHash as { [section: string]: string },
    (sectionStr) => parseSection(sectionStr, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi, viewsWithButtons),
  )
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
  calendarApi: CalendarApi,
  viewsWithButtons: string[], // dump side effects
): ToolbarWidget[][] {
  let isRtl = calendarOptions.direction === 'rtl'
  let calendarCustomButtons = calendarOptions.customButtons || {}
  let calendarButtonTextOverrides = calendarOptionOverrides.buttonText || {}
  let calendarButtonText = calendarOptions.buttonText || {}
  let calendarButtonTitleOverrides = calendarOptionOverrides.buttonTitles || {}
  let calendarButtonTitles = calendarOptions.buttonTitles || {}
  let sectionSubstrs = sectionStr ? sectionStr.split(' ') : []

  return sectionSubstrs.map(
    (buttonGroupStr): ToolbarWidget[] => (
      buttonGroupStr.split(',').map((buttonName): ToolbarWidget => {
        if (buttonName === 'title') {
          return { buttonName }
        }

        let customButtonProps: CustomButtonInput
        let viewSpec: ViewSpec
        let buttonClick
        let buttonIcon // only one of these will be set
        let buttonText // "
        let buttonTitle: string // for the title="" attribute, for accessibility

        if ((customButtonProps = calendarCustomButtons[buttonName])) {
          buttonClick = (ev: UIEvent) => {
            if (customButtonProps.click) {
              customButtonProps.click.call(ev.target, ev, ev.target) // TODO: use Calendar this context?
            }
          }

          ;(buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = customButtonProps.text)

          buttonTitle = computeTitleText(
            customButtonProps.title,
            customButtonProps.text,
          )

        } else if ((viewSpec = viewSpecs[buttonName])) {
          viewsWithButtons.push(buttonName)

          buttonClick = () => {
            calendarApi.changeView(buttonName)
          }

          ;(buttonText = viewSpec.buttonTextOverride) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = viewSpec.buttonTextDefault)

          buttonTitle = computeTitleText(
            viewSpec.buttonTitleOverride ||
            viewSpec.buttonTitleDefault, // TODO: use calendarButtonTitles.view string as default
            viewSpec.buttonTextOverride ||
            viewSpec.buttonTextDefault,
            // TODO: pass in buttonText,buttonName to function
          )

        } else if (calendarApi[buttonName]) { // a calendarApi method
          buttonClick = () => {
            calendarApi[buttonName]()
          }

          // TODO: special-case for previousYear/nextYear

          ;(buttonText = calendarButtonTextOverrides[buttonName]) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = calendarButtonText[buttonName]) // everything else is considered default

          buttonTitle = computeTitleText(
            calendarButtonTitleOverrides[buttonName] ||
            calendarButtonTitles[buttonName],
            calendarButtonTextOverrides[buttonName] ||
            calendarButtonText[buttonName],
            // TODO: pass translatedUnit/unit to function
          )
        }

        return { buttonName, buttonClick, buttonIcon, buttonText, buttonTitle }
      })
    ),
  )
}

function computeTitleText(titleArg: string | ((...args: any[]) => string), text: string): string {
  if (typeof titleArg === 'function') {
    return titleArg()
  }
  return titleArg || text
}
