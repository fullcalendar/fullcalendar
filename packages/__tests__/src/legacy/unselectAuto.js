import DayGridViewWrapper from "../lib/wrappers/DayGridViewWrapper"

describe('unselectAuto', function() {
  pushOptions({
    selectable: true,
    initialDate: '2014-12-25',
    initialView: 'dayGridMonth'
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
        let calendar = initCalendar({
          unselect: function(arg) {
            expect(dayGridWrapper.getHighlightEls().length).toBe(0)
            expect('currentTarget' in arg.jsEvent).toBe(true) // a JS event
            expect(typeof arg.view).toBe('object')
            done()
          }
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        calendar.select('2014-12-01', '2014-12-03')
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)

        $('#otherthing')
          .simulate('mousedown')
          .simulate('mouseup')
          .simulate('click')
      })
    })

    describe('when clicking another date', function() {

      it('unselects the current selection when clicking elsewhere in DOM', function(done) {
        let calendar = initCalendar({
          unselect: function(arg) {
            expect(dayGridWrapper.getHighlightEls().length).toBe(0)
            expect('currentTarget' in arg.jsEvent).toBe(true) // a JS event
            expect(typeof arg.view).toBe('object')
            done()
          }
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        calendar.select('2014-12-01', '2014-12-03')
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)

        $(dayGridWrapper.getDayEl('2014-12-04')).simulate('drag')
      })
    })
  })

  describe('when disabled', function() {
    pushOptions({
      unselectAuto: false
    })

    it('keeps current selection when clicking elsewhere in DOM', function(done) {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      calendar.select('2014-12-01', '2014-12-03')
      expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)

      $('#otherthing')
        .simulate('mousedown')
        .simulate('mouseup')
        .simulate('click')

      setTimeout(function() {
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)
        done()
      })
    })
  })
})
