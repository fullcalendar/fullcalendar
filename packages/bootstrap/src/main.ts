import { Theme, createPlugin } from '@fullcalendar/common'
import './main.css'

export class BootstrapTheme extends Theme {
}

BootstrapTheme.prototype.classes = {
  root: 'fc-theme-bootstrap', // TODO: compute this off of registered theme name
  table: 'table-bordered', // don't attache the `table` class. we only want the borders, not any layout
  tableCellShaded: 'table-active',
  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  buttonActive: 'active',
  popover: 'popover',
  popoverHeader: 'popover-header',
  popoverContent: 'popover-body',
}

BootstrapTheme.prototype.baseIconClass = 'fa'
BootstrapTheme.prototype.iconClasses = {
  close: 'fa-times',
  prev: 'fa-chevron-left',
  next: 'fa-chevron-right',
  prevYear: 'fa-angle-double-left',
  nextYear: 'fa-angle-double-right',
}
BootstrapTheme.prototype.rtlIconClasses = {
  prev: 'fa-chevron-right',
  next: 'fa-chevron-left',
  prevYear: 'fa-angle-double-right',
  nextYear: 'fa-angle-double-left',
}

BootstrapTheme.prototype.iconOverrideOption = 'bootstrapFontAwesome' // TODO: make TS-friendly. move the option-processing into this plugin
BootstrapTheme.prototype.iconOverrideCustomButtonOption = 'bootstrapFontAwesome'
BootstrapTheme.prototype.iconOverridePrefix = 'fa-'

const plugin = createPlugin({
  themeClasses: {
    bootstrap: BootstrapTheme,
  },
})

export default plugin
