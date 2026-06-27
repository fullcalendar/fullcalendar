import arLocale from 'fullcalendar/locales/ar'

describe('direction', () => {
  it('has it\'s default value computed differently based off of the locale', () => {
    let calendar = initCalendar({
      locale: arLocale, // Arabic is RTL
    })
    expect(calendar.getOption('direction')).toEqual('rtl')
  })

  // NOTE: don't put tests related to other options in here!
  // Put them in the test file for the individual option!

  it('adapts to dynamic option change', () => {
    let calendar = initCalendar({
      direction: 'ltr',
    })
    let $el = $(calendar.el)

    expect($el).not.toHaveAttr('dir', 'rtl')
    calendar.setOption('direction', 'rtl')
    expect($el).toHaveAttr('dir', 'rtl')
  })
})
