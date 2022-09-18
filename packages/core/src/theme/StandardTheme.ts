import { Theme } from './Theme.js'

export class StandardTheme extends Theme {
}

StandardTheme.prototype.classes = {
  root: 'fc-theme-standard', // TODO: compute this off of registered theme name
  tableCellShaded: 'fc-cell-shaded',
  buttonGroup: 'fc-button-group',
  button: 'fc-button fc-button-primary',
  buttonActive: 'fc-button-active',
}

StandardTheme.prototype.baseIconClass = 'fc-icon'
StandardTheme.prototype.iconClasses = {
  close: 'fc-icon-x',
  prev: 'fc-icon-chevron-left',
  next: 'fc-icon-chevron-right',
  prevYear: 'fc-icon-chevrons-left',
  nextYear: 'fc-icon-chevrons-right',
}
StandardTheme.prototype.rtlIconClasses = {
  prev: 'fc-icon-chevron-right',
  next: 'fc-icon-chevron-left',
  prevYear: 'fc-icon-chevrons-right',
  nextYear: 'fc-icon-chevrons-left',
}

StandardTheme.prototype.iconOverrideOption = 'buttonIcons' // TODO: make TS-friendly
StandardTheme.prototype.iconOverrideCustomButtonOption = 'icon'
StandardTheme.prototype.iconOverridePrefix = 'fc-icon-'
