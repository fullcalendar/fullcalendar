import StandardTheme from './StandardTheme'


const themeClassHash = {} as any


export function defineThemeSystem(themeName, themeClass) {
  themeClassHash[themeName] = themeClass
}


export function getThemeSystemClass(themeSetting) {
  if (!themeSetting) {
    return StandardTheme
  } else {
    return themeClassHash[themeSetting]
  }
}
