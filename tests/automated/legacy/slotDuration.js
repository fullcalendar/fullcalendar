describe('slotDuration', function() {

  var minutesInADay = 1440

  describe('when using the default settings', function() {
    describe('in week', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'timeGridWeek'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
    describe('in day', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'timeGridDay'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
  })

  describe('when slotMinutes is set to 30', function() {
    describe('in week', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'timeGridWeek'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
    describe('in day', function() {
      it('should have slots 1440/30 slots', function() {
        initCalendar({
          defaultView: 'timeGridDay'
        })
        var slotCount = $('.fc-slats tr').length
        expect(slotCount).toEqual(Math.ceil(minutesInADay / 30))
      })
    })
  })

  describe('when slotMinutes is set to a series of times', function() {

    var slotMinutesList = [ 10, 12, 15, 17, 20, 30, 35, 45, 60, 62, 120, 300 ]

    describe('in week', function() {
      slotMinutesList.forEach(function(slotMinutes) {
        it('should have slots 1440/x slots', function() {
          initCalendar({
            defaultView: 'timeGridWeek',
            slotDuration: { minutes: slotMinutes }
          })
          var slotCount = $('.fc-slats tr').length
          var expected = Math.ceil(minutesInADay / slotMinutes)
          expect(slotCount).toEqual(expected)
        })
      })
    })

    describe('in day', function() {
      slotMinutesList.forEach(function(slotMinutes) {
        it('should have slots 1440/x slots', function() {
          initCalendar({
            defaultView: 'timeGridDay',
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
