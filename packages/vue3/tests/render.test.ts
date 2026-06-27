import { test, expect } from 'vitest'
import { nextTick, ref, reactive, computed, h, onMounted, onBeforeUnmount, onUnmounted, defineAsyncComponent } from 'vue'
import { createI18n } from 'vue-i18n'
import { mount } from '@vue/test-utils'
import FullCalendar, { type CalendarOptions } from '../dist'
import classicThemePlugin from '../dist/themes/classic'
import dayGridPlugin from '../dist/daygrid'

const INITIAL_DATE = '2019-05-15'
const DEFAULT_OPTIONS = {
  initialDate: INITIAL_DATE,
  initialView: 'dayGridMonth',
  timeZone: 'UTC',
  plugins: [ classicThemePlugin, dayGridPlugin ]
}

test('renders', async () => {
  let wrapper = mount(FullCalendar, {
    props: {
      class: 'test-root',
      options: DEFAULT_OPTIONS,
    }
  })
  expect(wrapper.find('.test-root').exists()).toBe(true)
})

test('unmounts and calls destroy', async () => {
  let unmounted = false
  let options = {
    ...DEFAULT_OPTIONS,
    viewWillUnmount() {
      unmounted = true
    }
  }

  let wrapper = mount(FullCalendar, { props: { options } })
  wrapper.unmount()
  expect(unmounted).toBeTruthy()
})

test('handles a single prop change', async () => {
  let options = {
    ...DEFAULT_OPTIONS,
    weekends: true,
    dayCellClass: (info) => {
      const day = info.date.getUTCDay()
      return (day === 0 || day === 6) ? 'my-weekend' : ''
    }
  }
  let wrapper = mount(FullCalendar, {
    props: { options }
  })
  expect(wrapper.find('.my-weekend').exists()).toBe(true)

  // it's easy for the component to detect this change because the whole options object changes.
  // a more difficult scenario is when a component updates its own nested prop.
  // there's a test for that below (COMPONENT_FOR_OPTION_MANIP).
  await wrapper.setProps({
    options: {
      ...options,
      weekends: false // good idea to test a falsy prop
    }
  })
  expect(wrapper.find('.my-weekend').exists()).toBe(false)
})

test('renders events with Date objects', async () => { // necessary to test copy util
  let wrapper = mount(FullCalendar, {
    props: {
      options: {
        ...DEFAULT_OPTIONS,
        eventClass: 'my-event',
        events: [
          { title: 'event', start: new Date(INITIAL_DATE) },
          { title: 'event', start: new Date(INITIAL_DATE) }
        ]
      }
    }
  })

  expect(wrapper.findAll('.my-event').length).toBe(2)
})

test('handles multiple prop changes, including event reset', async () => {
  let viewMountCnt = 0
  let eventRenderCnt = 0
  let options = {
    ...DEFAULT_OPTIONS,
    eventClass: 'my-event',
    dayCellClass: (info) => {
      const day = info.date.getUTCDay()
      return (day === 0 || day === 6) ? 'my-weekend' : ''
    },
    events: [
      { title: 'event0', start: INITIAL_DATE }
    ],
    viewDidMount() {
      viewMountCnt++
    },
    eventContent() {
      eventRenderCnt++
    }
  }

  let wrapper = mount(FullCalendar, {
    props: { options }
  })

  expect(wrapper.findAll('.my-event').length).toBe(1)
  expect(wrapper.find('.my-weekend').exists()).toBe(true)
  expect(viewMountCnt).toBe(1)
  expect(eventRenderCnt).toBe(1)

  viewMountCnt = 0
  eventRenderCnt = 0

  await wrapper.setProps({
    options: {
      ...options,
      direction: 'rtl',
      weekends: false,
      events: [
        { title: 'event0', start: INITIAL_DATE },
        { title: 'event1', start: INITIAL_DATE }
      ]
    }
  })

  expect(wrapper.findAll('.my-event').length).toBe(2)
  expect(wrapper.find('.my-weekend').exists()).toBe(false)
  expect(viewMountCnt).toBe(0)

  /*
  NOTE: we wish this was only 2 rerenders, but likely 4 because of same bug addressed by vdomExtraRenders
  */
  expect(eventRenderCnt).toBe(4)
})

