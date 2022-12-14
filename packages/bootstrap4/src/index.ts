import { createPlugin, PluginDef } from '@fullcalendar/core'
import { BootstrapTheme } from './BootstrapTheme.js'
import './index.css'

export default createPlugin({
  name: '<%= pkgName %>',
  themeClasses: {
    bootstrap: BootstrapTheme,
  },
}) as PluginDef
