import arLocale from '@fullcalendar/core/locales/ar'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'

describe('dir', function() {

  it('has it\'s default value computed differently based off of the locale', function() {
    initCalendar({
      locale: arLocale // Arabic is RTL
    })
    expect(currentCalendar.getOption('dir')).toEqual('rtl')
  })

  // NOTE: don't put tests related to other options in here!
  // Put them in the test file for the individual option!

  it('adapts to dynamic option change', function() {
    initCalendar({
      dir: 'ltr'
    })
    var $el = $(currentCalendar.el)

    expect($el).toHaveClass(CalendarWrapper.LTR_CLASSNAME)
    expect($el).not.toHaveClass(CalendarWrapper.RTL_CLASSNAME)

    currentCalendar.setOption('dir', 'rtl')

    expect($el).toHaveClass(CalendarWrapper.RTL_CLASSNAME)
    expect($el).not.toHaveClass(CalendarWrapper.LTR_CLASSNAME)
  })

})
