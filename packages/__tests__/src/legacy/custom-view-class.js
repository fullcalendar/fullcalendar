import { View, createPlugin } from '@fullcalendar/core'

describe('custom view class', function() {

  it('calls all standard methods with correct parameters', function() {

    class CustomView extends View {

      render(props) {
        expect(props.dateProfile.activeRange.start instanceof Date).toBe(true)
        expect(props.dateProfile.activeRange.end instanceof Date).toBe(true)

        let eventRanges = this.sliceEvents(props.eventStore, true) // allDay=true
        expect(Array.isArray(eventRanges)).toBe(true)
        expect(eventRanges.length).toBe(1)
        expect(typeof eventRanges[0].def).toBe('object')
        expect(typeof eventRanges[0].ui).toBe('object')
        expect(typeof eventRanges[0].instance).toBe('object')
        expect(eventRanges[0].isStart).toBe(true)
        expect(eventRanges[0].isEnd).toBe(true)
        expect(eventRanges[0].range.start instanceof Date).toBe(true)
        expect(eventRanges[0].range.end instanceof Date).toBe(true)

        let dateSelection = props.dateSelection
        if (!dateSelection) {
          expect(dateSelection).toBe(null)
        } else {
          expect(typeof dateSelection).toBe('object')
          expect(dateSelection.allDay).toBe(true)
          expect(dateSelection.range.start instanceof Date).toBe(true)
          expect(dateSelection.range.end instanceof Date).toBe(true)
        }
      }

    }

    spyOn(CustomView.prototype, 'render').and.callThrough()

    initCalendar({
      plugins: [
        createPlugin({
          views: {
            custom: CustomView
          }
        })
      ],
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

    expect(CustomView.prototype.render).toHaveBeenCalled()

    currentCalendar.render()

    expect(CustomView.prototype.render).toHaveBeenCalled()

    currentCalendar.select('2014-12-25', '2014-01-01')

    expect(CustomView.prototype.render).toHaveBeenCalled()

    currentCalendar.unselect()

    expect(CustomView.prototype.render).toHaveBeenCalled()
  })

})