test('should expose an API', async () => {
  let wrapper = mount(FullCalendar, { props: { options: DEFAULT_OPTIONS } })
  let calendarApi = (wrapper.vm as any).getApi()
  expect(calendarApi).toBeTruthy()

  let newDate = new Date(Date.UTC(2000, 0, 1))
  calendarApi.gotoDate(newDate)
  expect(calendarApi.getDate().valueOf()).toBe(newDate.valueOf())
})

const COMPONENT_FOR_API = {
  setup(_props, { expose }) {
    const fullCalendar = ref<any>(null)

    function gotoDate(newDate: Date) {
      let calendarApi = fullCalendar.value.getApi()
      calendarApi.gotoDate(newDate)
    }

    function getDate() {
      let calendarApi = fullCalendar.value.getApi()
      return calendarApi.getDate()
    }

    expose({ gotoDate, getDate })

    return () => h('div', null, [
      h(FullCalendar, { options: DEFAULT_OPTIONS, ref: fullCalendar })
    ])
  }
}

test('should expose an API in $refs', () => {
  let wrapper = mount(COMPONENT_FOR_API)
  let newDate = new Date(Date.UTC(2000, 0, 1))

  ;(wrapper.vm as any).gotoDate(newDate)
  expect((wrapper.vm as any).getDate().valueOf()).toBe(newDate.valueOf())
})

test('should handle multiple refs', () => {
  let wrapper = mount({
    setup(_props, { expose }) {
      const fullCalendar0 = ref<any>(null)
      const fullCalendar1 = ref<any>(null)
      const fullCalendar2 = ref<any>(null)

      function check() {
        let api0 = fullCalendar0.value.getApi()
        let api1 = fullCalendar1.value.getApi()
        let api2 = fullCalendar2.value.getApi()
        expect(api0).not.toBe(api1)
        expect(api1).not.toBe(api2)
        expect(api2).not.toBe(api0)
      }

      expose({ check })

      return () => h('div', null, [
        h(FullCalendar, { options: DEFAULT_OPTIONS, ref: fullCalendar0 }),
        h(FullCalendar, { options: DEFAULT_OPTIONS, ref: fullCalendar1 }),
        h(FullCalendar, { options: DEFAULT_OPTIONS, ref: fullCalendar2 }),
      ])
    }
  })

  ;(wrapper.vm as any).check()
})

// toolbar/event non-reactivity

const COMPONENT_FOR_OPTION_MANIP = {
  props: ['calendarViewDidMount', 'calendarEventContent'],
  setup(props: any, { expose }) {
    const something = ref(0)
    const calendarOptions: CalendarOptions = reactive({
      ...DEFAULT_OPTIONS,
      viewDidMount: props.calendarViewDidMount,
      eventContent: props.calendarEventContent,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      eventClass: 'my-event',
      dayCellClass: (info: any) => {
        const day = info.date.getUTCDay()
        return (day === 0 || day === 6) ? 'my-weekend' : ''
      },
      events: [
        { title: 'event0', start: INITIAL_DATE }
      ],
      weekends: true
    })

    function changeSomething() {
      something.value++
    }

    function disableWeekends() {
      calendarOptions.weekends = false
    }

    expose({ changeSomething, disableWeekends })

    return () => h('div', null, [
      h('div', null, `calendarHeight: ${calendarOptions.height}`),
      h(FullCalendar, { options: calendarOptions })
    ])
  }
}

