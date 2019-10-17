import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { getAllDayAxisElText } from '../view-render/DayGridRenderUtils'

describe('allDayText', function() {

  describe('when allDaySlots is not set', function() {
    describe('in week', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'timeGridWeek'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'timeGridDay'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
  })

  describe('when allDaySlots is set true', function() {
    describe('in week', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'timeGridWeek',
          allDaySlot: true
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
    describe('in day', function() {
      it('should default allDayText to using \'all-day\'', function() {
        var options = {
          defaultView: 'timeGridDay',
          allDaySlot: true
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('all-day')
      })
    })
  })

  describe('when allDaySlots is set true and locale is not default', function() {
    describe('in week', function() {
      it('should use the locale\'s all-day value', function() {
        var options = {
          defaultView: 'timeGridWeek',
          allDaySlot: true,
          locale: ptBrLocale
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('dia inteiro')
      })
    })
    describe('in day', function() {
      it('should use the locale\'s all-day value', function() {
        var options = {
          defaultView: 'timeGridDay',
          allDaySlot: true,
          locale: ptBrLocale
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('dia inteiro')
      })
    })
  })

  describe('when allDaySlots is set true and allDayText is specified', function() {
    describe('in week', function() {
      it('should show specified all day text', function() {
        var options = {
          defaultView: 'timeGridWeek',
          allDaySlot: true,
          allDayText: 'axis-phosy'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('axis-phosy')
      })
    })
    describe('in day', function() {
      it('should show specified all day text', function() {
        var options = {
          defaultView: 'timeGridDay',
          allDayText: 'axis-phosy'
        }
        initCalendar(options)
        var allDayText = getAllDayAxisElText()
        expect(allDayText).toEqual('axis-phosy')
      })
    })
  })
})
