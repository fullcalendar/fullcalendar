import Theme from './Theme'

export default class Bootstrap3Theme extends Theme {
}

Bootstrap3Theme.prototype.classes = {
  widget: 'fc-bootstrap3',

  tableGrid: 'table-bordered', // avoid `table` class b/c don't want margins. only border color
  tableList: 'table', // `table` class creates bottom margin but who cares
  tableListHeading: 'active',

  buttonGroup: 'btn-group',
  button: 'btn btn-default',
  stateActive: 'active',
  stateDisabled: 'disabled',

  today: 'alert alert-info', // the plain `info` class requires `.table`, too much to ask

  popover: 'panel panel-default',
  popoverHeader: 'panel-heading',
  popoverContent: 'panel-body',

  // day grid
  // for left/right border color when border is inset from edges (all-day in agenda view)
  // avoid `panel` class b/c don't want margins/radius. only border color.
  headerRow: 'panel-default',
  dayRow: 'panel-default',

  // list view
  listView: 'panel panel-default'
}

Bootstrap3Theme.prototype.baseIconClass = 'glyphicon'
Bootstrap3Theme.prototype.iconClasses = {
  close: 'glyphicon-remove',
  prev: 'glyphicon-chevron-left',
  next: 'glyphicon-chevron-right',
  prevYear: 'glyphicon-backward',
  nextYear: 'glyphicon-forward'
}

Bootstrap3Theme.prototype.iconOverrideOption = 'bootstrapGlyphicons'
Bootstrap3Theme.prototype.iconOverrideCustomButtonOption = 'bootstrapGlyphicon'
Bootstrap3Theme.prototype.iconOverridePrefix = 'glyphicon-'
