
describe('customButtons', function() {

  it('can specify text', function() {
    initCalendar({
      customButtons: {
        mybutton: { text: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })

    expect($('.fc-mybutton-button')).toHaveText('asdf')
  })

  it('can specify an icon', function() {
    initCalendar({
      customButtons: {
        mybutton: { icon: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })

    expect($('.fc-mybutton-button .fc-icon')).toHaveClass('fc-icon-asdf')
  })

  it('can specify a jquery-ui icon', function() {
    initCalendar({
      themeSystem: 'jquery-ui',
      customButtons: {
        mybutton: { themeIcon: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })

    expect($('.fc-mybutton-button .ui-icon')).toHaveClass('ui-icon-asdf')
  })

  it('can specify a bootstrap glyphicon', function() {
    initCalendar({
      themeSystem: 'bootstrap3',
      customButtons: {
        mybutton: { bootstrapGlyphicon: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })

    expect($('.fc-mybutton-button .glyphicon')).toHaveClass('glyphicon-asdf')
  })

  it('can specify a bootstrap4 font-awesome icon', function() {
    initCalendar({
      themeSystem: 'bootstrap4',
      customButtons: {
        mybutton: { bootstrapFontAwesome: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })

    expect($('.fc-mybutton-button .fa')).toHaveClass('fa-asdf')
  })
})
