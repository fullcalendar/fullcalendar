describe('slotDuration', function() {

  var minutesInADay = 1440

  describe('when using the default settings', function() {
    describe('in agendaWeek', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'agendaWeek'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
    describe('in agendaDay', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'agendaDay'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
  })

  describe('when slotMinutes is set to 30', function() {
    describe('in agendaWeek', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'agendaWeek'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
    describe('in agendaDay', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'agendaDay'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
  })

  describe('when slotMinutes is set to a series of times', function() {

    var slotMinutesList = [ 10, 12, 15, 17, 20, 30, 35, 45, 60, 62, 120, 300 ]

    describe('in agendaWeek', function() {
      slotMinutesList.forEach(function(slotMinutes) {
        it('should have slots 1440/x slots', function() {
          initCalendar({
            defaultView: 'agendaWeek',
            slotDuration: { minutes: slotMinutes }
          })
          var slotCount = $('.fc-slats tr').length
          var expected = Math.ceil(minutesInADay / slotMinutes)
          expect(slotCount).toEqual(expected)
        })
      })
    })

    describe('in agendaDay', function() {
      slotMinutesList.forEach(function(slotMinutes) {
        it('should have slots 1440/x slots', function() {
          initCalendar({
            defaultView: 'agendaDay',
            slotDuration: { minutes: slotMinutes }
          })
          var slotCount = $('.fc-slats tr').length
          var expected = Math.ceil(minutesInADay / slotMinutes)
          expect(slotCount).toEqual(expected)
        })
      })
    })
  })
})
