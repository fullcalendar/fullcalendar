import { Theme, createPlugin } from '@fullcalendar/core'

export class BootstrapTheme extends Theme {
}

BootstrapTheme.prototype.classes = {
  widget: 'fc-bootstrap',

  tableGrid: 'table-bordered', // avoid `table` class b/c don't want margins. only border color
  tableList: 'table', // `table` class creates bottom margin but who cares
  tableListHeading: 'table-active',

  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  buttonActive: 'active',

  today: 'alert alert-info', // the plain `info` class requires `.table`, too much to ask

  popover: 'card card-primary',
  popoverHeader: 'card-header',
  popoverContent: 'card-body',

  // day grid
  // for left/right border color when border is inset from edges (all-day in timeGrid view)
  // avoid `table` class b/c don't want margins/padding/structure. only border color.
  headerRow: 'table-bordered',
  dayRow: 'table-bordered',

  // list view
  listView: 'card card-primary'
}

BootstrapTheme.prototype.baseIconClass = 'fa'
BootstrapTheme.prototype.iconClasses = {
  close: 'fa-times',
  prev: 'fa-chevron-left',
  next: 'fa-chevron-right',
  prevYear: 'fa-angle-double-left',
  nextYear: 'fa-angle-double-right'
}

BootstrapTheme.prototype.iconOverrideOption = 'bootstrapFontAwesome'
BootstrapTheme.prototype.iconOverrideCustomButtonOption = 'bootstrapFontAwesome'
BootstrapTheme.prototype.iconOverridePrefix = 'fa-'

export default createPlugin({
  themeClasses: {
    bootstrap: BootstrapTheme
  }
})
