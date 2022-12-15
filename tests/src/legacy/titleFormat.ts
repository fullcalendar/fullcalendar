import frLocale from '@fullcalendar/core/locales/fr'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('titleFormat', () => {
  describe('when default', () => {
    pushOptions({
      initialDate: '2014-06-12',
      titleRangeSeparator: ' - ',
    })

    const VIEWS_WITH_FORMATS = [
      { view: 'dayGridMonth', expected: 'June 2014' },
      { view: 'dayGridWeek', expected: /Jun 8 - 14,? 2014/ },
      { view: 'timeGridWeek', expected: /Jun 8 - 14,? 2014/ },
      { view: 'dayGridDay', expected: /June 12,? 2014/ },
      { view: 'timeGridDay', expected: /June 12,? 2014/ },
    ]

    it('should have default values', () => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      for (let viewWithFormat of VIEWS_WITH_FORMATS) {
        calendar.changeView(viewWithFormat.view)
        expect(toolbarWrapper.getTitleText()).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('when set on a per-view basis', () => {
    pushOptions({
      initialDate: '2014-06-12',
      titleRangeSeparator: ' - ',
      views: {
        month: { titleFormat: { year: 'numeric', month: 'long' } },
        dayGridWeek: { titleFormat: { day: 'numeric', month: 'short', year: 'numeric' } },
        week: { titleFormat: { day: 'numeric', month: 'long', year: 'numeric' } },
        dayGridDay: { titleFormat: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' } },
      },
    })

    const VIEWS_WITH_FORMATS = [
      { view: 'dayGridMonth', expected: 'June 2014' },
      { view: 'dayGridWeek', expected: 'Jun 8 - 14, 2014' },
      { view: 'timeGridWeek', expected: 'June 8 - 14, 2014' },
      { view: 'dayGridDay', expected: 'Thursday, June 12, 2014' },
    ]

    it('should have the correct values', () => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      for (let viewWithFormat of VIEWS_WITH_FORMATS) {
        calendar.changeView(viewWithFormat.view)
        expect(toolbarWrapper.getTitleText()).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('when default and locale is French', () => {
    pushOptions({
      initialDate: '2014-06-12',
      titleRangeSeparator: ' - ',
      locale: frLocale,
    })

    const VIEWS_WITH_FORMATS = [
      { view: 'dayGridMonth', expected: 'juin 2014' },
      { view: 'dayGridWeek', expected: '9 - 15 juin 2014' },
      { view: 'timeGridWeek', expected: '9 - 15 juin 2014' },
      { view: 'dayGridDay', expected: '12 juin 2014' },
      { view: 'timeGridDay', expected: '12 juin 2014' },
    ]

    it('should have the translated dates', () => {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      for (let viewWithFormat of VIEWS_WITH_FORMATS) {
        calendar.changeView(viewWithFormat.view)
        expect(toolbarWrapper.getTitleText()).toMatch(viewWithFormat.expected)
      }
    })
  })

  describe('using custom views', () => {
    it('multi-year default only displays year', () => {
      let calendar = initCalendar({
        views: {
          multiYear: {
            type: 'dayGrid',
            duration: { years: 2 },
          },
        },
        initialView: 'multiYear',
        initialDate: '2014-12-25',
        titleRangeSeparator: ' - ',
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      expect(toolbarWrapper.getTitleText()).toBe('2014 - 2015')
    })

    it('multi-month default only displays month/year', () => {
      let calendar = initCalendar({
        views: {
          multiMonth: {
            type: 'dayGrid',
            duration: { months: 2 },
          },
        },
        initialView: 'multiMonth',
        initialDate: '2014-12-25',
        titleRangeSeparator: ' - ',
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      expect(toolbarWrapper.getTitleText()).toBe('December 2014 - January 2015')
    })

    it('multi-week default displays short full date', () => {
      let calendar = initCalendar({
        views: {
          multiWeek: {
            type: 'dayGrid',
            duration: { weeks: 2 },
          },
        },
        initialView: 'multiWeek',
        initialDate: '2014-12-25',
        titleRangeSeparator: ' - ',
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      expect(toolbarWrapper.getTitleText()).toMatch(/Dec 21,? 2014 - Jan 3,? 2015/)
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
        titleRangeSeparator: ' - ',
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      expect(toolbarWrapper.getTitleText()).toMatch(/Dec 25 - 26,? 2014/)
    })
  })

  describe('when not all days are shown', () => {
    it('doesn\'t include hidden days in the title', () => {
      let calendar = initCalendar({
        initialView: 'timeGridWeek',
        initialDate: '2017-02-13',
        weekends: false,
        titleRangeSeparator: ' - ',
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar
      expect(toolbarWrapper.getTitleText()).toBe('Feb 13 - 17, 2017') // does not include Sunday
    })
  })
})
