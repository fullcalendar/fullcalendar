import { ViewSpec, ViewSpecHash } from './structs/view-spec'
import { Theme } from './theme/Theme'
import { mapHash } from './util/object'
import { CalendarApi } from './CalendarApi'
import { CalendarOptionsRefined } from './options'
import { ToolbarInput, ToolbarModel, ToolbarWidget } from './toolbar-struct'


export function parseToolbars(
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: Partial<CalendarOptionsRefined>,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi
) {
  let viewsWithButtons: string[] = []
  let headerToolbar = calendarOptions.headerToolbar ? parseToolbar(calendarOptions.headerToolbar, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi, viewsWithButtons) : null
  let footerToolbar = calendarOptions.footerToolbar ? parseToolbar(calendarOptions.footerToolbar, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi, viewsWithButtons) : null

  return { headerToolbar, footerToolbar, viewsWithButtons }
}


function parseToolbar(
  sectionStrHash: ToolbarInput,
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: Partial<CalendarOptionsRefined>,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi,
  viewsWithButtons: string[] // dump side effects
) : ToolbarModel {
  return mapHash(
    sectionStrHash as { [section: string]: string },
    (sectionStr) => parseSection(sectionStr, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi, viewsWithButtons)
  )
}


/*
BAD: querying icons and text here. should be done at render time
*/
function parseSection(
  sectionStr: string,
  calendarOptions: CalendarOptionsRefined,
  calendarOptionOverrides: Partial<CalendarOptionsRefined>,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi,
  viewsWithButtons: string[] // dump side effects
): ToolbarWidget[][] {
  let isRtl = calendarOptions.direction === 'rtl'
  let calendarCustomButtons = calendarOptions.customButtons || {}
  let calendarButtonTextOverrides = calendarOptionOverrides.buttonText || {}
  let calendarButtonText = calendarOptions.buttonText || {}
  let sectionSubstrs = sectionStr ? sectionStr.split(' ') : []

  return sectionSubstrs.map((buttonGroupStr, i): ToolbarWidget[] => {
    return buttonGroupStr.split(',').map((buttonName, j): ToolbarWidget => {

      if (buttonName === 'title') {
        return { buttonName }

      } else {
        let customButtonProps
        let viewSpec: ViewSpec
        let buttonClick
        let buttonIcon // only one of these will be set
        let buttonText // "

        if ((customButtonProps = calendarCustomButtons[buttonName])) {
          buttonClick = function(ev: UIEvent) {
            if (customButtonProps.click) {
              customButtonProps.click.call(ev.target, ev) // TODO: correct to use `target`?
            }
          };
          (buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
          (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
          (buttonText = customButtonProps.text)

        } else if ((viewSpec = viewSpecs[buttonName])) {
          viewsWithButtons.push(buttonName)

          buttonClick = function() {
            calendarApi.changeView(buttonName)
          };
          (buttonText = viewSpec.buttonTextOverride) ||
          (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
          (buttonText = viewSpec.buttonTextDefault)

        } else if (calendarApi[buttonName]) { // a calendarApi method
          buttonClick = function() {
            calendarApi[buttonName]()
          };
          (buttonText = calendarButtonTextOverrides[buttonName]) ||
          (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
          (buttonText = calendarButtonText[buttonName])
          //            ^ everything else is considered default
        }

        return { buttonName, buttonClick, buttonIcon, buttonText }
      }
    })
  })
}
