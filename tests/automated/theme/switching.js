
describe('theme switching', function() {

  it('can switch from standard to jquery-ui', function() {
    initCalendar()
    verifyStandardTheme()
    currentCalendar.option('themeSystem', 'jquery-ui')
    verifyJqueryUiTheme()
  })

  it('can switch from jquery-ui to boostrap3', function() {
    initCalendar({ themeSystem: 'jquery-ui' })
    verifyJqueryUiTheme()
    currentCalendar.option('themeSystem', 'bootstrap3')
    verifyBootstrapTheme()
  })

  it('can switch from jquery-ui to boostrap4', function() {
    initCalendar({ themeSystem: 'jquery-ui' })
    verifyJqueryUiTheme()
    currentCalendar.option('themeSystem', 'bootstrap4')
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

  function verifyBootstrapTheme() {
    expect($('.fc-bootstrap3')).toBeInDOM()
    expect($('.fc .table-bordered')).toBeInDOM()
  }

  function verifyBootstrap4Theme() {
    expect($('.fc-bootstrap4')).toBeInDOM()
    expect($('.fc .table-bordered')).toBeInDOM()
  }

})
