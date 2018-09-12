describe('custom view class', function() {

  it('calls all standard methods with correct parameters', function() {

    class CustomView extends FullCalendar.View {

      slicingType = 'all-day'

      initialize() {
      }

      renderSkeleton() {
      }

      renderDates(dateProfile) {
        expect(dateProfile.activeRange.start instanceof Date).toBe(true)
        expect(dateProfile.activeRange.end instanceof Date).toBe(true)
      }

      updateSize(height, isAuto) {
        expect(typeof height).toBe('number')
        expect(typeof isAuto).toBe('boolean')
      }

      renderEventRanges(eventRanges) {
        expect(Array.isArray(eventRanges)).toBe(true)
        expect(eventRanges.length).toBe(1)
        expect(typeof eventRanges[0].def).toBe('object')
        expect(typeof eventRanges[0].ui).toBe('object')
        expect(typeof eventRanges[0].instance).toBe('object')
        expect(eventRanges[0].isStart).toBe(true)
        expect(eventRanges[0].isEnd).toBe(true)
        expect(eventRanges[0].range.start instanceof Date).toBe(true)
        expect(eventRanges[0].range.end instanceof Date).toBe(true)
      }

      unrenderEvents() {
      }

      renderDateSelection(dateSpan) {
        expect(typeof dateSpan).toBe('object')
        expect(dateSpan.allDay).toBe(true)
        expect(dateSpan.range.start instanceof Date).toBe(true)
        expect(dateSpan.range.end instanceof Date).toBe(true)
      }

      unrenderDateSelection() {
      }

    }

    spyOn(CustomView.prototype, 'initialize').and.callThrough()
    spyOn(CustomView.prototype, 'renderSkeleton').and.callThrough()
    spyOn(CustomView.prototype, 'renderDates').and.callThrough()
    spyOn(CustomView.prototype, 'updateSize').and.callThrough()
    spyOn(CustomView.prototype, 'renderEventRanges').and.callThrough()
    spyOn(CustomView.prototype, 'unrenderEvents').and.callThrough()
    spyOn(CustomView.prototype, 'renderDateSelection').and.callThrough()
    spyOn(CustomView.prototype, 'unrenderDateSelection').and.callThrough()

    FullCalendar.views.custom = CustomView

    initCalendar({
      defaultView: 'custom',
      defaultDate: '2014-12-25', // will end up being a single-day view
      events: [
        {
          title: 'Holidays',
          start: '2014-12-25T09:00:00',
          end: '2014-12-25T11:00:00'
        }
      ]
    })

    expect(CustomView.prototype.initialize).toHaveBeenCalled()
    expect(CustomView.prototype.renderSkeleton).toHaveBeenCalled()
    expect(CustomView.prototype.renderDates).toHaveBeenCalled()
    expect(CustomView.prototype.updateSize).toHaveBeenCalled()
    expect(CustomView.prototype.renderEventRanges).toHaveBeenCalled()

    currentCalendar.rerenderEvents()

    expect(CustomView.prototype.unrenderEvents).toHaveBeenCalled()

    currentCalendar.select('2014-12-25', '2014-01-01')

    expect(CustomView.prototype.renderDateSelection).toHaveBeenCalled()

    currentCalendar.unselect()

    expect(CustomView.prototype.unrenderDateSelection).toHaveBeenCalled()

    delete FullCalendar.views.custom
  })

})
