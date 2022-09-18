import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'

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

    it('renders a popover upon click', (done) => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      setTimeout(() => {
        expect(dayGridWrapper.getMorePopoverEl()).toBeVisible()
        done()
      })
    })

    // more popover tests are done in *-popover.js
  })

  describe('when set to "week"', () => {
    pushOptions({
      moreLinkClick: 'week',
    })

    it('should go to dayGridWeek if it is one of the available views', (done) => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        },
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      setTimeout(() => {
        let view = currentCalendar.view
        expect(view.type).toBe('dayGridWeek')
        done()
      })
    })

    it('should go to week if it is one of the available views', (done) => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      setTimeout(() => {
        let view = currentCalendar.view
        expect(view.type).toBe('timeGridWeek')
        done()
      })
    })
  })

  describe('when set to "day"', () => {
    pushOptions({
      moreLinkClick: 'day',
    })

    it('should go to dayGridDay if it is one of the available views', (done) => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay',
        },
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      setTimeout(() => {
        let view = currentCalendar.view
        expect(view.type).toBe('dayGridDay')
        done()
      })
    })

    it('should go to day if it is one of the available views', (done) => {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      dayGridWrapper.openMorePopover()
      setTimeout(() => {
        let view = currentCalendar.view
        expect(view.type).toBe('timeGridDay')
        done()
      })
    })
  })

  it('works with an explicit view name', (done) => {
    let calendar = initCalendar({
      moreLinkClick: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay',
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      let view = currentCalendar.view
      expect(view.type).toBe('timeGridWeek')
      done()
    })
  })

  it('works with custom function and all the arguments are correct', (done) => {
    let calendar = initCalendar({
      moreLinkClick(arg) {
        expect(typeof arg).toBe('object')
        expect(arg.date).toEqualDate('2014-07-29')
        expect(arg.hiddenSegs.length).toBe(2)
        expect(arg.allSegs.length).toBe(4)
        expect(typeof arg.jsEvent).toBe('object')
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(done)
  })

  it('works with custom function, and can return a view name', (done) => {
    let calendar = initCalendar({
      moreLinkClick() {
        return 'timeGridDay'
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    dayGridWrapper.openMorePopover()
    setTimeout(() => {
      let view = currentCalendar.view
      expect(view.type).toBe('timeGridDay')
      done()
    })
  })
})
