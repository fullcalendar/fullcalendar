import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'

describe('daygrid view with updated dimensions', () => {
  it('reports correct dateClick after resize', async () => {
    let $wrapper = $(
      '<div><div style="width:auto"></div></div>', // reset width b/c test css hardcodes it
    ).appendTo('body')
    $wrapper.width(200)
    let clickResolve: () => void
    let clickPromise = new Promise<void>((resolve) => {
      clickResolve = resolve
    })

    let calendar = initCalendar({
      initialDate: '2019-04-01',
      initialView: 'dayGridMonth',
      dateClick(info) {
        expect(info.date).toEqualDate('2019-04-02') // a Tues
        $wrapper.remove()
        clickResolve()
      },
    }, $wrapper.children().get(0))

    $wrapper.width(400)
    await waitTimeout()
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    dayGridWrapper.clickDate('2019-04-02')
    await clickPromise
  })
})
