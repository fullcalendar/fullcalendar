import plugin from './index'

declare global {
  var FullCalendar: any
}

FullCalendar.globalPlugins.push(plugin)
