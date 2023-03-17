import frLocale from '@fullcalendar/core/locales/fr'
import enGbLocale from '@fullcalendar/core/locales/en-gb'
import koLocale from '@fullcalendar/core/locales/ko'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('dayHeaderFormat', () => { // TODO: rename file
  describe('when not set', () => {
    pushOptions({
      initialDate: '2014-05-11',
    })

    const VIEWS_WITH_FORMAT = [
      { view: 'dayGridMonth', expected: /^Sun$/ },
      { view: 'dayGridWeek', expected: /^Sun 5[/ ]11$/ },
      { view: 'timeGridWeek', expected: /^Sun 5[/ ]11$/ },
      { view: 'dayGridDay', expected: /^Sunday$/ },
      { view: 'timeGridDay', expected: /^Sunday$/ },
    ]

    it('should have default values', () => {
      let calendar = initCalendar()

      for (let viewWithFormat of VIEWS_WITH_FORMAT) {
        calendar.changeView(viewWithFormat.view)
        let header = new (viewWithFormat.view.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper)(calendar).header
        expect(header.getCellText(0)).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('when dayHeaderFormat is set on a per-view basis', () => {
    pushOptions({
      initialDate: '2014-05-11',
      views: {
        month: { dayHeaderFormat: { weekday: 'long' } },
        day: { dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' } },
        dayGridWeek: { dayHeaderFormat: { weekday: 'long', month: 'numeric', day: 'numeric' } },
      },
    })

    const VIEWS_WITH_FORMAT = [
      { view: 'dayGridMonth', expected: /^Sunday$/ },
      { view: 'timeGridDay', expected: /^Sunday, May 11$/ },
      { view: 'dayGridWeek', expected: /^Sunday, 5[/ ]11$/ },
    ]

    it('should have the correct values', () => {
      let calendar = initCalendar()

      for (let viewWithFormat of VIEWS_WITH_FORMAT) {
        calendar.changeView(viewWithFormat.view)
        let header = new (viewWithFormat.view.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper)(calendar).header
        expect(header.getCellText(0)).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('when locale is French', () => {
    pushOptions({
      initialDate: '2014-05-11',
      locale: frLocale,
    })

    const VIEWS_WITH_FORMAT = [
      { view: 'dayGridMonth', expected: /^dim\.$/ },
      { view: 'dayGridWeek', expected: /^dim\. 11[/ ]0?5$/ },
      { view: 'timeGridWeek', expected: /^dim\. 11[/ ]0?5$/ },
      { view: 'dayGridDay', expected: /^dimanche$/ },
      { view: 'timeGridDay', expected: /^dimanche$/ },
    ]

    it('should have the translated dates', () => {
      let calendar = initCalendar()

      for (let viewWithFormat of VIEWS_WITH_FORMAT) {
        calendar.changeView(viewWithFormat.view)
        let header = new (viewWithFormat.view.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper)(calendar).header
        expect(header.getCellText(0)).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('when locale is en-gb', () => {
    pushOptions({
      initialDate: '2014-05-11',
      locale: enGbLocale,
    })

    const VIEWS_WITH_FORMAT = [
      { view: 'dayGridMonth', expected: /^Sun$/ },
      { view: 'dayGridWeek', expected: /^Sun 11[/ ]0?5$/ },
      { view: 'timeGridWeek', expected: /^Sun 11[/ ]0?5$/ },
      { view: 'dayGridDay', expected: /^Sunday$/ },
      { view: 'timeGridDay', expected: /^Sunday$/ },
    ]

    it('should have the translated dates', () => {
      let calendar = initCalendar()

      for (let viewWithFormat of VIEWS_WITH_FORMAT) {
        calendar.changeView(viewWithFormat.view)
        let header = new (viewWithFormat.view.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper)(calendar).header
        expect(header.getCellText(0)).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('when locale is Korean', () => {
    pushOptions({
      initialDate: '2014-05-11',
      locale: koLocale,
    })

    const VIEWS_WITH_FORMAT = [
      { view: 'dayGridMonth', expected: /^일$/ },
      { view: 'dayGridWeek', expected: /^5[.월] 11[.일] \(?일\)?$/ },
      { view: 'timeGridWeek', expected: /^5[.월] 11[.일] \(?일\)?$/ },
      { view: 'dayGridDay', expected: /^일요일$/ },
      { view: 'timeGridDay', expected: /^일요일$/ },
    ]

    it('should have the translated dates and dayHeaderFormat should be computed differently', () => {
      let calendar = initCalendar()

      for (let viewWithFormat of VIEWS_WITH_FORMAT) {
        calendar.changeView(viewWithFormat.view)
        let header = new (viewWithFormat.view.match(/^dayGrid/) ? DayGridViewWrapper : TimeGridViewWrapper)(calendar).header
        expect(header.getCellText(0)).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('using custom views', () => {
    it('multi-year default only displays day-of-week', () => {
      let calendar = initCalendar({
        views: {
          dayGridTwoYear: {
            type: 'dayGrid',
            duration: { years: 2 },
          },
        },
        initialView: 'dayGridTwoYear',
        initialDate: '2014-12-25',
      })
      let header = new DayGridViewWrapper(calendar).header
      expect(header.getCellText(0)).toBe('Sun')
    })

    it('multi-month default only displays day-of-week', () => {
      let calendar = initCalendar({
        views: {
          dayGridTwoMonth: {
            type: 'dayGrid',
            duration: { months: 2 },
          },
        },
        initialView: 'dayGridTwoMonth',
        initialDate: '2014-12-25',
      })
      let header = new DayGridViewWrapper(calendar).header
      expect(header.getCellText(0)).toBe('Sun')
    })

    it('multi-week default only displays day-of-week', () => {
      let calendar = initCalendar({
        views: {
          dayGridTwoWeek: {
            type: 'dayGrid',
            duration: { weeks: 2 },
          },
        },
        initialView: 'dayGridTwoWeek',
        initialDate: '2014-12-25',
      })
      let header = new DayGridViewWrapper(calendar).header
      expect(header.getCellText(0)).toBe('Sun')
    })

    it('multi-day default displays short full date', () => {
      let calendar = initCalendar({
        views: {
          multiDay: {
            type: 'dayGrid',
            duration: { days: 2 },
          },
        },
        initialView: 'multiDay',
        initialDate: '2014-12-25',
      })
      let header = new DayGridViewWrapper(calendar).header
      expect(header.getCellText('2014-12-25')).toMatch(/^Thu 12[/ ]25$/)
    })
  })
})
