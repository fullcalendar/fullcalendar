import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('aspectRatio', () => {
  function getCalendarElement(width) {
    return $('<div id="calendar" style="max-width:none">').appendTo('body').width(width)[0]
  }

  describe('when default settings are used', () => {
    const elementWidth = 675

    it('view div should use the ratio 1:35 to set height', () => {
      let calendar = initCalendar({}, getCalendarElement(elementWidth))
      let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

      let rect = viewContainerEl.getBoundingClientRect()
      expect(Math.round(rect.height)).toEqual(500)
    })

    it('view div should have width of div', () => {
      let calendar = initCalendar({}, getCalendarElement(elementWidth))
      let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

      let rect = viewContainerEl.getBoundingClientRect()
      expect(Math.round(rect.width)).toEqual(elementWidth)
    })
  })

  describe('when initializing the aspectRatio', () => {
    const elementWidth = 1000

    describe('to 2', () => {
      pushOptions({
        aspectRatio: 2,
      })

      it('should not change the width', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(elementWidth)
      })

      it('should set the height to width sizes very close to ratio of 2', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        let ratio = Math.round((rect.width / rect.height) * 100)
        expect(Math.round(ratio)).toEqual(200)
      })
    })

    describe('to 1', () => {
      pushOptions({
        aspectRatio: 1,
      })

      it('should not change the width', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(elementWidth)
      })

      it('should set the height to width sizes very close to ratio of 2', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        let ratio = Math.round((rect.width / rect.height) * 100)
        expect(Math.round(ratio)).toEqual(100)
      })
    })

    describe('to less than 0.5', () => {
      pushOptions({
        aspectRatio: 0.4,
      })

      it('should not change the width', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(elementWidth)
      })

      it('should set the height to width ratio to 0.5', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        let ratio = Math.round((rect.width / rect.height) * 100)
        expect(Math.round(ratio)).toEqual(50)
      })
    })

    describe('to negative', () => {
      pushOptions({
        aspectRatio: -2,
      })

      it('should not change the width', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(elementWidth)
      })

      it('should set the height to width ratio to 0.5', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        let ratio = Math.round((rect.width / rect.height) * 100)
        expect(Math.round(ratio)).toEqual(50)
      })
    })

    describe('to zero', () => {
      pushOptions({
        aspectRatio: 0,
      })

      it('should not change the width', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(elementWidth)
      })

      it('should set the height to width ratio to 0.5', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        let ratio = Math.round((rect.width / rect.height) * 100)
        expect(Math.round(ratio)).toEqual(50)
      })
    })

    describe('to very large', () => {
      pushOptions({
        aspectRatio: 4000,
      })

      it('should not change the width', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(elementWidth)
      })

      it('should cause rows to be natural height', () => {
        let calendar = initCalendar({}, getCalendarElement(elementWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewContainerEl()

        let actualHeight = viewContainerEl.getBoundingClientRect().height
        let naturalHeight = viewContainerEl.getBoundingClientRect().height
        expect(Math.round(actualHeight)).toEqual(Math.round(naturalHeight))
      })
    })
  })
})
