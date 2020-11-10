import { DayGridView, DayTable } from '@fullcalendar/daygrid'
import { ListView } from '@fullcalendar/list'
import { DayTimeColsView, DayTimeCols } from '@fullcalendar/timegrid'

describe('internal View/Grid classes', function() {

  it('are exposed', function() {

    expect(typeof DayTimeColsView).toBe('function')
    expect(typeof DayGridView).toBe('function')
    expect(typeof ListView).toBe('function')

    expect(typeof DayTable).toBe('function')
    expect(typeof DayTimeCols).toBe('function')
  })

})
