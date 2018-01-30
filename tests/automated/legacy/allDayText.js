
describe('allDayText', function() {

  describe('when allDaySlots is not set', function() {
    describe('in agendaWeek', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'agendaWeek'
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('all-day')
      })
    })
    describe('in agendaDay', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'agendaDay'
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('all-day')
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in agendaWeek', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'agendaWeek',
          allDaySlot: true
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('all-day')
      })
    })
    describe('in agendaDay', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'agendaDay',
          allDaySlot: true
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('all-day')
      })
    })
  })

  describe('when allDaySlots is set true and locale is not default', function() {
    describe('in agendaWeek', function() {
      it('should use the locale\'s all-day value', function() {
        var options = {
          defaultView: 'agendaWeek',
          allDaySlot: true,
          locale: 'pt-br'
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('dia inteiro')
      })
    })
    describe('in agendaDay', function() {
      it('should use the locale\'s all-day value', function() {
        var options = {
          defaultView: 'agendaDay',
          allDaySlot: true,
          locale: 'pt-br'
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('dia inteiro')
      })
    })
  })

  describe('when allDaySlots is set true and allDayText is specified', function() {
    describe('in agendaWeek', function() {
      it('should show specified all day text', function() {
        var options = {
          defaultView: 'agendaWeek',
          allDaySlot: true,
          allDayText: 'axis-phosy'
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('axis-phosy')
      })
    })
    describe('in agendaDay', function() {
      it('should show specified all day text', function() {
        var options = {
          defaultView: 'agendaDay',
          allDayText: 'axis-phosy'
        }
        initCalendar(options)
        var allDayText = $('.fc-day-grid > .fc-row > .fc-bg .fc-axis').text()
        expect(allDayText).toEqual('axis-phosy')
      })
    })
  })
})