test('handles an object change when prop is reassigned', async () => {
  let wrapper = mount(COMPONENT_FOR_OPTION_MANIP)
  expect(wrapper.find('.my-weekend').exists()).toBe(true)

  ;(wrapper.vm as any).disableWeekends()
  await nextTick()
  expect(wrapper.find('.my-weekend').exists()).toBe(false)
})

test('avoids rerendering unchanged toolbar/events', async () => {
  let viewMountCnt = 0
  let eventRenderCnt = 0

  let wrapper = mount(COMPONENT_FOR_OPTION_MANIP, {
    props: {
      calendarViewDidMount() {
        viewMountCnt++
      },
      calendarEventContent() {
        eventRenderCnt++
      }
    }
  })

  expect(viewMountCnt).toBe(1)
  expect(eventRenderCnt).toBe(1)

  viewMountCnt = 0
  eventRenderCnt = 0

  ;(wrapper.vm as any).changeSomething()
  expect(viewMountCnt).toBe(0)
  expect(eventRenderCnt).toBe(0)
})

// event reactivity

const COMPONENT_FOR_EVENT_MANIP = {
  setup(_props: any, { expose }) {
    const calendarOptions: CalendarOptions = reactive({
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'event0', start: INITIAL_DATE }
      ]
    })

    function addEvent() {
      (calendarOptions.events as any[]).push({ title: 'event1', start: INITIAL_DATE })
    }

    function updateTitle(title: string) {
      (calendarOptions.events as any[])[0].title = title
    }

    expose({ addEvent, updateTitle })

    return () => h(FullCalendar, { options: calendarOptions })
  }
}

test('reacts to event adding', async () => {
  let wrapper = mount(COMPONENT_FOR_EVENT_MANIP)
  expect(wrapper.findAll('.my-event').length).toBe(1)

  ;(wrapper.vm as any).addEvent()
  await nextTick()
  expect(wrapper.findAll('.my-event').length).toBe(2)
})

test('reacts to event property changes', async () => {
  let wrapper = mount(COMPONENT_FOR_EVENT_MANIP)
  expect(wrapper.find('.my-event').text()).toContain('event0')

  ;(wrapper.vm as any).updateTitle('another title')
  await nextTick()
  expect(wrapper.find('.my-event').text()).toContain('another title')
})

// event reactivity with fetch function

const EVENT_FUNC_COMPONENT = {
  setup() {
    function fetchEvents(_fetchInfo: any, successCallback: (events: any[]) => void) {
      setTimeout(() => {
        successCallback([
          { title: 'event0', start: INITIAL_DATE },
          { title: 'event1', start: INITIAL_DATE }
        ])
      }, 0)
    }

    const calendarOptions: CalendarOptions = {
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: fetchEvents
    }

    return () => h(FullCalendar, { options: calendarOptions })
  }
}

test('can receive an async event function', () => {
  return new Promise<void>((resolve) => {
    let wrapper = mount(EVENT_FUNC_COMPONENT)
    setTimeout(() => {
      expect(wrapper.findAll('.my-event').length).toBe(2)
      resolve()
    }, 100) // more than event function's setTimeout
  })
})

// event reactivity with computed prop

const EVENT_COMP_PROP_COMPONENT = {
  setup(_props: any, { expose }) {
    const first = ref(true)

    const calendarOptions = computed<CalendarOptions>(() => ({
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: first.value ? [] : [
        { title: 'event0', start: INITIAL_DATE },
        { title: 'event1', start: INITIAL_DATE }
      ]
    }))

    function markNotFirst() {
      first.value = false
    }

    expose({ markNotFirst })

    return () => h(FullCalendar, { options: calendarOptions.value })
  }
}

test('reacts to computed events prop', async () => {
  let wrapper = mount(EVENT_COMP_PROP_COMPONENT)
  expect(wrapper.findAll('.my-event').length).toBe(0)

  ;(wrapper.vm as any).markNotFirst()
  await nextTick()
  expect(wrapper.findAll('.my-event').length).toBe(2)
})

