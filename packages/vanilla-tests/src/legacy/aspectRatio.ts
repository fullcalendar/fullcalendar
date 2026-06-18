import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('aspectRatio', () => {
  function getCalendarElement(width) {
    let el = createCalendarElement()

    el.style.maxWidth = 'none'
    $(el).width(width)

    return el
  }

  describe('when default settings are used', () => {
    const defaultAspectRatio = 1.35
    const calendarWidth = 677

    it('view div should use the ratio 1.35 to set height', () => {
      let calendar = initCalendar({}, getCalendarElement(calendarWidth))
      let viewEl = new CalendarWrapper(calendar).getViewEl()
      expect(viewEl.offsetHeight).toEqual(Math.round(calendarWidth / defaultAspectRatio))
    })

    /*
    Sort of a silly test, but was more important when the aspectRatio was INSIDE the view's border
    */
    it('view div should have width of div', () => {
      let calendar = initCalendar({}, getCalendarElement(calendarWidth))
      let viewEl = new CalendarWrapper(calendar).getViewEl()
      expect(viewEl.offsetWidth).toEqual(calendarWidth)
    })
  })

  describe('when initializing the aspectRatio', () => {
    const calendarWidth = 1000

    describe('to 2', () => {
      pushOptions({
        aspectRatio: 2,
      })

      it('should not change the width', () => {
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(calendarWidth)
      })

      it('should set the height to width sizes very close to ratio of 2', () => {
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

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
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(calendarWidth)
      })

      it('should set the height to width sizes very close to ratio of 2', () => {
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

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
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(calendarWidth)
      })

      it('should set the height to width ratio to 0.5', () => {
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

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
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(calendarWidth)
      })

      it('should set the height to width ratio to 0.5', () => {
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

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
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(calendarWidth)
      })

      it('should set the height to width ratio to 0.5', () => {
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

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
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

        let rect = viewContainerEl.getBoundingClientRect()
        expect(Math.round(rect.width)).toEqual(calendarWidth)
      })

      it('should cause rows to be natural height', () => {
        let calendar = initCalendar({}, getCalendarElement(calendarWidth))
        let viewContainerEl = new CalendarWrapper(calendar).getViewOuterEl()

        let actualHeight = viewContainerEl.getBoundingClientRect().height
        let naturalHeight = viewContainerEl.getBoundingClientRect().height
        expect(Math.round(actualHeight)).toEqual(Math.round(naturalHeight))
      })
    })
  })
})
