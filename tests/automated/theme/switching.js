
describe('theme switching', function() {

  it('can switch from standard to bootstrap4', function() {
    initCalendar()
    verifyStandardTheme()
    currentCalendar.setOption('themeSystem', 'bootstrap4')
    verifyBootstrap4Theme()
  })

  it('can switch from bootstrap4 to standard', function() {
    initCalendar({ themeSystem: 'bootstrap4' })
    verifyBootstrap4Theme()
    currentCalendar.setOption('themeSystem', 'standard')
    verifyStandardTheme()
  })


  function verifyStandardTheme() {
    expect($('.fc-unthemed')).toBeInDOM()
    expect($('.fc-widget-header')).toBeInDOM()
  }

  function verifyBootstrap4Theme() {
    expect($('.fc-bootstrap4')).toBeInDOM()
    expect($('.fc .table-bordered')).toBeInDOM()
  }

})
