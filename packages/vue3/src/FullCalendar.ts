import { PropType, defineComponent, h, Fragment, Teleport, VNode, toRaw, ref, watch, onMounted, onBeforeUpdate, onBeforeUnmount, useSlots, useAttrs } from 'vue'
import type { DefineComponent } from 'vue'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { CustomRenderingStore, CustomRendering } from 'fullcalendar/protected-api'
import { OPTION_IS_COMPLEX } from './options'

// This would be easier with `defineExpose()` in a Vue SFC, but this plain
// TypeScript component must declare its public bindings explicitly.
interface FullCalendarPublicBindings {
  getApi(): Calendar
}

const FullCalendar = defineComponent({
  inheritAttrs: false,

  props: {
    options: Object as PropType<CalendarOptions>
  },

  setup(props, { expose }) {
    const slots = useSlots()
    const attrs = useAttrs()

    // Reactive state
    const renderIdRef = ref(0)
    const customRenderingMapRef = ref(new Map<string, CustomRendering<any>>())

    // Template ref
    const calendarElRef = ref<HTMLElement | null>(null)

    // Non-reactive internal state (replaces getSecret pattern)
    let calendar: Calendar
    let handleCustomRendering: (customRendering: CustomRendering<any>) => void

    // Methods
    function getApi(): Calendar {
      return calendar
    }

    function buildOptions(suppliedOptions: CalendarOptions | undefined): CalendarOptions {
      return {
        ...suppliedOptions,
        customRenderingMetaMap: kebabToCamelKeys(slots),
        handleCustomRendering,
      }
    }

    // Expose getApi for external access
    expose({ getApi })

    // Lifecycle hooks
    onMounted(() => {
      const customRenderingStore = new CustomRenderingStore<any>()
      handleCustomRendering = customRenderingStore.handle.bind(customRenderingStore)

      const calendarOptions = buildOptions(toRaw(props.options))
      calendar = new Calendar(calendarElRef.value!, calendarOptions)

      calendar.render()
      customRenderingStore.subscribe((map) => {
        customRenderingMapRef.value = map // likely same reference, so won't rerender
        renderIdRef.value++ // force rerender
      })
    })

    onBeforeUpdate(() => {
      getApi().resumeRendering() // the watcher handlers paused it
    })

    onBeforeUnmount(() => {
      getApi().destroy()
    })

    // Watchers
    // Watch changes of ALL options and their nested objects,
    // but this is only a means to be notified of top-level non-complex options changes.
    watch(
      () => props.options,
      (options) => {
        calendar.pauseRendering()
        const calendarOptions = buildOptions(toRaw(options))
        calendar.resetOptions(calendarOptions)
        renderIdRef.value++ // will queue a rerender
      },
      { deep: true }
    )

    // Watchers for complex options (handlers called when nested objects change)
    for (const complexOptionName in OPTION_IS_COMPLEX) {
      watch(
        () => props.options?.[complexOptionName as keyof CalendarOptions],
        (val) => {
          // unfortunately the handler is called with undefined if new props were set, but the complex one wasn't ever set
          if (val !== undefined) {
            calendar.pauseRendering()
            calendar.resetOptions({
              [complexOptionName]: toRaw(val)
            }, [complexOptionName])
            renderIdRef.value++ // will queue a rerender
          }
        },
        { deep: true }
      )
    }

    // Render function
    return () => {
      const customRenderingNodes: VNode[] = []

      for (const customRendering of customRenderingMapRef.value.values()) {
        customRenderingNodes.push(
          h(CustomRenderingComponent, {
            key: customRendering.id,
            customRendering,
          })
        )
      }

      // establish reactive dependence
      renderIdRef.value

      return h(Fragment, null, [
        h('div', { ref: calendarElRef, ...attrs }),
        h(Fragment, null, customRenderingNodes)
      ])
    }
  },
}) as DefineComponent<
  { options?: CalendarOptions },
  FullCalendarPublicBindings
>

export default FullCalendar

// Custom Rendering
// -------------------------------------------------------------------------------------------------

const CustomRenderingComponent = defineComponent({
  props: {
    customRendering: Object as PropType<CustomRendering<any>>
  },

  setup(props) {
    return () => {
      const customRendering = props.customRendering!
      const innerContent = typeof customRendering.generatorMeta === 'function' ?
        customRendering.generatorMeta(customRendering.renderProps) : // vue-normalized slot function
        customRendering.generatorMeta // probably a vue JSX node returned from content-inject func

      return h(Teleport, { to: customRendering.containerEl }, innerContent)
    }
  }
})

// General Utils
// -------------------------------------------------------------------------------------------------

function kebabToCamelKeys<V>(map: { [key: string]: V }): { [key: string]: V } {
  const newMap: { [key: string]: V } = {}

  for (const key in map) {
    newMap[kebabToCamel(key)] = map[key]
  }

  return newMap
}

function kebabToCamel(s: string): string {
  return s
    .split('-')
    .map((word, index) => index ? capitalize(word) : word)
    .join('')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
