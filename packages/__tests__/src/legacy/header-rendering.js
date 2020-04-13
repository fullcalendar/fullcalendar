import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('headerToolbar rendering', function() { // TODO: rename file

  it('renders the default headerToolbar option', function() {
    let calendar = initCalendar()
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getSectionContent(0)).toEqual(
      [ { type: 'title' } ]
    )

    expect(toolbarWrapper.getSectionContent(1)).toEqual([])

    expect(toolbarWrapper.getSectionContent(2)).toEqual([
      { type: 'button', name: 'today' },
      { type: 'button-group', children: [
        { type: 'button', name: 'prev' },
        { type: 'button', name: 'next' }
      ] }
    ])
  })

  it('renders a given headerToolbar option', function() {
    let calendar = initCalendar({
      headerToolbar: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title'
      }
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getSectionContent(0)).toEqual([
      { type: 'button-group', children: [
        { type: 'button', name: 'next' },
        { type: 'button', name: 'prev' }
      ] }
    ])

    expect(toolbarWrapper.getSectionContent(1)).toEqual([
      { type: 'button', name: 'prevYear' },
      { type: 'button', name: 'today' },
      { type: 'button', name: 'nextYear' },
      { type: 'button-group', children: [
        { type: 'button', name: 'timeGridDay' },
        { type: 'button', name: 'timeGridWeek' }
      ] }
    ])

    expect(toolbarWrapper.getSectionContent(2)).toEqual([
      { type: 'title' }
    ])
  })

  describe('when setting headerToolbar to false', function() {
    pushOptions({
      headerToolbar: false
    })

    it('should not have headerToolbar', function() {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      expect(toolbarWrapper).toBeFalsy()
    })
  })

  it('allow for dynamically changing', function() {
    let calendar = initCalendar()
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper).toBeTruthy()

    calendar.setOption('headerToolbar', false)
    toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper).toBeFalsy()
  })

  describeOptions('direction', {
    'when direction is LTR': 'ltr',
    'when direction is RTL': 'rtl'
  }, function() {

    it('renders left and right literally', function() {
      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev',
          center: 'today',
          right: 'next'
        }
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      expect(toolbarWrapper.getSectionContent(0)).toEqual([
        { type: 'button', name: 'prev' }
      ])

      expect(toolbarWrapper.getSectionContent(1)).toEqual([
        { type: 'button', name: 'today' }
      ])

      expect(toolbarWrapper.getSectionContent(2)).toEqual([
        { type: 'button', name: 'next' }
      ])
    })
  })

  describe('when calendar is within a form', function() {

    it('should not submit the form when clicking the button', function(done) {
      var unloadCalled = false
      var el = $('<div id="calendar"/>')
        .wrap('<form action="https://google.com/"></form>')
        .appendTo('body')

      function beforeUnloadHandler() {
        console.log('when calendar is within a form, it submits!!!')
        unloadCalled = true
        cleanup()
        return 'click stay on this page'
      }
      $(window).on('beforeunload', beforeUnloadHandler)

      function cleanup() {
        el.remove()
        $(window).off('beforeunload', beforeUnloadHandler)
      }

      let calendar = initCalendar({
        headerToolbar: {
          left: 'prev,next',
          right: 'title'
        }
      }, el)
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      $(toolbarWrapper.getButtonEl('next')).simulate('click')
      setTimeout(function() { // wait to see if handler was called

        expect(unloadCalled).toBe(false)
        cleanup()
        done()
      }, 100)
    })
  })
})
