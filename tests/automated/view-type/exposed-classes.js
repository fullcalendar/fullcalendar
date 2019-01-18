import { BasicView, DayGrid } from 'fullcalendar'
import { ListView } from 'fullcalendar-list'
import { AgendaView, TimeGrid } from 'fullcalendar-agenda'

describe('internal View/Grid classes', function() {

  it('are exposed', function() {

    expect(typeof AgendaView).toBe('function')
    expect(typeof BasicView).toBe('function')
    expect(typeof ListView).toBe('function')

    expect(typeof DayGrid).toBe('function')
    expect(typeof TimeGrid).toBe('function')
  })

})
