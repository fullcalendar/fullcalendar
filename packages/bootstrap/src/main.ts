import { Theme, createPlugin } from '@fullcalendar/common'
import './main.scss'

export class BootstrapTheme extends Theme {
}

BootstrapTheme.prototype.classes = {
  root: 'fc-theme-bootstrap', // TODO: compute this off of registered theme name
  table: 'table-bordered',
  tableCellShaded: 'table-active',
  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  buttonActive: 'active',
  popover: 'card card-primary',
  popoverHeader: 'card-header',
  popoverContent: 'card-body',
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
BootstrapTheme.prototype.rtlIconClasses = {
  prev: 'fa-chevron-right',
  next: 'fa-chevron-left',
  prevYear: 'fa-angle-double-right',
  nextYear: 'fa-angle-double-left'
}

BootstrapTheme.prototype.iconOverrideOption = 'bootstrapFontAwesome' // TODO: make TS-friendly. move the option-processing into this plugin
BootstrapTheme.prototype.iconOverrideCustomButtonOption = 'bootstrapFontAwesome'
BootstrapTheme.prototype.iconOverridePrefix = 'fa-'

let plugin = createPlugin({
  themeClasses: {
    bootstrap: BootstrapTheme
  }
})

export default plugin
