/// <reference types="vitest/globals" />
import React, { useState, useContext, createContext, act } from 'react'
import { render } from '@testing-library/react'

/*
Only works on build dist code!
*/
import FullCalendar, { sliceEvents } from '../dist/index'
import classicThemePlugin from '../dist/themes/classic'
import dayGridPlugin from '../dist/daygrid'
import listPlugin from '../dist/list'
import { anyElsIntersect } from './utils'

const NOW_DATE = new Date()
const TEST_TOOLBAR_CLASS = 'test-toolbar'
const TEST_EVENT_CLASS = 'test-event'
const TEST_WEEKEND_CLASS = 'test-weekend'

const DEFAULT_OPTIONS = {
  plugins: [classicThemePlugin, dayGridPlugin, listPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    start: 'prev,next today',
    end: 'title',
  },
  toolbarClass: TEST_TOOLBAR_CLASS,
  eventClass: TEST_EVENT_CLASS,
  dayCellClass: ({ date }: { date: Date }) => {
    const day = date.getDay()
    return (day === 0 || day === 6) ? TEST_WEEKEND_CLASS : ''
  },
}

it('should render without crashing', () => {
  let { container } = render(
    <FullCalendar {...DEFAULT_OPTIONS} />
  )
  expect(container.querySelector(`.${TEST_TOOLBAR_CLASS}`)).toBeTruthy()
})

it('should unmount and destroy', () => {
  let unmountCalled = false

  let { unmount } = render(
    <FullCalendar
      {...DEFAULT_OPTIONS}
      viewWillUnmount={() => {
        unmountCalled = true
      }}
    />
  )

  unmount()
  expect(unmountCalled).toBe(true)
})

it('should have updatable props', () => {
  let { container, rerender } = render(
    <FullCalendar {...DEFAULT_OPTIONS} />
  )
  expect(container.querySelector(`.${TEST_WEEKEND_CLASS}`)).toBeTruthy()

  rerender(
    <FullCalendar {...DEFAULT_OPTIONS} weekends={false} />
  )
  expect(container.querySelector(`.${TEST_WEEKEND_CLASS}`)).toBeFalsy()
})

it('should accept a callback', () => {
  let mountCalled = false

  render(
    <FullCalendar
      {...DEFAULT_OPTIONS}
      viewDidMount={() => {
        mountCalled = true
      }}
    />
  )
  expect(mountCalled).toBe(true)
})

it('should expose an API', function() {
  let componentRef = React.createRef<React.ComponentRef<typeof FullCalendar>>()
  render(
    <FullCalendar {...DEFAULT_OPTIONS} ref={componentRef} />
  )

  let calendarApi = componentRef.current!.getApi()
  expect(calendarApi).toBeTruthy()

  let newDate = new Date(Date.UTC(2000, 0, 1))

  act(() => {
    calendarApi.gotoDate(newDate)
  })

  expect(calendarApi.getDate().valueOf()).toBe(newDate.valueOf())
})

it('won\'t rerender toolbar if didn\'t change', function() { // works because internal VDOM reuses toolbar element
  let { container, rerender } = render(
    <FullCalendar {...DEFAULT_OPTIONS} headerToolbar={buildToolbar()} />
  )
  let headerEl = container.querySelector(`.${TEST_TOOLBAR_CLASS}`)

  rerender(
    <FullCalendar {...DEFAULT_OPTIONS} headerToolbar={buildToolbar()} />
  )
  expect(container.querySelector(`.${TEST_TOOLBAR_CLASS}`)).toBe(headerEl)
})

it('won\'t rerender events if nothing changed', function() {
  let options = {
    ...DEFAULT_OPTIONS,
    events: [buildEvent()]
  }

  let { container, rerender } = render(
    <FullCalendar {...options} />
  )
  let eventEl = container.querySelector(`.${TEST_EVENT_CLASS}`)

  rerender(
    <FullCalendar {...options} />
  )
  expect(container.querySelector(`.${TEST_EVENT_CLASS}`)).toBe(eventEl)
})

// https://github.com/fullcalendar/fullcalendar-react/issues/185
it('will not inifinitely recurse in strict mode with datesSet', async () => {
  function TestApp() {
    const [events, setEvents] = useState([
      { title: 'event 1', date: '2022-04-01' },
      { title: 'event 2', date: '2022-04-02' }
    ]);

    const dateChange = () => {
      setEvents([
        { title: 'event 10', date: '2022-04-01' },
        { title: 'event 20', date: '2022-04-02' }
      ]);
    };

    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        events={events}
        datesSet={dateChange}
      />
    );
  }

  render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  )

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })
})

