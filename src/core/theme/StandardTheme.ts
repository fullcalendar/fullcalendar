import Theme from './Theme'

export default class StandardTheme extends Theme {
}

StandardTheme.prototype.classes = {
  widget: 'fc-unthemed',
  widgetHeader: 'fc-widget-header',
  widgetContent: 'fc-widget-content',

  buttonGroup: 'fc-button-group',
  button: 'fc-button fc-button-primary',
  buttonActive: 'fc-button-active',

  popoverHeader: 'fc-widget-header',
  popoverContent: 'fc-widget-content',

  // day grid
  headerRow: 'fc-widget-header',
  dayRow: 'fc-widget-content',

  // list view
  listView: 'fc-widget-content'
}

StandardTheme.prototype.baseIconClass = 'fc-icon'
StandardTheme.prototype.iconClasses = {
  close: 'fc-icon-x',
  prev: 'fc-icon-chevron-left',
  next: 'fc-icon-chevron-right',
  prevYear: 'fc-icon-chevrons-left',
  nextYear: 'fc-icon-chevrons-right'
}

StandardTheme.prototype.iconOverrideOption = 'buttonIcons'
StandardTheme.prototype.iconOverrideCustomButtonOption = 'icon'
StandardTheme.prototype.iconOverridePrefix = 'fc-icon-'
