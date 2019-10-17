import BootstrapPlugin from '@fullcalendar/bootstrap'
import DayGridPlugin from '@fullcalendar/daygrid'

describe('customButtons', function() {
  pushOptions({
    plugins: [ BootstrapPlugin, DayGridPlugin ]
  })

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

  it('can specify a bootstrap font-awesome icon', function() {
    initCalendar({
      themeSystem: 'bootstrap',
      customButtons: {
        mybutton: { bootstrapFontAwesome: 'asdf' }
      },
      header: { left: 'mybutton', center: '', right: '' }
    })

    expect($('.fc-mybutton-button .fa')).toHaveClass('fa-asdf')
  })
})
