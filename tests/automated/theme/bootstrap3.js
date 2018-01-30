
describe('bootstrap3 theme', function() {
  pushOptions({ themeSystem: 'bootstrap3' })

  describe('glyphicons', function() {
    pushOptions({
      header: { left: '', center: '', right: 'next' }
    })

    it('renders default', function() {
      initCalendar()
      expect($('.glyphicon')).toHaveClass('glyphicon-chevron-right')
    })

    it('renders a customized icon', function() {
      initCalendar({
        bootstrapGlyphicons: {
          next: 'asdf'
        }
      })
      expect($('.glyphicon')).toHaveClass('glyphicon-asdf')
    })

    it('renders text when specified as false', function() {
      initCalendar({
        bootstrapGlyphicons: false
      })
      expect($('.glyphicon')).not.toBeInDOM()
      expect($('.fc-next-button')).toHaveText('next')
    })
  })

})
