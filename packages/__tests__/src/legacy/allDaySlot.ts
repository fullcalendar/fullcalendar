import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('allDaySlots', () => {
  describe('when allDaySlots is not set', () => {
    describe('in week', () => {
      it('should default to having an allDaySlots table', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
        })
        let dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
    describe('in day', () => {
      it('should default to having an allDaySlots table', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
        })
        let dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
  })

  describe('when allDaySlots is set true', () => {
    describe('in week', () => {
      it('should default to having an allDaySlots table', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
          allDaySlot: true,
        })
        let dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
    describe('in day', () => {
      it('should default to having an allDaySlots table', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
          allDaySlot: true,
        })
        let dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeTruthy()
      })
    })
  })

  describe('when allDaySlots is set false', () => {
    describe('in week', () => {
      it('should default to having an allDaySlots table', () => {
        let calendar = initCalendar({
          initialView: 'timeGridWeek',
          allDaySlot: false,
        })
        let dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeFalsy()
      })
    })
    describe('in day', () => {
      it('should default to having an allDaySlots table', () => {
        let calendar = initCalendar({
          initialView: 'timeGridDay',
          allDaySlot: false,
        })
        let dayGrid = new TimeGridViewWrapper(calendar).dayGrid
        expect(dayGrid).toBeFalsy()
      })
    })
  })
})
