import BootstrapPlugin from '@fullcalendar/bootstrap'
import DayGridPlugin from '@fullcalendar/daygrid'

describe('bootstrap theme', function() {
  pushOptions({
    plugins: [ BootstrapPlugin, DayGridPlugin ],
    themeSystem: 'bootstrap'
  })

  describe('fa', function() {
    pushOptions({
      header: { left: '', center: '', right: 'next' }
    })

    it('renders default', function() {
      initCalendar()
      expect($('.fa')).toHaveClass('fa-chevron-right')
    })

    it('renders a customized icon', function() {
      initCalendar({
        bootstrapFontAwesome: {
          next: 'asdf'
        }
      })
      expect($('.fa')).toHaveClass('fa-asdf')
    })

    it('renders text when specified as false', function() {
      initCalendar({
        bootstrapFontAwesome: false
      })
      expect($('.fa')).not.toBeInDOM()
      expect($('.fc-next-button')).toHaveText('next')
    })
  })

})
