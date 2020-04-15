import { ViewSpec } from './structs/view-spec'
import { Calendar } from './Calendar'
import { Theme } from './theme/Theme'
import { mapHash } from './util/object'

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
export function parseToolbars(allOptions, theme: Theme, isRtl: boolean, calendar: Calendar) {
  let viewsWithButtons: string[] = []
  let headerToolbar = allOptions.headerToolbar ? parseToolbar(allOptions.headerToolbar, theme, isRtl, calendar, viewsWithButtons) : null
  let footerToolbar = allOptions.footerToolbar ? parseToolbar(allOptions.footerToolbar, theme, isRtl, calendar, viewsWithButtons) : null

  return { headerToolbar, footerToolbar, viewsWithButtons }
}

function parseToolbar(raw, theme: Theme, isRtl: boolean, calendar: Calendar, viewsWithButtons: string[]): ToolbarModel {
  return mapHash(raw, (rawSection: any) => parseSection(rawSection, theme, isRtl, calendar, viewsWithButtons))
}

/*
BAD: querying icons and text here. should be done at render time
*/
function parseSection(sectionStr: string, theme: Theme, isRtl: boolean, calendar: Calendar, viewsWithButtons: string[]): ToolbarWidget[][] {
  let optionsManager = calendar.optionsManager
  let viewSpecs = calendar.viewSpecs
  let calendarCustomButtons = optionsManager.computed.customButtons || {}
  let calendarButtonTextOverrides = optionsManager.overrides.buttonText || {}
  let calendarButtonText = optionsManager.computed.buttonText || {}
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
            calendar.changeView(buttonName)
          };
          (buttonText = viewSpec.buttonTextOverride) ||
          (buttonIcon = theme.getIconClass(buttonName, isRtl)) ||
          (buttonText = viewSpec.buttonTextDefault)

        } else if (calendar[buttonName]) { // a calendar method
          buttonClick = function() {
            calendar[buttonName]()
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