// https://github.com/fullcalendar/fullcalendar-react/issues/13
it('will not inifinitely recurse with datesSet and dateIncrement', async () => {
  function TestApp() {
    const [events, setEvents] = useState([
      { title: 'event 1', date: '2022-04-01' },
      { title: 'event 2', date: '2022-04-02' }
    ]);

    const dateChange = () => {
      setEvents([
        { title: 'event 10', date: '2022-04-01' },
        { title: 'event 20', date: '2022-04-02' }
      ]);
    };

    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        views={{
          rollingSevenDay: {
            type: 'dayGrid',
            duration: { days: 7 },
            dateIncrement: { days: 1 },
          }
        }}
        initialView='rollingSevenDay'
        events={events}
        datesSet={dateChange}
      />
    );
  }

  render(
    <TestApp />
  )

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })
})

it('slot rendering inherits parent context', () => {
  const ThemeColor = createContext('')

  function TestApp() {
    return (
      <ThemeColor.Provider value='red'>
        <Calendar />
      </ThemeColor.Provider>
    )
  }

  function Calendar() {
    const themeColor = useContext(ThemeColor)

    return (
      <FullCalendar
        {...DEFAULT_OPTIONS}
        initialDate='2022-04-01'
        events={[
          { title: 'event 1', date: '2022-04-01' },
        ]}
        eventContent={(info) => (
          <span style={{ color: themeColor }}>{info.event.title}</span>
        )}
      />
    )
  }

  let { container } = render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  )

  let eventEl = container.querySelector(`.${TEST_EVENT_CLASS}`)
  expect(eventEl!.querySelector('span')!.style.color).toBe('red')
})

it('accepts jsx node for slot', () => {
  const { container } = render(
    <FullCalendar
      {...DEFAULT_OPTIONS}
      initialView='listDay'
      noEventsContent={<div className='empty-message'>no events</div>}
    />
  )

  expect(container.querySelectorAll('.empty-message').length).toBe(1)
})

// https://github.com/fullcalendar/fullcalendar/issues/7089
it('does not produce overlapping multiday events with custom eventContent', async () => {
  const DATE = '2022-04-01'
  const EVENTS = [
    { title: 'event 1', start: '2022-04-04', end: '2022-04-09' },
    { title: 'event 2', date: '2022-04-05', end: '2022-04-08' }
  ]

  function renderEvent(info) {
    return <i>{info.event.title}</i>
  }

  function TestApp() {
    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView='dayGridMonth'
        initialDate={DATE}
        initialEvents={EVENTS}
        eventContent={renderEvent}
        eventClass={TEST_EVENT_CLASS}
      />
    );
  }

  const { container } = render(<TestApp />)

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  const eventEls = Array.from(container.querySelectorAll(`.${TEST_EVENT_CLASS}`)) as HTMLElement[]
  expect(eventEls.length).toBe(2)
  expect(anyElsIntersect(eventEls)).toBe(false)
})

// https://github.com/fullcalendar/fullcalendar/issues/7239
it('does not produce overlapping all-day & timed events with custom eventContent', async () => {
  const DATE = '2022-04-01'
  const EVENTS = [
    { title: 'event 1', start: '2022-04-04', end: '2022-04-09' },
    { title: 'event 2', date: '2022-04-05T12:00:00' }
  ]

  function renderEvent(info) {
    return <i>{info.event.title}</i>
  }

  function TestApp() {
    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView='dayGridMonth'
        initialDate={DATE}
        initialEvents={EVENTS}
        eventContent={renderEvent}
        eventClass={TEST_EVENT_CLASS}
      />
    );
  }

  const { container } = render(<TestApp />)

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  const eventEls = Array.from(container.querySelectorAll(`.${TEST_EVENT_CLASS}`)) as HTMLElement[]
  expect(eventEls.length).toBe(2)
  expect(anyElsIntersect(eventEls)).toBe(false)
})

// eventDidMount
it(`during foreground custom event rendering, receives el`, async () => {
  let didMountCalled = false

  function TestApp() {
    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView='dayGridMonth'
        initialDate='2022-04-01'
        initialEvents={[
          { title: 'event 1', start: '2022-04-01' },
        ]}
        eventContent={(info) => (
          <i>{info.event.title}</i>
        )}
        eventDidMount={(info) => {
          expect(info.el).toBeTruthy()
          didMountCalled = true
        }}
      />
    );
  }

  render(<TestApp />)

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  expect(didMountCalled).toBe(true)
})

