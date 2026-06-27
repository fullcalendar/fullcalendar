import { waitTimeout } from '../lib/misc'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('unselectAuto', () => {
  pushOptions({
    selectable: true,
    initialDate: '2014-12-25',
    initialView: 'dayGridMonth',
  })

  beforeEach(() => {
    $('<div id="otherthing" />').appendTo('body')
  })

  afterEach(() => {
    $('#otherthing').remove()
  })

  describe('when enabled', () => {
    pushOptions({
      unselectAuto: true,
    })

    describe('when clicking away', () => {
      it('unselects the current selection when clicking elsewhere in DOM', async () => {
        let isDone = false // hack against dragging continuing after destroy
        let dayGridWrapper
        let unselectResolve: () => void
        let unselectPromise = new Promise<void>((resolve) => {
          unselectResolve = resolve
        })
        let calendar = initCalendar({
          unselect(info) {
            if (!isDone) {
              expect(dayGridWrapper.getHighlightEls().length).toBe(0)
              expect('currentTarget' in info.jsEvent).toBe(true) // a JS event
              expect(typeof info.view).toBe('object')
              isDone = true
              unselectResolve()
            }
          },
        })
        await waitTimeout()
        dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        calendar.select('2014-12-01', '2014-12-03')
        await waitTimeout()
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)

        $('#otherthing')
          .simulate('mousedown')
          .simulate('mouseup')
          .simulate('click')

        await unselectPromise
      })
    })

    describe('when clicking another date', () => {
      it('unselects the current selection when clicking elsewhere in DOM', async () => {
        let isDone = false // hack against dragging continuing after destroy
        let dayGridWrapper
        let unselectResolve: () => void
        let unselectPromise = new Promise<void>((resolve) => {
          unselectResolve = resolve
        })
        let calendar = initCalendar({
          unselect(info) {
            if (!isDone) {
              expect(dayGridWrapper.getHighlightEls().length).toBe(0)
              expect('currentTarget' in info.jsEvent).toBe(true) // a JS event
              expect(typeof info.view).toBe('object')
              isDone = true
              unselectResolve()
            }
          },
        })
        await waitTimeout()
        dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        calendar.select('2014-12-01', '2014-12-03')
        await waitTimeout()
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)
        dayGridWrapper.clickDate('2014-12-04')

        await unselectPromise
      })
    })
  })

  describe('when disabled', () => {
    pushOptions({
      unselectAuto: false,
    })

    it('keeps current selection when clicking elsewhere in DOM', async () => {
      let calendar = initCalendar()
      await waitTimeout()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      calendar.select('2014-12-01', '2014-12-03')
      await waitTimeout()
      expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)

      $('#otherthing')
        .simulate('mousedown')
        .simulate('mouseup')
        .simulate('click')

      await waitTimeout()
      expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)
    })
  })
})
