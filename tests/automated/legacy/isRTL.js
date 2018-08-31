describe('isRtl', function() {

  it('has it\'s default value computed differently based off of the locale', function() {
    initCalendar({
      locale: 'ar' // Arabic is RTL
    })
    expect(currentCalendar.getOption('isRtl')).toEqual(true)
  })

  // NOTE: don't put tests related to other options in here!
  // Put them in the test file for the individual option!

  it('adapts to dynamic option change', function() {
    initCalendar({
      isRtl: false
    })
    var $el = $(currentCalendar.el)

    expect($el).toHaveClass('fc-ltr')
    expect($el).not.toHaveClass('fc-rtl')

    currentCalendar.setOption('isRtl', true)

    expect($el).toHaveClass('fc-rtl')
    expect($el).not.toHaveClass('fc-ltr')
  })

})
