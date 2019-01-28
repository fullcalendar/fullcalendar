
describe('theme switching', function() {

  it('can switch from standard to jquery-ui', function() {
    initCalendar()
    verifyStandardTheme()
    currentCalendar.setOption('themeSystem', 'jquery-ui')
    verifyJqueryUiTheme()
  })

  it('can switch from jquery-ui to boostrap4', function() {
    initCalendar({ themeSystem: 'jquery-ui' })
    verifyJqueryUiTheme()
    currentCalendar.setOption('themeSystem', 'bootstrap4')
    verifyBootstrap4Theme()
  })


  function verifyStandardTheme() {
    expect($('.fc-unthemed')).toBeInDOM()
    expect($('.fc-widget-header')).toBeInDOM()
  }

  function verifyJqueryUiTheme() {
    expect($('.fc.ui-widget')).toBeInDOM()
    expect($('.ui-widget-header')).toBeInDOM()
  }

  function verifyBootstrap4Theme() {
    expect($('.fc-bootstrap4')).toBeInDOM()
    expect($('.fc .table-bordered')).toBeInDOM()
  }

})
