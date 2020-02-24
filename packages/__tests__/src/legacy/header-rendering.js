import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('header rendering', function() {

  it('renders the default header option', function() {
    let calendar = initCalendar()
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getSectionContent('left')).toEqual(
      [ { type: 'title' } ]
    )

    expect(toolbarWrapper.getSectionContent('center')).toEqual([])

    expect(toolbarWrapper.getSectionContent('right')).toEqual([
      { type: 'button', name: 'today' },
      { type: 'button-group', children: [
        { type: 'button', name: 'prev' },
        { type: 'button', name: 'next' }
      ] }
    ])
  })

  it('renders a given header option', function() {
    let calendar = initCalendar({
      header: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title'
      }
    })
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar

    expect(toolbarWrapper.getSectionContent('left')).toEqual([
      { type: 'button-group', children: [
        { type: 'button', name: 'next' },
        { type: 'button', name: 'prev' }
      ] }
    ])

    expect(toolbarWrapper.getSectionContent('center')).toEqual([
      { type: 'button', name: 'prevYear' },
      { type: 'button', name: 'today' },
      { type: 'button', name: 'nextYear' },
      { type: 'button-group', children: [
        { type: 'button', name: 'timeGridDay' },
        { type: 'button', name: 'timeGridWeek' }
      ] }
    ])

    expect(toolbarWrapper.getSectionContent('right')).toEqual([
      { type: 'title' }
    ])
  })

  describe('when setting header to false', function() {
    pushOptions({
      header: false
    })

    it('should not have header table', function() {
      let calendar = initCalendar()
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      expect(toolbarWrapper).toBeFalsy()
    })
  })

  it('allow for dynamically changing', function() {
    let calendar = initCalendar()
    let toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper).toBeTruthy()

    calendar.setOption('header', false)
    toolbarWrapper = new CalendarWrapper(calendar).toolbar
    expect(toolbarWrapper).toBeFalsy()
  })

  describeOptions('dir', {
    'when dir is LTR': 'ltr',
    'when dir is RTL': 'rtl'
  }, function() {

    it('renders left and right literally', function() {
      let calendar = initCalendar({
        header: {
          left: 'prev',
          center: 'today',
          right: 'next'
        }
      })
      let toolbarWrapper = new CalendarWrapper(calendar).toolbar

      expect(toolbarWrapper.getSectionContent('left')).toEqual([
        { type: 'button', name: 'prev' }
      ])

      expect(toolbarWrapper.getSectionContent('center')).toEqual([
        { type: 'button', name: 'today' }
      ])

      expect(toolbarWrapper.getSectionContent('right')).toEqual([
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
        header: {
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
