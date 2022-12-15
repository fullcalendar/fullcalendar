import { Theme } from '@fullcalendar/core/internal'

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
  prev: 'bi-chevron-left',
  next: 'bi-chevron-right',
  prevYear: 'bi-chevron-double-left',
  nextYear: 'bi-chevron-double-right',
}
BootstrapTheme.prototype.rtlIconClasses = {
  prev: 'bi-chevron-right',
  next: 'bi-chevron-left',
  prevYear: 'bi-chevron-double-right',
  nextYear: 'bi-chevron-double-left',
}

// wtf
BootstrapTheme.prototype.iconOverrideOption = 'buttonIcons' // TODO: make TS-friendly
BootstrapTheme.prototype.iconOverrideCustomButtonOption = 'icon'
BootstrapTheme.prototype.iconOverridePrefix = 'bi-'

export { Theme }