// component with vue slots

const COMPONENT_WITH_SLOTS = {
  setup(_props: any, { expose }) {
    const calendarOptions: CalendarOptions = reactive({
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'event0', start: INITIAL_DATE }
      ]
    })

    function resetEvents() {
      calendarOptions.events = [
        { title: 'event0', start: INITIAL_DATE }
      ]
    }

    expose({ resetEvents })

    return () => h(FullCalendar, { options: calendarOptions }, {
      eventContent: (arg: any) => [
        h('b', null, arg.timeText),
        h('i', null, arg.event.title)
      ]
    })
  }
}

test('renders and rerenders a custom slot', async () => {
  let wrapper = mount(COMPONENT_WITH_SLOTS)
  await nextTick()

  let eventEl = wrapper.findAll('.my-event')[0]
  expect(eventEl.findAll('i').length).toBe(1)

  ;(wrapper.vm as any).resetEvents()
  await nextTick()
  eventEl = wrapper.findAll('.my-event')[0]
  expect(eventEl.findAll('i').length).toBe(1)
})

test('calls nested vue lifecycle methods when in custom content', async () => {
  let mountedCalled = false
  let beforeUnmountCalled = false
  let unmountedCalled = false

  const EventContent = {
    props: {
      event: { type: Object, required: true }
    },
    setup(props: any) {
      onMounted(() => {
        mountedCalled = true
      })
      onBeforeUnmount(() => {
        beforeUnmountCalled = true
      })
      onUnmounted(() => {
        unmountedCalled = true
      })

      return () => h('div', null, props.event.title)
    }
  }

  let wrapper = mount({
    setup() {
      const calendarOptions: CalendarOptions = {
        ...DEFAULT_OPTIONS,
        events: [
          { title: 'event0', start: INITIAL_DATE }
        ]
      }

      return () => h(FullCalendar, { options: calendarOptions }, {
        eventContent: (arg: any) => h(EventContent, { event: arg.event })
      })
    }
  })

  await nextTick()
  expect(mountedCalled).toBe(true)

  wrapper.unmount()
  await nextTick()
  expect(beforeUnmountCalled).toBe(true)
  expect(unmountedCalled).toBe(true)
})

// component with eventContent (two multi-day events)

const COMPONENT_WITH_SLOTS_MULTIDAY_EVENTS = {
  setup() {
    const calendarOptions: CalendarOptions = {
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'all-day 1', start: INITIAL_DATE, end: '2019-05-18' }, // 3 day
        { title: 'all-day 2', start: INITIAL_DATE, end: '2019-05-17' }, // 2 day
      ]
    }

    return () => h(FullCalendar, { options: calendarOptions }, {
      eventContent: (arg: any) => [
        h('b', null, arg.timeText),
        h('i', null, arg.event.title)
      ]
    })
  }
}

test('renders two multi-day events positioned correctly', () => {
  return new Promise<void>((resolve) => {
    let wrapper = mount(COMPONENT_WITH_SLOTS_MULTIDAY_EVENTS)

    setTimeout(() => {
      let eventEls = wrapper.findAll('.my-event').map((w) => w.element)
      expect(eventEls.length).toBe(2)
      expect(anyElsIntersect(eventEls)).toBe(false)
      resolve()
    }, 100)
  })
})

// component with eventContent (multi-day & timed)

const COMPONENT_WITH_SLOTS_MULTIDAY_AND_TIMED = {
  setup() {
    const calendarOptions: CalendarOptions = {
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'all-day 1', start: INITIAL_DATE, end: '2019-05-18' }, // 3 day
        { title: 'all-day 2', start: INITIAL_DATE + 'T12:00:00' },
      ]
    }

    return () => h(FullCalendar, { options: calendarOptions }, {
      eventContent: (arg: any) => [
        h('b', null, arg.timeText),
        h('i', null, arg.event.title)
      ]
    })
  }
}