// backgroundEventDidMount
it(`during background custom event rendering, receives el`, async () => {
  let didMountCalled = false

  function TestApp() {
    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView='dayGridMonth'
        initialDate='2022-04-01'
        initialEvents={[
          { title: 'event 1', start: '2022-04-01', display: 'background' },
        ]}
        backgroundEventContent={(info) => (
          <i>{info.event.title}</i>
        )}
        backgroundEventDidMount={(info) => {
          expect(info.el).toBeTruthy()
          didMountCalled = true
        }}
      />
    );
  }

  render(<TestApp />)

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  expect(didMountCalled).toBe(true)
})

// https://github.com/fullcalendar/fullcalendar/issues/7119
it('rerenders content-injection with latest render-func closure', async () => {
  const DATE = '2022-04-01'
  const EVENTS = [
    { title: 'event 1', start: '2022-04-04', end: '2022-04-09' }
  ]
  let incrementCounter: () => void = () => {}

  function TestApp() {
    const [counter, setCounter] = useState(0)

    incrementCounter = () => {
      setCounter((currentCounter) => currentCounter + 1)
    }

    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView='dayGridMonth'
        initialDate={DATE}
        initialEvents={EVENTS}
        eventContent={(info) => (
          <i>{info.event.title + ' - ' + counter}</i>
        )}
        eventClass={TEST_EVENT_CLASS}
      />
    );
  }

  const { container } = render(<TestApp />)

  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  let eventEls = Array.from(container.querySelectorAll(`.${TEST_EVENT_CLASS}`)) as HTMLElement[]
  expect(eventEls.length).toBe(1)
  expect(eventEls[0].querySelector('i')!.textContent).toBe('event 1 - 0')

  act(() => {
    incrementCounter()
  })
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  let newEventEls = Array.from(container.querySelectorAll(`.${TEST_EVENT_CLASS}`)) as HTMLElement[]
  expect(newEventEls.length).toBe(1)
  expect(newEventEls[0]).toBe(eventEls[0])
  expect(newEventEls[0].querySelector('i')!.textContent).toBe('event 1 - 1')
})

it('no unnecessary rerenders, using events, when parent rerenders', async () => {
  const DATE = '2022-04-01'
  const EVENTS = [
    { title: 'event 1', start: '2022-04-04', end: '2022-04-09' }
  ]
  let incrementCounter: () => void = () => {}
  let customRenderCnt = 0

  function TestApp() {
    const [_counter, setCounter] = useState(0)

    incrementCounter = () => {
      setCounter((currentCounter) => currentCounter + 1)
    }

    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        headerToolbar={buildToolbar()}
        initialView='dayGridMonth'
        initialDate={DATE}
        events={EVENTS}
        eventContent={renderEvent}
      />
    )
  }

  function renderEvent(info) {
    customRenderCnt++
    return <i>{info.event.title}</i>
  }

  render(<TestApp />)
  expect(customRenderCnt).toBe(1)

  act(() => {
    incrementCounter()
  })
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  expect(customRenderCnt).toBe(1)
})

it('no unnecessary rerenders, using eventSources, when parent rerenders', async () => {
  const DATE = '2022-04-01'
  const EVENTS = [
    { title: 'event 1', start: '2022-04-04', end: '2022-04-09' }
  ]
  let incrementCounter: () => void = () => {}
  let customRenderCnt = 0

  function TestApp() {
    const [_counter, setCounter] = useState(0)

    incrementCounter = () => {
      setCounter((currentCounter) => currentCounter + 1)
    }

    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        headerToolbar={buildToolbar()}
        initialView='dayGridMonth'
        initialDate={DATE}
        eventSources={[EVENTS]}
        eventContent={renderEvent}
      />
    )
  }

  function renderEvent(info) {
    customRenderCnt++
    return <i>{info.event.title}</i>
  }

  render(<TestApp />)
  expect(customRenderCnt).toBe(1)

  act(() => {
    incrementCounter()
  })
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
  })

  expect(customRenderCnt).toBe(1)
})

// https://github.com/fullcalendar/fullcalendar/issues/7107
it('does not infinite loop on navLinks w/ dayCellTopContent', () => {
  function CustomDayCellContent() {
    return <div>hello world</div>
  }

  function TestApp() {
    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView='dayGridWeek'
        navLinks
        dayCellTopContent={() => <CustomDayCellContent />}
      />
    );
  }

  render(<TestApp />)
})

