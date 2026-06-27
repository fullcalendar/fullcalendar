import classicThemePlugin from 'fullcalendar/themes/classic' // need both
import themeForTestsPlugin from '../lib/theme-for-tests' // "
import dayGridPlugin from 'fullcalendar/daygrid'

describe('view-specific options', () => {
  pushOptions({
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay,timeGridWeek,timeGridDay',
    },
    initialView: 'dayGridMonth',
    titleFormat() { return 'default' },
    views: { },
  })

  function testEachView(calendar, viewsAndVals) {
    $.each(viewsAndVals, (view: string, val) => {
      calendar.changeView(view)
      expect($('.fc-toolbar-title')).toHaveText(val)
    })
  }

  it('can target a specific view (dayGridMonth)', () => {
    let calendar = initCalendar({
      views: {
        dayGridMonth: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView(calendar, {
      dayGridMonth: 'special!!!',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'default',
      timeGridDay: 'default',
    })
  })

  it('can target a specific view (timeGridWeek)', () => {
    let calendar = initCalendar({
      views: {
        timeGridWeek: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView(calendar, {
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'default',
    })
  })

  it('can target dayGrid views', () => {
    let calendar = initCalendar({
      views: {
        dayGrid: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView(calendar, {
      dayGridMonth: 'special!!!',
      dayGridWeek: 'special!!!',
      dayGridDay: 'special!!!',
      timeGridWeek: 'default',
      timeGridDay: 'default',
    })
  })

  it('can target timeGrid views', () => {
    let calendar = initCalendar({
      views: {
        timeGrid: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView(calendar, {
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'special!!!',
    })
  })

  it('can target week views', () => {
    let calendar = initCalendar({
      views: {
        week: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView(calendar, {
      dayGridMonth: 'default',
      dayGridWeek: 'special!!!',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'default',
    })
  })

  it('can target day views', () => {
    let calendar = initCalendar({
      views: {
        day: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView(calendar, {
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'special!!!',
      timeGridWeek: 'default',
      timeGridDay: 'special!!!',
    })
  })

  it('views that explicitly extend others inherit options', () => {
    let calendar = initCalendar({
      plugins: [
        dayGridPlugin,
        classicThemePlugin,
        themeForTestsPlugin,
        {
          name: 'test-plugin',
          views: {
            superBasic: {
              type: 'dayGrid', // explicitly extend
              content: 'hello world',
            },
          },
        },
      ],
      views: {
        dayGrid: {
          titleFormat() { return 'special!!!' },
        },
      },
    })

    testEachView(calendar, {
      superBasic: 'special!!!',
      dayGridMonth: 'special!!!',
      dayGridDay: 'special!!!',
    })
  })
})
