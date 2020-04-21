import { ViewSpec, ViewSpecHash } from './structs/view-spec'
import { Theme } from './theme/Theme'
import { mapHash } from './util/object'
import { CalendarApi } from './CalendarApi'

export interface ToolbarModel {
  [sectionName: string]: ToolbarWidget[][]
}

export interface ToolbarWidget {
  buttonName: string
  buttonClick?: any
  buttonIcon?: any
  buttonText?: any
}


// TODO: make separate parsing of headerToolbar/footerToolbar part of options-processing system
export function parseToolbars(
  options: any,
  optionOverrides: any,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi
) {
  let viewsWithButtons: string[] = []
  let headerToolbar = options.headerToolbar ? parseToolbar(options.headerToolbar, options, optionOverrides, theme, viewSpecs, calendarApi, viewsWithButtons) : null
  let footerToolbar = options.footerToolbar ? parseToolbar(options.footerToolbar, options, optionOverrides, theme, viewSpecs, calendarApi, viewsWithButtons) : null

  return { headerToolbar, footerToolbar, viewsWithButtons }
}


function parseToolbar(
  sectionStrHash: { [sectionName: string]: string },
  options: any,
  optionOverrides: any,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi,
  viewsWithButtons: string[] // dump side effects
) : ToolbarModel {
  return mapHash(sectionStrHash, (sectionStr) => parseSection(sectionStr, options, optionOverrides, theme, viewSpecs, calendarApi, viewsWithButtons))
}


/*
BAD: querying icons and text here. should be done at render time
*/
function parseSection(
  sectionStr: string,
  options: any,
  optionOverrides: any,
  theme: Theme,
  viewSpecs: ViewSpecHash,
  calendarApi: CalendarApi,
  viewsWithButtons: string[] // dump side effects
): ToolbarWidget[][] {
  let isRtl = options.direction === 'rtl'
  let calendarCustomButtons = options.customButtons || {}
  let calendarButtonTextOverrides = optionOverrides.buttonText || {}
  let calendarButtonText = options.buttonText || {}
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
