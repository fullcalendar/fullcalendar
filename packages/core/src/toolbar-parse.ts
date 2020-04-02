import { ViewSpec } from './structs/view-spec'
import Calendar from './Calendar'
import Theme from './theme/Theme'

export interface ToolbarModel {
  left: ToolbarWidget[][]
  center: ToolbarWidget[][]
  right: ToolbarWidget[][]
}

export interface ToolbarWidget {
  buttonName: string
  buttonClick?: any
  buttonIcon?: any
  buttonText?: any
}

export function parseToolbars(allOptions, theme: Theme, isRtl: boolean, calendar: Calendar) {
  let viewsWithButtons: string[] = []
  let header = allOptions.header ? parseToolbar(allOptions.header, theme, isRtl, calendar, viewsWithButtons) : null
  let footer = allOptions.footer ? parseToolbar(allOptions.footer, theme, isRtl, calendar, viewsWithButtons) : null

  return { header, footer, viewsWithButtons }
}

function parseToolbar(raw, theme: Theme, isRtl: boolean, calendar: Calendar, viewsWithButtons: string[]): ToolbarModel {
  return {
    left: raw.left ? parseSection(raw.left, theme, isRtl, calendar, viewsWithButtons) : [],
    center: raw.center ? parseSection(raw.center, theme, isRtl, calendar, viewsWithButtons) : [],
    right: raw.right ? parseSection(raw.right, theme, isRtl, calendar, viewsWithButtons) : []
  }
}

function parseSection(sectionStr: string, theme: Theme, isRtl: boolean, calendar: Calendar, viewsWithButtons: string[]): ToolbarWidget[][] {
  let optionsManager = calendar.optionsManager
  let viewSpecs = calendar.viewSpecs
  let calendarCustomButtons = optionsManager.computed.customButtons || {}
  let calendarButtonTextOverrides = optionsManager.overrides.buttonText || {}
  let calendarButtonText = optionsManager.computed.buttonText || {}

  return sectionStr.split(' ').map((buttonGroupStr, i): ToolbarWidget[] => {
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
