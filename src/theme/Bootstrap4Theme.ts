import Theme from './Theme'

export default class Bootstrap4Theme extends Theme {
}

Bootstrap4Theme.prototype.classes = {
  widget: 'fc-bootstrap4',

  tableGrid: 'table-bordered', // avoid `table` class b/c don't want margins. only border color
  tableList: 'table', // `table` class creates bottom margin but who cares
  tableListHeading: 'table-active',

  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  stateActive: 'active',
  stateDisabled: 'disabled',

  today: 'alert alert-info', // the plain `info` class requires `.table`, too much to ask

  popover: 'card card-primary',
  popoverHeader: 'card-header',
  popoverContent: 'card-body',

  // day grid
  // for left/right border color when border is inset from edges (all-day in agenda view)
  // avoid `table` class b/c don't want margins/padding/structure. only border color.
  headerRow: 'table-bordered',
  dayRow: 'table-bordered',

  // list view
  listView: 'card card-primary'
}

Bootstrap4Theme.prototype.baseIconClass = 'fa'
Bootstrap4Theme.prototype.iconClasses = {
  close: 'fa-times',
  prev: 'fa-chevron-left',
  next: 'fa-chevron-right',
  prevYear: 'fa-angle-double-left',
  nextYear: 'fa-angle-double-right'
}

Bootstrap4Theme.prototype.iconOverrideOption = 'bootstrapFontAwesome'
Bootstrap4Theme.prototype.iconOverrideCustomButtonOption = 'bootstrapFontAwesome'
Bootstrap4Theme.prototype.iconOverridePrefix = 'fa-'
