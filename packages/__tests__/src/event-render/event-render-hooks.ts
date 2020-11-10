import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('eventContent', function() {
  pushOptions({
    initialView: 'dayGridMonth',
    initialDate: '2020-06-01',
    events: [
      { title: 'my event', start: '2020-06-01T01:00:00' }
    ]
  })

  it('can inject html content', function() {
    let calendar = initCalendar({
      eventContent(info) {
        return {
          html: `<b>${info.timeText}</b><i>${info.event.title}</i>`
        }
      }
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect(eventEl.querySelector('b').innerHTML).toBe('1a')
    expect(eventEl.querySelector('i').innerHTML).toBe('my event')
  })

  it('can inject text content', function() {
    let calendar = initCalendar({
      eventContent(info) {
        return info.timeText + ' - ' + info.event.title
      }
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect(eventEl.innerHTML).toBe('1a - my event')
  })

  it('will render default if nothing returned', function() {
    let calendar = initCalendar({
      eventContent() {
      }
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]
    expect($(eventEl).text()).toBe('1amy event')
  })

})
