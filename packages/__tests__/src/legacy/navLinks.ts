import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { ListViewWrapper } from '../lib/wrappers/ListViewWrapper'
import { addDays } from '@fullcalendar/core'

describe('navLinks', function() {
  pushOptions({
    now: '2016-08-20',
    navLinks: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // affects which view is jumped to by default
    }
  })

  describeTimeZones(function(tz) {

    describe('in month view', function() {
      pushOptions({
        initialView: 'dayGridMonth'
      })

      it('moves to day', function() {
        let dateClickSpy = spyOnCalendarCallback('dateClick')
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.clickNavLink('2016-08-09')
        expectDayView(calendar, 'timeGridDay', tz.parseDate('2016-08-09'))
        expect(dateClickSpy).not.toHaveBeenCalled()
      })

      // https://github.com/fullcalendar/fullcalendar/issues/4619
      it('moves to day when no toolbars', function() {
        let dateClickSpy = spyOnCalendarCallback('dateClick')
        let calendar = initCalendar({
          headerToolbar: null
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.clickNavLink('2016-08-09')
        expectDayView(calendar, 'dayGridDay', tz.parseDate('2016-08-09')) // is hash-key order-dependent I think :(
        expect(dateClickSpy).not.toHaveBeenCalled()
      })

      // https://github.com/fullcalendar/fullcalendar/issues/3869
      it('moves to two different days', function() {
        let dateClickSpy = spyOnCalendarCallback('dateClick')
        let calendar = initCalendar()

        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        dayGridWrapper.clickNavLink('2016-08-09')
        expectDayView(calendar, 'timeGridDay', tz.parseDate('2016-08-09'))
        expect(dateClickSpy).not.toHaveBeenCalled()

        calendar.changeView('dayGridMonth')
        let dayGridWrapper2 = new DayGridViewWrapper(calendar).dayGrid
        dayGridWrapper2.clickNavLink('2016-08-10')
        expectDayView(calendar, 'timeGridDay', tz.parseDate('2016-08-10'))
      })

      it('moves to day specifically', function() {
        let dateClickSpy = spyOnCalendarCallback('dateClick')
        let calendar = initCalendar({
          navLinkDayClick: 'day'
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.clickNavLink('2016-08-09')
        expectDayView(calendar, 'timeGridDay', tz.parseDate('2016-08-09'))
        expect(dateClickSpy).not.toHaveBeenCalled()
      })

      it('moves to dayGridDay specifically', function() {
        let dateClickSpy = spyOnCalendarCallback('dateClick')
        let calendar = initCalendar({
          navLinkDayClick: 'dayGridDay'
        })
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.clickNavLink('2016-08-09')
        expectDayView(calendar, 'dayGridDay', tz.parseDate('2016-08-09'))
        expect(dateClickSpy).not.toHaveBeenCalled()
      })

      it('executes a custom handler', function() {
        let dateClickSpy = spyOnCalendarCallback('dateClick')
        let navLinkDayClickSpy = spyOnCalendarCallback('navLinkDayClick', (date, ev) => {
          expect(date).toEqualDate(tz.parseDate('2016-08-09'))
          expect(typeof ev).toBe('object')
        })
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

        dayGridWrapper.clickNavLink('2016-08-09')
        expect(dateClickSpy).not.toHaveBeenCalled()
        expect(navLinkDayClickSpy).toHaveBeenCalled()
      })

      describe('with weekNumbers', function() {
        pushOptions({
          weekNumbers: true
        })

        it('moves to week', function() {
          let dateClickSpy = spyOnCalendarCallback('dateClick')
          let calendar = initCalendar()
          let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

          $.simulateMouseClick(dayGridWrapper.getWeekNavLinkEls()[1])
          expectWeekView(calendar, 'timeGridWeek', tz.parseDate('2016-08-07'))
          expect(dateClickSpy).not.toHaveBeenCalled()
        })
      })

      it('does not have clickable day header', function() {
        let calendar = initCalendar()
        let headerWrapper = new DayGridViewWrapper(calendar).header

        expect(headerWrapper.getNavLinkEls().length).toBe(0)
      })
    })
  })

  describe('in week view', function() {
    pushOptions({
      initialView: 'timeGridWeek'
    })

    it('moves to day view', function() {
      let dateClickSpy = spyOnCalendarCallback('dateClick')
      let calendar = initCalendar()
      let headerWrapper = new TimeGridViewWrapper(calendar).header

      headerWrapper.clickNavLink('2016-08-15')
      expectDayView(calendar, 'timeGridDay', '2016-08-15')
      expect(dateClickSpy).not.toHaveBeenCalled()
    })
  })

  describe('in listWeek', function() {
    pushOptions({
      initialView: 'listWeek',
      events: [
        {
          title: 'event 1',
          start: '2016-08-20'
        }
      ]
    })

    it('moves to day view', function() {
      let dateClickSpy = spyOnCalendarCallback('dateClick')
      let calendar = initCalendar()
      let listWrapper = new ListViewWrapper(calendar)

      listWrapper.clickNavLink('2016-08-20')
      expectDayView(calendar, 'timeGridDay', '2016-08-20')
      expect(dateClickSpy).not.toHaveBeenCalled()
    })
  })

  describe('in day view', function() {
    pushOptions({
      initialView: 'timeGridDay'
    })

    it('moves to week view', function() {
      let dateClickSpy = spyOnCalendarCallback('dateClick')
      let calendar = initCalendar({
        weekNumbers: true
      })
      let viewWrapper = new TimeGridViewWrapper(calendar)

      $.simulateMouseClick(viewWrapper.getHeaderWeekNumberLink())
      expectWeekView(calendar, 'timeGridWeek', '2016-08-14')
      expect(dateClickSpy).not.toHaveBeenCalled()
    })

    it('does not have a clickable day header', function() {
      let calendar = initCalendar()
      let headerWrapper = new TimeGridViewWrapper(calendar).header

      expect(headerWrapper.getNavLinkEls().length).toBe(0)
    })
  })


  function expectDayView(calendar, viewName, dayDate) {
    let calendarWrapper = new CalendarWrapper(calendar)
    let start = calendar.view.activeStart
    let end = calendar.view.activeEnd

    expect(calendarWrapper.getViewName()).toBe(viewName)
    expect(start).toEqualDate(dayDate)
    expect(addDays(end, -1)).toEqualDate(dayDate)
  }


  function expectWeekView(calendar, viewName, firstDayDate) {
    let calendarWrapper = new CalendarWrapper(calendar)
    let start = calendar.view.activeStart
    let end = calendar.view.activeEnd

    expect(calendarWrapper.getViewName()).toBe(viewName)
    expect(start).toEqualDate(firstDayDate)
    expect(addDays(end, -7)).toEqualDate(firstDayDate)
  }

})
