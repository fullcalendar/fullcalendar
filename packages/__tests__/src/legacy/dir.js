import arLocale from '@fullcalendar/core/locales/ar'

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

    expect($el).toHaveClass('fc-ltr')
    expect($el).not.toHaveClass('fc-rtl')

    currentCalendar.setOption('dir', 'rtl')

    expect($el).toHaveClass('fc-rtl')
    expect($el).not.toHaveClass('fc-ltr')
  })

})
