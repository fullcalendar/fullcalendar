import { beforeAll, describe, expect, it, onTestFinished, vi } from 'vitest'
import { DropInfo } from 'fullcalendar'
import { ThirdPartyDraggable } from 'fullcalendar/interaction'
import Sortable from 'sortablejs'
import { appendTestElement, initCalendar } from '../lib/calendar'
import { loadScript } from '../lib/global-build'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { getRectCenter, Point, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

/*
ThirdPartyDraggable follows a drag made by another drag-and-drop library, through the mouse events
that the library's drag produces. Each library is tested two ways: dragging an element out to the
calendar ("draggable"), and dragging an item out of a sortable list.

SortableJS needs `forceFallback: true`. By default it uses native HTML5 drag-and-drop, during which
the browser sends no mouse events, so ThirdPartyDraggable can't follow it:
https://github.com/fullcalendar/fullcalendar/issues/7492
*/

let jQuery: any

beforeAll(async () => {
  // jQuery UI is a classic script that extends the jQuery global, the way pages load it
  await loadScript(new URL('../../node_modules/jquery/dist/jquery.min.js', import.meta.url))
  await loadScript(new URL('../../node_modules/jquery-ui/dist/jquery-ui.min.js', import.meta.url))
  jQuery = (window as any).jQuery
})

interface LibrarySetup {
  // makes the list's items draggable, and returns a teardown function
  init: (listEl: HTMLElement) => () => void
  // the element the library moves with the pointer, for ThirdPartyDraggable to hide over the calendar
  mirrorSelector: string
}

const LIBRARY_SETUPS: [string, LibrarySetup][] = [
  ['jQuery UI draggable', {
    init: (listEl) => {
      const $items = jQuery(listEl).children().draggable()
      return () => $items.draggable('destroy')
    },
    mirrorSelector: '.ui-draggable-dragging',
  }],
  ['jQuery UI sortable', {
    init: (listEl) => {
      const $list = jQuery(listEl).sortable()
      return () => $list.sortable('destroy')
    },
    mirrorSelector: '.ui-sortable-helper',
  }],
  ['SortableJS draggable (a list that clones its items out)', {
    init: (listEl) => {
      const sortable = Sortable.create(listEl, {
        group: { name: 'external', pull: 'clone', put: false },
        sort: false,
        forceFallback: true,
      })
      return () => sortable.destroy()
    },
    mirrorSelector: '.sortable-fallback',
  }],
  ['SortableJS sortable', {
    init: (listEl) => {
      const sortable = Sortable.create(listEl, { forceFallback: true })
      return () => sortable.destroy()
    },
    mirrorSelector: '.sortable-fallback',
  }],
]

describe.each(LIBRARY_SETUPS)('dragging onto the calendar with %s', (_desc, setup) => {
  /*
  A list of two items, below the calendar, made draggable by the library and followed by
  ThirdPartyDraggable. Teardown destroys both.
  */
  function createList(): HTMLElement[] {
    const listEl = appendTestElement(document.createElement('div'))
    listEl.style.width = '200px'

    for (const title of ['event 1', 'event 2']) {
      const itemEl = listEl.appendChild(document.createElement('div'))
      itemEl.className = 'item'
      itemEl.textContent = title
      itemEl.style.padding = '4px'
      itemEl.setAttribute('data-event', JSON.stringify({ title }))
    }

    const destroyLibrary = setup.init(listEl)
    const draggable = new ThirdPartyDraggable({ itemSelector: '.item', mirrorSelector: setup.mirrorSelector })
    onTestFinished(() => {
      draggable.destroy()
      destroyLibrary()
    })

    return Array.from(listEl.children) as HTMLElement[]
  }

  /*
  Drags the item and releases at the point computed by `drop` (after the press). `whileOver` runs
  before release.
  */
  async function dragItem(itemEl: HTMLElement, drop: () => Point, whileOver?: () => void): Promise<void> {
    itemEl.scrollIntoView({ block: 'nearest' })
    await pointer.press(getRectCenter(itemEl.getBoundingClientRect()), async () => {
      await pointer.move(drop(), 10)
      await waitForSettle()
      whileOver?.()
    })
    await waitForSettle()
  }

  describe('in dayGrid', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-08-23',
      dragScroll: false,
      droppable: true,
    }

    // dayGrid only highlights the day for an external drag, so the library's mirror stays visible
    it('drops onto the day, creating the item\'s event', async () => {
      const drop = vi.fn<(info: DropInfo) => void>()
      const calendar = initCalendar({ ...options, drop })
      await waitForSettle()

      const [itemEl] = createList()
      let mirrorVisibility: string | undefined
      await dragItem(itemEl, () => new DayGridModel(calendar.el).pointForDate('2014-08-06'), () => {
        mirrorVisibility = document.querySelector<HTMLElement>(setup.mirrorSelector)?.style.visibility
      })

      expect(mirrorVisibility).toBe('')
      expect(drop).toHaveBeenCalledOnce()
      const dropInfo = drop.mock.calls[0][0]
      expect(dropInfo.dateStr).toBe('2014-08-06')
      expect(dropInfo.draggedEl).toBe(itemEl)
      expect(dropInfo.jsEvent.type).toBe('mouseup')
      expect(calendar.getEvents().map((event) => [event.title, event.startStr])).toEqual([['event 1', '2014-08-06']])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/2240
    it('still accepts drops after a drop and a view change', async () => {
      const drop = vi.fn<(info: DropInfo) => void>()
      const calendar = initCalendar({ ...options, drop })
      await waitForSettle()

      const itemEls = createList()
      await dragItem(itemEls[0], () => new DayGridModel(calendar.el).pointForDate('2014-08-06'))

      calendar.next()
      calendar.prev()
      itemEls[0].remove()
      await waitForSettle()
      await dragItem(itemEls[1], () => new DayGridModel(calendar.el).pointForDate('2014-08-07'))

      expect(drop.mock.calls.map(([info]) => info.dateStr)).toEqual(['2014-08-06', '2014-08-07'])
    })

    it.each([
      ['a non-matching selector', '.other'],
      ['a function returning false', () => false],
    ])('doesn\'t drop when dropAccept is %s', async (_desc, dropAccept) => {
      const drop = vi.fn()
      const calendar = initCalendar({ ...options, dropAccept, drop })
      await waitForSettle()

      const [itemEl] = createList()
      await dragItem(itemEl, () => new DayGridModel(calendar.el).pointForDate('2014-08-06'))

      expect(drop).not.toHaveBeenCalled()
      expect(calendar.getEvents()).toEqual([])
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/2225
  describe.each(['UTC', 'local'])('in timeGrid with timeZone:%s', (timeZone) => {
    // timeGrid renders its own mirror of the event, so it hides the library's while over the calendar
    it('drops at the time under the pointer, hiding the library\'s mirror until the drop', async () => {
      const drop = vi.fn<(info: DropInfo) => void>()
      const calendar = initCalendar({
        initialView: 'timeGridWeek',
        initialDate: '2014-08-23',
        scrollTime: '00:00',
        dragScroll: false,
        droppable: true,
        timeZone,
        drop,
      })
      await waitForSettle()

      const [itemEl] = createList()
      let mirrorEl: HTMLElement | null = null
      let mirrorVisibility: string | undefined
      await dragItem(itemEl, () => new TimeGridModel(calendar.el).pointForDateTime('2014-08-20T01:00'), () => {
        mirrorEl = document.querySelector<HTMLElement>(setup.mirrorSelector)
        mirrorVisibility = mirrorEl?.style.visibility
      })

      expect(mirrorVisibility).toBe('hidden')
      expect(mirrorEl!.style.visibility).toBe('') // restored, in case the library keeps the element

      expect(drop).toHaveBeenCalledOnce()
      const dropInfo = drop.mock.calls[0][0]
      expect(dropInfo.allDay).toBe(false)
      if (timeZone === 'UTC') {
        expect(dropInfo.dateStr).toBe('2014-08-20T01:00:00Z')
      } else {
        const { date } = dropInfo
        expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2014, 7, 20, 1])
      }
    })
  })
})
