import BootstrapPlugin from '@fullcalendar/bootstrap'
import DayGridPlugin from '@fullcalendar/daygrid'

describe('theme switching', function() {
  pushOptions({
    plugins: [ BootstrapPlugin, DayGridPlugin ]
  })

  it('can switch from standard to bootstrap', function() {
    initCalendar()
    verifyStandardTheme()
    currentCalendar.setOption('themeSystem', 'bootstrap')
    verifyBootstrapTheme()
  })

  it('can switch from bootstrap to standard', function() {
    initCalendar({ themeSystem: 'bootstrap' })
    verifyBootstrapTheme()
    currentCalendar.setOption('themeSystem', 'standard')
    verifyStandardTheme()
  })


  function verifyStandardTheme() {
    expect($('.fc-unthemed')).toBeInDOM()
    expect($('.fc-widget-header')).toBeInDOM()
  }

  function verifyBootstrapTheme() {
    expect($('.fc-bootstrap')).toBeInDOM()
    expect($('.fc .table-bordered')).toBeInDOM()
  }

})
