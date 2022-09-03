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
      it('unselects the current selection when clicking elsewhere in DOM', (done) => {
        let isDone = false // hack against dragging continuing after destroy
        let dayGridWrapper
        let calendar = initCalendar({
          unselect(arg) {
            if (!isDone) {
              expect(dayGridWrapper.getHighlightEls().length).toBe(0)
              expect('currentTarget' in arg.jsEvent).toBe(true) // a JS event
              expect(typeof arg.view).toBe('object')
              isDone = true
              done()
            }
          },
        })
        dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        calendar.select('2014-12-01', '2014-12-03')
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)

        $('#otherthing')
          .simulate('mousedown')
          .simulate('mouseup')
          .simulate('click')
      })
    })

    describe('when clicking another date', () => {
      it('unselects the current selection when clicking elsewhere in DOM', (done) => {
        let isDone = false // hack against dragging continuing after destroy
        let dayGridWrapper
        let calendar = initCalendar({
          unselect(arg) {
            if (!isDone) {
              expect(dayGridWrapper.getHighlightEls().length).toBe(0)
              expect('currentTarget' in arg.jsEvent).toBe(true) // a JS event
              expect(typeof arg.view).toBe('object')
              isDone = true
              done()
            }
          },
        })
        dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        calendar.select('2014-12-01', '2014-12-03')
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)
        $(dayGridWrapper.getDayEl('2014-12-04')).simulate('drag')
      })
    })
  })

  describe('when disabled', () => {
    pushOptions({
      unselectAuto: false,
    })

    it('keeps current selection when clicking elsewhere in DOM', (done) => {
      let calendar = initCalendar()
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      calendar.select('2014-12-01', '2014-12-03')
      expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)

      $('#otherthing')
        .simulate('mousedown')
        .simulate('mouseup')
        .simulate('click')

      setTimeout(() => {
        expect(dayGridWrapper.getHighlightEls().length).toBeGreaterThan(0)
        done()
      })
    })
  })
})
