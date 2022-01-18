import { Theme, createPlugin } from '@fullcalendar/common'
import './main.css'

export class BootstrapTheme extends Theme {
}

BootstrapTheme.prototype.classes = {
  root: 'fc-theme-bootstrap5',
  tableCellShaded: 'fc-theme-bootstrap5-shaded',
  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  buttonActive: 'active',
  popover: 'popover',
  popoverHeader: 'popover-header',
  popoverContent: 'popover-body',
}

BootstrapTheme.prototype.baseIconClass = 'bi'
BootstrapTheme.prototype.iconClasses = {
  close: 'bi-x-lg',
  prev: 'bi-arrow-left',
  next: 'bi-arrow-right',
  prevYear: 'bi-arrow-bar-left',
  nextYear: 'bi-arrow-bar-right',
}
BootstrapTheme.prototype.rtlIconClasses = {
  prev: 'bi-arrow-right',
  next: 'bi-arrow-left',
  prevYear: 'bi-arrow-bar-right',
  nextYear: 'bi-arrow-bar-left',
}

// wtf
BootstrapTheme.prototype.iconOverrideOption = 'buttonIcons' // TODO: make TS-friendly
BootstrapTheme.prototype.iconOverrideCustomButtonOption = 'icon'
BootstrapTheme.prototype.iconOverridePrefix = 'bi-'

const plugin = createPlugin({
  themeClasses: {
    bootstrap5: BootstrapTheme,
  },
})

export default plugin