// https://github.com/fullcalendar/fullcalendar/issues/7116
it('does not infinite loop on certain eventContent', () => {
  const INITIAL_DATE = '2022-12-01'
  const EVENTS = [
    {
      start: '2022-12-31T03:40:00',
      end: '2022-12-31T07:40:00',
      title: 'titme33'
    },
    {
      start: '2022-12-30T23:00:00',
      end: '2022-12-31T00:30:00',
      title: 'titme34'
    },
    {
      start: '2022-12-30T23:00:00',
      end: '2022-12-31T00:30:00',
      title: 'titme35'
    },
    {
      start: '2022-12-30T22:30:00',
      end: '2022-12-31T00:00:00',
      title: 'titme36'
    },
    {
      start: '2022-12-30T22:00:00',
      end: '2022-12-31T07:00:00',
      title: 'titme37'
    },
    {
      start: '2022-12-30T19:20:00',
      end: '2022-12-31T01:10:00',
      title: 'titme38'
    },
    {
      start: '2022-12-30T19:00:00',
      end: '2022-12-30T20:00:00',
      title: 'titme39'
    },
    {
      start: '2022-12-30T18:30:00',
      end: '2022-12-30T19:00:00',
      title: 'titme40'
    }
  ]

  function TestApp() {
    return (
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialDate={INITIAL_DATE}
        initialView='dayGridMonth'
        dayMaxEvents={2}
        events={EVENTS}
        eventContent={(info) => <i>{info.event.title}</i>}
      />
    );
  }

  render(<TestApp />)
})

it('eventContent render can return true to use default rendering', () => {
  const INITIAL_DATE = '2022-12-01'
  const EVENTS = [
    {
      start: '2022-12-31T03:40:00',
      end: '2022-12-31T07:40:00',
      title: 'titme33'
    }
  ]

  const { container } = render(
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialDate={INITIAL_DATE}
      initialView='dayGridMonth'
      events={EVENTS}
      eventContent={() => true}
      eventClass={TEST_EVENT_CLASS}
    />
  )

  let eventEls = Array.from(container.querySelectorAll(`.${TEST_EVENT_CLASS}`)) as HTMLElement[]
  expect(eventEls[0].innerHTML.trim()).toBeTruthy()
})


;[
  'content', // https://github.com/fullcalendar/fullcalendar/issues/7160
  'component', // https://github.com/fullcalendar/fullcalendar/issues/7207
].forEach((settingName) => {
  it(`can render custom content in a custom view (with ${settingName} setting)`, () => {
    const { container } = render(
      <FullCalendar
        initialView="customView"
        views={{
          customView: {
            [settingName]: <div className='custom-view-content'>custom view content</div>
          }
        }}
      />
    )

    expect(container.querySelectorAll('.custom-view-content').length).toBe(1)
  })
})

;[
  'content',
  'component',
].forEach((settingName) => {
  it(`can render custom content AS FUNCTION in a custom view (with ${settingName} setting)`, () => {
    const { container } = render(
      <FullCalendar
        initialView="customView"
        views={{
          customView: {
            [settingName]: () => {
              return (
                <div className='custom-view-content'>custom view content</div>
              )
            }
          }
        }}
      />
    )

    expect(container.querySelectorAll('.custom-view-content').length).toBe(1)
  })
})


// https://github.com/fullcalendar/fullcalendar/issues/7189
it('custom view receives enough props for slicing', () => {
  const { container } = render(
    <FullCalendar
      initialDate={NOW_DATE}
      initialView="customView"
      initialEvents={[
        {
          title: 'event1',
          start: NOW_DATE,
        }
      ]}
      views={{
        customView: {
          content: (props) => {
            const segs = sliceEvents(props, true); // allDay=true
            return (
              <>
                <div className="custom-view-title">
                  {props.dateProfile.currentRange.start.getMonth()}
                </div>
                <div className="custom-view-events">{segs.length} events</div>
              </>
            );
          }
        }
      }}
    />
  )

  // temporary
  const test1 = container.querySelector('.custom-view-title')!.textContent
  const test2 = String(NOW_DATE.getMonth())
  if (test1 !== test2) {
    console.log('DEBUG!!!', test1, NOW_DATE.toString())
  }

  expect(container.querySelector('.custom-view-title')!.textContent).toBe(String(NOW_DATE.getMonth()))
  expect(container.querySelector('.custom-view-events')!.textContent).toBe('1 events')
})


// FullCalendar data utils
// -------------------------------------------------------------------------------------------------

function buildToolbar() {
  return {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  }
}

function buildEvent() {
  return { title: 'event', start: new Date(NOW_DATE.valueOf()) } // consistent datetime
}
