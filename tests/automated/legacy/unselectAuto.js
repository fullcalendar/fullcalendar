describe('unselectAuto', function() {
  var View = FullCalendar.View

  pushOptions({
    selectable: true,
    defaultDate: '2014-12-25',
    defaultView: 'month'
  })

  beforeEach(function() {
    $('<div id="otherthing" />').appendTo('body')
  })

  afterEach(function() {
    $('#otherthing').remove()
  })

  describe('when enabled', function() {

    pushOptions({
      unselectAuto: true
    })

    describe('when clicking away', function() {
      it('unselects the current selection when clicking elsewhere in DOM', function(done) {

        initCalendar({
          unselect: function(ev, view) {
            expect($('.fc-highlight').length).toBe(0)

            expect('currentTarget' in ev).toBe(true) // a JS event
            expect(view instanceof View).toBe(true)

            done()
          }
        })
        currentCalendar.select('2014-12-01', '2014-12-03')

        expect($('.fc-highlight').length).toBeGreaterThan(0)

        $('#otherthing')
          .simulate('mousedown')
          .simulate('mouseup')
          .simulate('click')
      })
    })

    describe('when clicking another date', function() {
      it('unselects the current selection when clicking elsewhere in DOM', function(done) {

        initCalendar({
          unselect: function(ev, view) {
            expect($('.fc-highlight').length).toBe(0)

            expect('currentTarget' in ev).toBe(true) // a JS event
            expect(view instanceof View).toBe(true)

            done()
          }
        })
        currentCalendar.select('2014-12-01', '2014-12-03')

        expect($('.fc-highlight').length).toBeGreaterThan(0)

        $('.fc-day[data-date="2014-12-04"]').simulate('drag')
      })
    })
  })

  describe('when disabled', function() {

    pushOptions({
      unselectAuto: false
    })

    it('keeps current selection when clicking elsewhere in DOM', function() {
      initCalendar()
      currentCalendar.select('2014-12-01', '2014-12-03')

      expect($('.fc-highlight').length).toBeGreaterThan(0)

      $('#otherthing')
        .simulate('mousedown')
        .simulate('mouseup')
        .simulate('click')

      expect($('.fc-highlight').length).toBeGreaterThan(0)
    })
  })
})
