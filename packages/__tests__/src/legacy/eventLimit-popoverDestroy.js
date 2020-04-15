import { DayGridViewWrapper } from "../lib/wrappers/DayGridViewWrapper"

describe('more-link popover', function() { // TODO: rename file
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2014-08-01',
    dayMaxEventRows: 3,
    events: [
      { title: 'event1', start: '2014-07-28', end: '2014-07-30', className: 'event1' },
      { title: 'event2', start: '2014-07-29', end: '2014-07-31', className: 'event2' },
      { title: 'event3', start: '2014-07-29', className: 'event3' },
      { title: 'event4', start: '2014-07-29', className: 'event4' }
    ],
    popoverViewportConstrain: false, // because PhantomJS window is small, don't do smart repositioning
    handleWindowResize: false // because showing the popover causes scrollbars and fires resize
  })

  it('closes when user clicks the X and trigger eventWillUnmount for every render', function(done) {
    var eventsRendered = {}
    var renderCount = 0
    var activated = false

    let calendar = initCalendar({
      eventDidMount: function(arg) {
        if (activated) {
          eventsRendered[arg.title] = true
          ++renderCount
        }
      },
      eventWillUnmount: function(arg) {
        delete eventsRendered[arg.title]
        --renderCount
      }
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    // Activate flags and pop event limit popover
    activated = true
    dayGridWrapper.openMorePopover()
    setTimeout(function() {

      expect(dayGridWrapper.getMorePopoverEl()).toBeVisible()

      dayGridWrapper.closeMorePopover()
      setTimeout(function() {
        expect(dayGridWrapper.getMorePopoverEl()).not.toBeVisible()
        expect(Object.keys(eventsRendered).length).toEqual(0)
        expect(renderCount).toEqual(0)
        done()
      })
    })
  })

  it('closes when user clicks outside of the popover and trigger eventWillUnmount for every render', function(done) {
    var eventsRendered = {}
    var renderCount = 0
    var activated = false

    let calendar = initCalendar({
      eventDidMount: function(arg) {
        if (activated) {
          eventsRendered[arg.title] = true
          ++renderCount
        }
      },
      eventWillUnmount: function(arg) {
        delete eventsRendered[arg.title]
        --renderCount
      }
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    // Activate flags and pop event limit popover
    activated = true
    dayGridWrapper.openMorePopover()
    setTimeout(function() {

      expect(dayGridWrapper.getMorePopoverEl()).toBeVisible()

      $('body').simulate('mousedown').simulate('click')
      setTimeout(function() {

        expect(dayGridWrapper.getMorePopoverEl()).not.toBeVisible()
        expect(Object.keys(eventsRendered).length).toEqual(0)
        expect(renderCount).toEqual(0)
        done()
      })
    })
  })
})
