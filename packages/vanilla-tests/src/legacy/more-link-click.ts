import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import dayGridPlugin from 'fullcalendar/daygrid'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'

describe('moreLinkClick', () => {
  pushOptions({
    initialDate: '2014-08-01', // important that it is the first week, so works w/ month + week views
    initialView: 'dayGridMonth',
    dayMaxEventRows: 3,
    events: [
      { title: 'event1', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
      { title: 'event2', start: '2014-07-29' },
    ],
  })

  describe('when set to "popover"', () => {
    pushOptions({
      moreLinkClick: 'popover',
    })

    it('renders a popover upon click', async () => {
      let calendar = initCalendar()
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      expect(dayGridWrapper.getMorePopoverEl()).toBeVisible()
    })

    // more popover tests are done in *-popover.js
  })

  describe('when set to "week"', () => {
    pushOptions({
      moreLinkClick: 'week',
    })

    it('should go to dayGridWeek if it is one of the available views', async () => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        },
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let view = calendar.view
      expect(view.type).toBe('dayGridWeek')
    })

    it('should go to week if it is one of the available views', async () => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let view = calendar.view
      expect(view.type).toBe('timeGridWeek')
    })
  })

  describe('when set to "day"', () => {
    pushOptions({
      moreLinkClick: 'day',
    })

    it('should go to dayGridDay if it is one of the available views', async () => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        },
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let view = calendar.view
      expect(view.type).toBe('dayGridDay')
    })

    it('should go to day if it is one of the available views', async () => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      let view = calendar.view
      expect(view.type).toBe('timeGridDay')
    })
  })

  it('works with an explicit view name', async () => {
    let calendar = initCalendar({
      moreLinkClick: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay',
      },
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    let view = calendar.view
    expect(view.type).toBe('timeGridWeek')
  })

  it('works with custom function and all the arguments are correct', async () => {
    let handled = false
    let calendar = initCalendar({
      moreLinkClick(info) {
        expect(typeof info).toBe('object')
        expect(info.date).toEqualDate('2014-07-29')
        expect(info.hiddenSegs.length).toBe(2)
        expect(info.allSegs.length).toBe(4)
        expect(typeof info.jsEvent).toBe('object')
        handled = true
      },
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    expect(handled).toBe(true)
  })

  it('works with custom function, and can return a view name', async () => {
    let calendar = initCalendar({
      moreLinkClick() {
        return 'timeGridDay'
      },
    })
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    await waitTimeout()
    let view = calendar.view
    expect(view.type).toBe('timeGridDay')
  })

  describe('with moment-timezone resolution', () => {
    pushOptions({
      plugins: [classicThemePlugin, themeForTestsPlugin, dayGridPlugin],
      timeZone: 'Asia/Hong_Kong',
    })

    it('gives date info correct timezone', async () => {
      let handled = false
      let calendar = initCalendar({
        moreLinkClick(info) {
          expect(typeof info).toBe('object')
          expect(info.date).toEqualDate('2014-07-28T16:00:00')
          handled = true
        },
      })
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      await waitTimeout()
      expect(handled).toBe(true)
    })
  })
})
