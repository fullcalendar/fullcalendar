import { createPlugin } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'

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

  function testEachView(viewsAndVals) {
    $.each(viewsAndVals, (view: string, val) => {
      currentCalendar.changeView(view)
      expect($('h2')).toHaveText(val)
    })
  }

  it('can target a specific view (dayGridMonth)', () => {
    initCalendar({
      views: {
        dayGridMonth: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView({
      dayGridMonth: 'special!!!',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'default',
      timeGridDay: 'default',
    })
  })

  it('can target a specific view (timeGridWeek)', () => {
    initCalendar({
      views: {
        timeGridWeek: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'default',
    })
  })

  it('can target dayGrid views', () => {
    initCalendar({
      views: {
        dayGrid: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView({
      dayGridMonth: 'special!!!',
      dayGridWeek: 'special!!!',
      dayGridDay: 'special!!!',
      timeGridWeek: 'default',
      timeGridDay: 'default',
    })
  })

  it('can target timeGrid views', () => {
    initCalendar({
      views: {
        timeGrid: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'special!!!',
    })
  })

  it('can target week views', () => {
    initCalendar({
      views: {
        week: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'special!!!',
      dayGridDay: 'default',
      timeGridWeek: 'special!!!',
      timeGridDay: 'default',
    })
  })

  it('can target day views', () => {
    initCalendar({
      views: {
        day: {
          titleFormat() { return 'special!!!' },
        },
      },
    })
    testEachView({
      dayGridMonth: 'default',
      dayGridWeek: 'default',
      dayGridDay: 'special!!!',
      timeGridWeek: 'default',
      timeGridDay: 'special!!!',
    })
  })

  it('views that explicitly extend others inherit options', () => {
    initCalendar({
      plugins: [
        dayGridPlugin,
        createPlugin({
          name: 'test-plugin',
          views: {
            superBasic: {
              type: 'dayGrid', // explicitly extend
              content: 'hello world',
            },
          },
        }),
      ],
      views: {
        dayGrid: {
          titleFormat() { return 'special!!!' },
        },
      },
    })

    testEachView({
      superBasic: 'special!!!',
      dayGridMonth: 'special!!!',
      dayGridDay: 'special!!!',
    })
  })
})