test('renders a multi-day and timed event positioned correctly', () => {
  return new Promise<void>((resolve) => {
    let wrapper = mount(COMPONENT_WITH_SLOTS_MULTIDAY_AND_TIMED)

    setTimeout(() => {
      let eventEls = wrapper.findAll('.my-event').map((w) => w.element)
      expect(eventEls.length).toBe(2)
      expect(anyElsIntersect(eventEls)).toBe(false)
      resolve()
    }, 100)
  })
})

// component with vue slots AND custom render func

const COMPONENT_WITH_SLOTS2 = {
  setup() {
    const calendarOptions: CalendarOptions = {
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'event0', start: INITIAL_DATE }
      ],
      eventContent: (info: any) => {
        return h('i', {}, info.event.title)
      }
    }

    return () => h(FullCalendar, { options: calendarOptions }, {
      eventContent: (arg: any) => [
        h('b', null, arg.timeText),
        h('i', null, arg.event.title)
      ]
    })
  }
}

test('render function can return jsx', async () => {
  let wrapper = mount(COMPONENT_WITH_SLOTS2)
  await nextTick()

  let eventEl = wrapper.findAll('.my-event')[0]
  expect(eventEl.findAll('i').length).toBe(1)
})

// component with vue slots AND custom render func that returns vanilla-js-style objects

const COMPONENT_WITH_SLOTS3 = {
  setup() {
    const calendarOptions: CalendarOptions = {
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'event0', start: INITIAL_DATE }
      ],
      eventContent: (info: any) => {
        return { html: `<i>${info.event.title}</i>` }
      }
    }

    return () => h(FullCalendar, { options: calendarOptions })
  }
}

test('render function can return vanilla-js-style objects', async () => {
  let wrapper = mount(COMPONENT_WITH_SLOTS3)
  await nextTick()

  let eventEl = wrapper.findAll('.my-event')[0]
  expect(eventEl.findAll('i').length).toBe(1)
})

// event rendering and did-mount hooks

test(`during foreground custom event rendering, receives el`, async () => {
  let didMountCalled = false

  mount({
    setup() {
      const calendarOptions: CalendarOptions = {
        ...DEFAULT_OPTIONS,
        events: [
          {
            title: 'Event 1',
            start: INITIAL_DATE,
          },
        ],
        eventDidMount: (eventInfo: any) => {
          expect(eventInfo.el).toBeTruthy()
          didMountCalled = true
        }
      }

      return () => h(FullCalendar, { options: calendarOptions }, {
        eventContent: (arg: any) => h('i', null, arg.event.title)
      })
    }
  })

  await nextTick()
  expect(didMountCalled).toBe(true)
})

test(`during background custom event rendering, receives el`, async () => {
  let didMountCalled = false

  mount({
    setup() {
      const calendarOptions: CalendarOptions = {
        ...DEFAULT_OPTIONS,
        events: [
          {
            title: 'Event 1',
            start: INITIAL_DATE,
            display: 'background',
          },
        ],
        backgroundEventDidMount: (eventInfo: any) => {
          expect(eventInfo.el).toBeTruthy()
          didMountCalled = true
        }
      }

      return () => h(FullCalendar, { options: calendarOptions }, {
        eventContent: (arg: any) => h('i', null, arg.event.title)
      })
    }
  })

  await nextTick()
  expect(didMountCalled).toBe(true)
})

//

const OTHER_COMPONENT = {
  setup() {
    return () => h('i', null, 'other component')
  }
}

const COMPONENT_USING_ROOT_OPTIONS_IN_SLOT = {
  setup() {
    const calendarOptions: CalendarOptions = {
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'event0', start: INITIAL_DATE }
      ]
    }

    return () => h(FullCalendar, { options: calendarOptions }, {
      eventContent: () => h(OTHER_COMPONENT)
    })
  }
}

