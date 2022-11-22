import { createPlugin } from '@fullcalendar/core'
import { sliceEvents } from '@fullcalendar/core'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('custom view class', () => { // TODO: rename file
  it('calls all standard methods with correct parameters', () => {
    const CustomViewConfig = {
      classNames: 'awesome-view',
      didMount() {},
      willUnmount() {},

      content(props) {
        expect(props.dateProfile.activeRange.start instanceof Date).toBe(true)
        expect(props.dateProfile.activeRange.end instanceof Date).toBe(true)

        let eventRanges = sliceEvents(props, true) // allDay=true
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

        return { html: '<div class="hello-world">hello world</div>' }
      },
    }

    spyOn(CustomViewConfig, 'didMount').and.callThrough()
    spyOn(CustomViewConfig, 'content').and.callThrough()
    spyOn(CustomViewConfig, 'willUnmount').and.callThrough()

    function resetCounts() {
      CustomViewConfig.didMount.calls.reset()
      CustomViewConfig.content.calls.reset()
      CustomViewConfig.willUnmount.calls.reset()
    }

    let calendar = initCalendar({
      plugins: [
        createPlugin({
          name: 'test-plugin',
          views: {
            custom: CustomViewConfig,
          },
        }),
      ],
      initialView: 'custom',
      initialDate: '2014-12-25', // will end up being a single-day view
      events: [
        {
          title: 'Holidays',
          start: '2014-12-25T09:00:00',
          end: '2014-12-25T11:00:00',
        },
      ],
    })
    let calendarWrapper = new CalendarWrapper(calendar)

    let viewEl = calendarWrapper.getViewEl()
    expect(viewEl).toHaveClass('awesome-view')
    expect($(viewEl).find('.hello-world').length).toBe(1)

    expect(CustomViewConfig.didMount.calls.count()).toBe(1)
    expect(CustomViewConfig.content.calls.count()).toBe(1)
    expect(CustomViewConfig.willUnmount.calls.count()).toBe(0)

    resetCounts()
    calendar.select('2014-12-25', '2014-01-01')
    expect(CustomViewConfig.didMount.calls.count()).toBe(0)
    expect(CustomViewConfig.content.calls.count()).toBe(1)
    expect(CustomViewConfig.willUnmount.calls.count()).toBe(0)

    resetCounts()
    calendar.unselect()
    expect(CustomViewConfig.didMount.calls.count()).toBe(0)
    expect(CustomViewConfig.content.calls.count()).toBe(1)
    expect(CustomViewConfig.willUnmount.calls.count()).toBe(0)

    resetCounts()
    calendar.destroy()
    expect(CustomViewConfig.didMount.calls.count()).toBe(0)
    expect(CustomViewConfig.content.calls.count()).toBe(0)
    expect(CustomViewConfig.willUnmount.calls.count()).toBe(1)
  })
})
