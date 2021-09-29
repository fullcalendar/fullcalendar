import { ViewSpec, ViewSpecHash } from './structs/view-spec'
import { Theme } from './theme/Theme'
import { CalendarApi } from './CalendarApi'
import { CalendarOptionsRefined, CalendarOptions } from './options'
import { ToolbarInput, ToolbarModel, ToolbarWidget, CustomButtonInput } from './toolbar-struct'
import { formatWithOrdinals } from './util/misc'

export function parseToolbars(
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: CalendarOptions,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi,
) {
  let headerToolbar = calendarOptions.headerToolbar ? parseToolbar(
    calendarOptions.headerToolbar,
    calendarOptions,
    calendarOptionOverrides,
    theme,
    viewSpecs,
    calendarApi,
  ) : null
  let footerToolbar = calendarOptions.footerToolbar ? parseToolbar(
    calendarOptions.footerToolbar,
    calendarOptions,
    calendarOptionOverrides,
    theme,
    viewSpecs,
    calendarApi,
  ) : null

  return { headerToolbar, footerToolbar }
}

function parseToolbar(
  sectionStrHash: ToolbarInput,
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: CalendarOptions,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi
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
  calendarApi: CalendarApi,
): {
  widgets: ToolbarWidget[][],
  viewsWithButtons: string[],
  hasTitle: boolean,
 } {
  let isRtl = calendarOptions.direction === 'rtl'
  let calendarCustomButtons = calendarOptions.customButtons || {}
  let calendarButtonTextOverrides = calendarOptionOverrides.buttonText || {}
  let calendarButtonText = calendarOptions.buttonText || {}
  let calendarButtonTitleOverrides = calendarOptionOverrides.buttonTitles || {}
  let calendarButtonTitles = calendarOptions.buttonTitles || {}
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
        let buttonTitle: string | ((navUnit: string) => string)
        // ^ for the title="" attribute, for accessibility

        if ((customButtonProps = calendarCustomButtons[buttonName])) {
          buttonClick = (ev: UIEvent) => {
            if (customButtonProps.click) {
              customButtonProps.click.call(ev.target, ev, ev.target) // TODO: use Calendar this context?
            }
          }

          ;(buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = customButtonProps.text)

          buttonTitle = customButtonProps.title || customButtonProps.text

        } else if ((viewSpec = viewSpecs[buttonName])) {
          viewsWithButtons.push(buttonName)

          buttonClick = () => {
            calendarApi.changeView(buttonName)
          }

          ;(buttonText = viewSpec.buttonTextOverride) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = viewSpec.buttonTextDefault)

          let textFallback =
            viewSpec.buttonTextOverride ||
            viewSpec.buttonTextDefault

          buttonTitle = formatWithOrdinals(
            viewSpec.buttonTitleOverride ||
            viewSpec.buttonTitleDefault ||
            calendarButtonTitles.view,
            [textFallback, buttonName], // view-name = buttonName
            textFallback,
          )

        } else if (calendarApi[buttonName]) { // a calendarApi method
          buttonClick = () => {
            calendarApi[buttonName]()
          }

          ;(buttonText = calendarButtonTextOverrides[buttonName]) ||
            (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
            (buttonText = calendarButtonText[buttonName]) // everything else is considered default

          if (buttonName === 'prevYear' || buttonName === 'nextYear') {
            let prevOrNext = buttonName === 'prevYear' ? 'prev' : 'next'
            buttonTitle = formatWithOrdinals(
              calendarButtonTitleOverrides[prevOrNext] ||
              calendarButtonTitles[prevOrNext],
              ['year'],
              calendarButtonTextOverrides[buttonName] ||
              calendarButtonText[buttonName],
            )
          } else {
            buttonTitle = (navUnit: string) => formatWithOrdinals(
              calendarButtonTitleOverrides[buttonName] ||
              calendarButtonTitles[buttonName],
              [navUnit],
              calendarButtonTextOverrides[buttonName] ||
              calendarButtonText[buttonName],
            )
          }
        }

        return { buttonName, buttonClick, buttonIcon, buttonText, buttonTitle }
      })
    ),
  )

  return { widgets, viewsWithButtons, hasTitle }
}
