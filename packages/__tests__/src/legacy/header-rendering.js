describe('header rendering', function() {

  describe('when using default header options', function() {
    it('should have title as default on left', function() {
      initCalendar()
      expect($('.fc-toolbar > .fc-left > *', currentCalendar.el)).toBeMatchedBy('h2')
    })
    it('should have empty center', function() {
      initCalendar()
      var center = $('.fc-toolbar > .fc-center', currentCalendar.el)
      expect(center).toBeEmpty()
    })
    it('should have right with today|space|left|right', function() {
      initCalendar()
      var rightChildren = $('.fc-toolbar > .fc-right > *', currentCalendar.el)
      var todayButton = rightChildren.eq(0)
      var buttonGroup = rightChildren.eq(1)
      var prevNextButtons = buttonGroup.children()
      expect(todayButton).toHaveClass('fc-today-button')
      expect(buttonGroup).toHaveClass('fc-button-group')
      expect(prevNextButtons.eq(0)).toHaveClass('fc-prev-button')
      expect(prevNextButtons.eq(1)).toHaveClass('fc-next-button')
    })
  })

  describe('when supplying header options', function() {
    pushOptions({
      header: {
        left: 'next,prev',
        center: 'prevYear today nextYear timeGridDay,timeGridWeek',
        right: 'title'
      }
    })
    it('should have title on the right', function() {
      initCalendar()
      expect($('.fc-toolbar > .fc-right > *', currentCalendar.el)).toBeMatchedBy('h2')
    })
    it('should have next|prev on left', function() {
      initCalendar()
      var buttonGroup = $('.fc-toolbar > .fc-left > *', currentCalendar.el)
      var prevNextButtons = buttonGroup.children()
      expect(prevNextButtons.eq(0)).toHaveClass('fc-next-button')
      expect(prevNextButtons.eq(1)).toHaveClass('fc-prev-button')
    })
    it('should have prevYear|space|today|space|nextYear in center', function() {
      initCalendar()
      var items = $('.fc-toolbar > .fc-center > *', currentCalendar.el)
      expect(items.eq(0)).toHaveClass('fc-prevYear-button')
      expect(items.eq(1)).toHaveClass('fc-today-button')
      expect(items.eq(2)).toHaveClass('fc-nextYear-button')
    })
  })

  describe('when setting header to false', function() {
    pushOptions({
      header: false
    })
    it('should not have header table', function() {
      initCalendar()
      expect($('.fc-toolbar')).not.toBeInDOM()
    })
  })

  it('allow for dynamically changing', function() {
    initCalendar()
    expect($('.fc-toolbar')).toBeInDOM()
    currentCalendar.setOption('header', false)
    expect($('.fc-toolbar')).not.toBeInDOM()
  })

  describe('renders left and right literally', function() {
    [ 'ltr', 'rtl' ].forEach(function(dir) {
      describe('when dir is ' + dir, function() {
        pushOptions({
          header: {
            left: 'prev',
            center: 'today',
            right: 'next'
          },
          dir
        })
        it('should have prev in left', function() {
          initCalendar()
          var fcHeaderLeft = $('.fc-toolbar > .fc-left', currentCalendar.el)
          expect(fcHeaderLeft).toContainElement('.fc-prev-button')
        })
        it('should have today in center', function() {
          initCalendar()
          var fcHeaderCenter = $('.fc-toolbar > .fc-center', currentCalendar.el)
          expect(fcHeaderCenter).toContainElement('.fc-today-button')
        })
        it('should have next in right', function() {
          initCalendar()
          var fcHeaderRight = $('.fc-toolbar > .fc-right', currentCalendar.el)
          expect(fcHeaderRight).toContainElement('.fc-next-button')
        })
      })
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

      initCalendar({
        header: {
          left: 'prev,next',
          right: 'title'
        }
      }, el)
      $('.fc-next-button').simulate('click')

      setTimeout(function() { // wait to see if handler was called
        expect(unloadCalled).toBe(false)
        cleanup()
        done()
      }, 100)
    })
  })
})
