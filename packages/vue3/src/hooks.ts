import { ref } from 'vue'
import { CalendarController } from 'fullcalendar'

export function useCalendarController(): CalendarController {
  const revisionRef = ref(0)
  const calendarController = new CalendarController(() => {
    revisionRef.value++
  })

  return new Proxy(calendarController as any, {
    get(target, prop, receiver) {
      // Any reactive consumer that touches the controller (or calls its methods from inside an effect)
      // will now depend on tick.
      void revisionRef.value

      let value = Reflect.get(target, prop, receiver)

      // Bind methods so `this` stays correct
      if (typeof value === "function") {
        value = value.bind(target)
      }

      if (prop === 'getButtonState') {
        return () => {
          return new Proxy({} as any, {
            get(_target, prop, receiver) {
              void revisionRef.value // see above technique
              return Reflect.get(value(), prop, receiver)
            }
          })
        }
      }

      return value
    },
  })
}
