import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('allDayText', () => {
  describe('when allDaySlots is not set', () => {
    describe('in week', () => {
      it('should default allDayText to using \'all-day\'', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
    describe('in day', () => {
      it('should default allDayText to using \'all-day\'', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
  })

  describe('when allDaySlots is set true', () => {
    describe('in week', () => {
      it('should default allDayText to using \'all-day\'', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
          allDaySlot: true,
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
    describe('in day', () => {
      it('should default allDayText to using \'all-day\'', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
          allDaySlot: true,
        })
        expectAllDayTextToBe(calendar, 'all-day')
      })
    })
  })

  describe('when allDaySlots is set true and locale is not default', () => {
    describe('in week', () => {
      it('should use the locale\'s all-day value', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
          allDaySlot: true,
          locale: ptBrLocale,
        })
        expectAllDayTextToBe(calendar, 'dia inteiro')
      })
    })
    describe('in day', () => {
      it('should use the locale\'s all-day value', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
          allDaySlot: true,
          locale: ptBrLocale,
        })
        expectAllDayTextToBe(calendar, 'dia inteiro')
      })
    })
  })

  describe('when allDaySlots is set true and allDayText is specified', () => {
    describe('in week', () => {
      it('should show specified all day text', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
          allDaySlot: true,
          allDayText: 'axis-phosy',
        })
        expectAllDayTextToBe(calendar, 'axis-phosy')
      })
    })
    describe('in day', () => {
      it('should show specified all day text', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
          allDayText: 'axis-phosy',
        })
        expectAllDayTextToBe(calendar, 'axis-phosy')
      })
    })
  })

  function expectAllDayTextToBe(calendar, text) {
    let viewWrapper = new TimeGridViewWrapper(calendar)
    let allDayText = viewWrapper.getAllDayAxisElText()
    expect(allDayText).toBe(text)
  }
})
