import { describe, expect, it, onTestFinished } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { isForceReact } from '../lib/env'
import { waitForSettle } from '../lib/settle'
import { hasPart } from '../lib/parts'

describe('destroy', () => {
  it.each(['ltr', 'rtl'] as const)('restores the root element (%s)', (direction) => {
    const calendar = initCalendar({ direction })
    expect(hasPart(calendar.el, 'root')).toBe(true)

    calendar.destroy()

    expect(calendar.el.className).toBe('')
    expect(calendar.el.hasAttribute('dir')).toBe(false)
    expect(calendar.el.childNodes.length).toBe(0)
  })

  /*
  Records the listeners added and not yet removed on long-lived targets: the document, the window,
  the calendar's own element, and non-DOM targets (ex: media query lists). Listeners on elements
  inside the calendar go away with them.
  */
  function watchListeners(): { getLive: (rootEl: HTMLElement | null) => string[] } {
    const live = new Map<string, EventTarget>()
    const proto = EventTarget.prototype
    const origAdd = proto.addEventListener
    const origRemove = proto.removeEventListener

    const listenerIds = new Map<any, number>()
    const targetIds = new Map<EventTarget, number>()

    function getKey(target: EventTarget, type: string, listener: any, options: any): string {
      const capture = typeof options === 'boolean' ? options : Boolean(options?.capture)
      let listenerId = listenerIds.get(listener)
      if (listenerId === undefined) {
        listenerId = listenerIds.size
        listenerIds.set(listener, listenerId)
      }
      let targetId = targetIds.get(target)
      if (targetId === undefined) {
        targetId = targetIds.size
        targetIds.set(target, targetId)
      }
      return `${targetId}:${type}:${listenerId}:${capture}`
    }

    proto.addEventListener = function (this: EventTarget, type: string, listener: any, options?: any) {
      if (listener) {
        live.set(getKey(this, type, listener, options), this)
      }
      return origAdd.call(this, type, listener, options)
    }
    proto.removeEventListener = function (this: EventTarget, type: string, listener: any, options?: any) {
      if (listener) {
        live.delete(getKey(this, type, listener, options))
      }
      return origRemove.call(this, type, listener, options)
    }
    onTestFinished(() => {
      proto.addEventListener = origAdd
      proto.removeEventListener = origRemove
    })

    return {
      getLive(rootEl: HTMLElement | null) {
        return Array.from(live.entries())
          .filter(([, target]) => (
            target === document || target === window || target === rootEl || !(target instanceof Node)
          ))
          .map(([key, target]) => `${(target as any).constructor.name} ${key}`)
      },
    }
  }

  it.each([
    'dayGridMonth',
    'dayGridWeek',
    'timeGridWeek',
    'listWeek',
  ])('leaves no listeners on the document, window or root element (%s)', async (initialView) => {
    const listeners = watchListeners()
    const calendar = initCalendar({
      initialView,
      initialDate: '2014-12-01',
      droppable: true, // likely to attach document listeners
      editable: true, // same
      selectable: true,
      events: [{ title: 'event1', start: '2014-12-01' }],
    })
    await waitForSettle()
    // the anchor: document listeners were added (ex: for unselectAuto)
    expect(listeners.getLive(calendar.el)).toContainEqual(expect.stringMatching(/^HTMLDocument \d+:mousedown:/))

    calendar.destroy()
    await waitForSettle()

    // React's createRoot() leaves its delegated listeners on the container after unmount, by design
    expect(listeners.getLive(isForceReact ? null : calendar.el)).toEqual([])
  })
})