test('can use component defined in higher contexts', async () => {
  let wrapper = mount(COMPONENT_USING_ROOT_OPTIONS_IN_SLOT)

  await nextTick()
  let eventEl = wrapper.findAll('.my-event')[0]
  expect(eventEl.findAll('i').length).toBe(1)
})

test('allows plugin access for slots', async () => {
  let helloJp = 'こんにちは、世界'
  let i18n = createI18n({
    locale: 'ja',
    messages: {
      ja: {
        message: {
          hello: helloJp
        }
      }
    }
  })

  let wrapper = mount({
    setup() {
      const calendarOptions: CalendarOptions = {
        ...DEFAULT_OPTIONS,
        eventClass: 'my-event',
        events: [
          { title: 'event0', start: INITIAL_DATE }
        ]
      }

      return () => h(FullCalendar, { options: calendarOptions }, {
        eventContent: () => h('b', null, (i18n.global as any).t('message.hello'))
      })
    }
  }, {
    global: {
      plugins: [i18n as any]
    }
  })

  await nextTick()
  let eventEl = wrapper.findAll('.my-event')[0]
  expect(eventEl.text()).toBe(helloJp)
})

// dynamic events

const DynamicEvent = defineAsyncComponent(() => import('./DynamicEvent.vue'))

const COMPONENT_WITH_DYNAMIC_SLOTS = {
  setup() {
    const calendarOptions: CalendarOptions = {
      ...DEFAULT_OPTIONS,
      eventClass: 'my-event',
      events: [
        { title: 'event0', start: INITIAL_DATE }
      ]
    }

    return () => h(FullCalendar, { options: calendarOptions }, {
      eventContent: (arg: any) => h(DynamicEvent, { event: arg.event })
    })
  }
}

// https://github.com/fullcalendar/fullcalendar-vue/issues/122
test('renders dynamically imported event', () => {
  return new Promise<void>((resolve) => {
    let wrapper = mount(COMPONENT_WITH_DYNAMIC_SLOTS)

    setTimeout(() => {
      let eventEl = wrapper.findAll('.my-event')[0]
      expect(eventEl.findAll('.dynamic-event').length).toEqual(1)
      resolve()
    }, 100)
  })
})

// slots data binding

test('slot rendering reacts to bound parent state', async () => {
  let wrapper = mount({
    setup(_props: Record<string, never>, { expose }) {
      const isBold = ref(false)
      const calendarOptions: CalendarOptions = {
        ...DEFAULT_OPTIONS,
        eventClass: 'my-event',
        events: [
          { title: 'event0', start: INITIAL_DATE }
        ]
      }

      function turnBold() {
        isBold.value = true
      }

      expose({ turnBold })

      return () => h(FullCalendar, { options: calendarOptions }, {
        eventContent: (arg: { event: { title: string } }) => [
          isBold.value ? h('b', null, 'Event:') : h('i', null, 'Event:'),
          ` ${arg.event.title}`
        ]
      })
    }
  })

  await nextTick()
  let eventEl = wrapper.findAll('.my-event')[0]
  expect(eventEl.findAll('b').length).toEqual(0)
  expect(eventEl.findAll('i').length).toEqual(1)

  ;(wrapper.vm as any).turnBold()
  await nextTick()
  expect(eventEl.findAll('b').length).toEqual(1)
  expect(eventEl.findAll('i').length).toEqual(0)
})

// DOM geometry utils

function anyElsIntersect(els: Element[]) {
  let rects = els.map((el) => el.getBoundingClientRect())

  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      if (rectsIntersect(rects[i], rects[j])) {
        return [els[i], els[j]]
      }
    }
  }

  return false
}

function rectsIntersect(rect0: DOMRect, rect1: DOMRect) {
  return rect0.left < rect1.right && rect0.right > rect1.left && rect0.top < rect1.bottom && rect0.bottom > rect1.top
}
