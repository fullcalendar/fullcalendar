import Theme from './Theme'

export default class JqueryUiTheme extends Theme {
}

JqueryUiTheme.prototype.classes = {
  widget: 'ui-widget',
  widgetHeader: 'ui-widget-header',
  widgetContent: 'ui-widget-content',

  buttonGroup: 'fc-button-group',
  button: 'ui-button',
  cornerLeft: 'ui-corner-left',
  cornerRight: 'ui-corner-right',
  stateDefault: 'ui-state-default',
  stateActive: 'ui-state-active',
  stateDisabled: 'ui-state-disabled',
  stateHover: 'ui-state-hover',
  stateDown: 'ui-state-down',

  today: 'ui-state-highlight',

  popoverHeader: 'ui-widget-header',
  popoverContent: 'ui-widget-content',

  // day grid
  headerRow: 'ui-widget-header',
  dayRow: 'ui-widget-content',

  // list view
  listView: 'ui-widget-content'
}

JqueryUiTheme.prototype.baseIconClass = 'ui-icon'
JqueryUiTheme.prototype.iconClasses = {
  close: 'ui-icon-closethick',
  prev: 'ui-icon-circle-triangle-w',
  next: 'ui-icon-circle-triangle-e',
  prevYear: 'ui-icon-seek-prev',
  nextYear: 'ui-icon-seek-next'
}

JqueryUiTheme.prototype.iconOverrideOption = 'themeButtonIcons'
JqueryUiTheme.prototype.iconOverrideCustomButtonOption = 'themeIcon'
JqueryUiTheme.prototype.iconOverridePrefix = 'ui-icon-'
