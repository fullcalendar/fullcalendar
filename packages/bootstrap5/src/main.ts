import { Theme, createPlugin } from '@fullcalendar/common'
import './main.css'

export class Bootstrap5Theme extends Theme {
}
Bootstrap5Theme.prototype.classes = {
  root: 'fc-theme-bootstrap5', // TODO: compute this off of registered theme name
  table: 'table-bordered', // don't attache the `table` class. we only want the borders, not any layout
  tableCellShaded: 'table-active',
  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  buttonActive: 'active',
  popover: 'popover',
  popoverHeader: 'popover-header',
  popoverContent: 'popover-body',
}

Bootstrap5Theme.prototype.baseIconClass = 'fa'
Bootstrap5Theme.prototype.iconClasses = {
  close: 'fa-times',
  prev: 'fa-chevron-left',
  next: 'fa-chevron-right',
  prevYear: 'fa-angle-double-left',
  nextYear: 'fa-angle-double-right',
}
Bootstrap5Theme.prototype.rtlIconClasses = {
  prev: 'fa-chevron-right',
  next: 'fa-chevron-left',
  prevYear: 'fa-angle-double-right',
  nextYear: 'fa-angle-double-left',
}

Bootstrap5Theme.prototype.iconOverrideOption = 'bootstrapFontAwesome' // TODO: make TS-friendly. move the option-processing into this plugin
Bootstrap5Theme.prototype.iconOverrideCustomButtonOption = 'bootstrapFontAwesome'
Bootstrap5Theme.prototype.iconOverridePrefix = 'fa-'

const plugin = createPlugin({
  themeClasses: {
    bootstrap5: Bootstrap5Theme,
  },
})

export default plugin
