import * as $ from 'jquery'
import * as exportHooks from './exports'
import { warn } from './util/misc'
import Calendar from './Calendar'

// for intentional side-effects
import './moment-ext'
import './date-formatting'
import './models/event-source/config'
import './theme/config'
import './basic/config'
import './agenda/config'
import './list/config'
import './types/jquery-hooks'


($ as any).fullCalendar = exportHooks
export = exportHooks


$.fn.fullCalendar = function(options?): (JQuery | any) {
  let args = Array.prototype.slice.call(arguments, 1) // for a possible method call
  let res = this // what this function will return (this jQuery object by default)

  this.each(function(i, el) { // loop each DOM element involved
    let $el = $(el)
    let calendar = $el.data('fullCalendar') // get the existing calendar object (if any)
    let singleRes // the returned value of this single method call

    // a method call
    if (typeof options === 'string') {

      if (options === 'getCalendar') {
        if (!i) { // first element only
          res = calendar
        }
      } else if (options === 'destroy') { // don't warn if no calendar object
        if (calendar) {
          calendar.destroy()
          $el.removeData('fullCalendar')
        }
      } else if (!calendar) {
        warn('Attempting to call a FullCalendar method on an element with no calendar.')
      } else if (typeof calendar[options] === 'function') {
        singleRes = calendar[options].apply(calendar, args)

        if (!i) {
          res = singleRes // record the first method call result
        }
        if (options === 'destroy') { // for the destroy method, must remove Calendar object data
          $el.removeData('fullCalendar')
        }
      } else {
        warn("'" + options + "' is an unknown FullCalendar method.")
      }
    } else if (!calendar) { // don't initialize twice
      calendar = new Calendar(el, options)
      $el.data('fullCalendar', calendar)
      calendar.render()
    }
  })

  return res
}
