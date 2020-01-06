import { Theme, createPlugin, addDefaultPluginIfGlobal } from '@fullcalendar/core'
import './main.scss'

export class BootstrapTheme extends Theme {
}

BootstrapTheme.prototype.classes = {
  root: 'fc-bootstrap',
  table: 'table table-bordered',
  tableCellActive: 'table-active',
  buttonGroup: 'btn-group',
  button: 'btn btn-primary',
  buttonActive: 'active',
  popover: 'card card-primary',
  popoverHeader: 'card-header',
  popoverContent: 'card-body',
  today: 'alert alert-info', // the plain `info` class requires `.table`, too much to ask
  bordered: 'card card-primary'
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
addDefaultPluginIfGlobal(plugin)
