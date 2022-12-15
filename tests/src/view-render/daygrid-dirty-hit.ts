import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'

describe('daygrid view with updated dimensions', () => {
  it('reports correct dateClick after resize', (done) => {
    let $wrapper = $(
      '<div><div style="width:auto"></div></div>', // reset width b/c test css hardcodes it
    ).appendTo('body')
    $wrapper.width(200)

    let calendar = initCalendar({
      initialDate: '2019-04-01',
      initialView: 'dayGridMonth',
      dateClick(arg) {
        expect(arg.date).toEqualDate('2019-04-02') // a Tues
        $wrapper.remove()
        done()
      },
    }, $wrapper.children().get(0))

    $wrapper.width(400)
    calendar.updateSize()

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    $(dayGridWrapper.getDayEl('2019-04-02')).simulate('drag') // a click
  })
})
