import StandardTheme from './StandardTheme'
import JqueryUiTheme from './JqueryUiTheme'


const themeClassHash = {} as any


export function defineThemeSystem(themeName, themeClass) {
  themeClassHash[themeName] = themeClass
}


export function getThemeSystemClass(themeSetting) {
  if (!themeSetting) {
    return StandardTheme
  } else if (themeSetting === true) {
    return JqueryUiTheme
  } else {
    return themeClassHash[themeSetting]
  }
}
