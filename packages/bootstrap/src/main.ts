import { Theme, createPlugin } from '@fullcalendar/core'
import './main.scss'

export class BootstrapTheme extends Theme {
}

BootstrapTheme.prototype.classes = {
  root: 'fc-bootstrap',
  table: 'table-bordered',
  tableCellShaded: 'table-active',
  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  buttonActive: 'active',
  popover: 'card card-primary',
  popoverHeader: 'card-header',
  popoverContent: 'card-body',
  today: 'alert alert-info',
  bordered: 'card card-primary fc-bootstrap-bordered'
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

let plugin = createPlugin({
  themeClasses: {
    bootstrap: BootstrapTheme
  }
})

export default plugin
