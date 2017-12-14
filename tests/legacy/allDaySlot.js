
describe('allDaySlots', function() {

  describe('when allDaySlots is not set', function() {
    describe('in agendaWeek', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'agendaWeek'
        }
        initCalendar(options)
        var allDaySlotCount = $('.fc-day-grid').length
        expect(allDaySlotCount).toEqual(1)
      })
    })
    describe('in agendaDay', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'agendaDay'
        }
        initCalendar(options)
        var allDaySlotCount = $('.fc-day-grid').length
        expect(allDaySlotCount).toEqual(1)
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in agendaWeek', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'agendaWeek',
          allDaySlot: true
        }
        initCalendar(options)
        var allDaySlotCount = $('.fc-day-grid').length
        expect(allDaySlotCount).toEqual(1)
      })
    })
    describe('in agendaDay', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'agendaDay',
          allDaySlot: true
        }
        initCalendar(options)
        var allDaySlotCount = $('.fc-day-grid').length
        expect(allDaySlotCount).toEqual(1)
      })
    })
  })

  describe('when allDaySlots is set false', function() {
    describe('in agendaWeek', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'agendaWeek',
          allDaySlot: false
        }
        initCalendar(options)
        var allDaySlotCount = $('.fc-day-grid').length
        expect(allDaySlotCount).toEqual(0)
      })
    })
    describe('in agendaDay', function() {
      it('should default to having an allDaySlots table', function() {
        var options = {
          defaultView: 'agendaDay',
          allDaySlot: false
        }
        initCalendar(options)
        var allDaySlotCount = $('.fc-day-grid').length
        expect(allDaySlotCount).toEqual(0)
      })
    })
  })
})
