
describe('formatDate', function() {

  it('works with no timezone offset', function() {
    let str = FullCalendar.formatDate('2018-09-04', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    expect(str).toBe('September 4, 2018')
  })

  it('works with timezone offset', function() {
    let str = FullCalendar.formatDate('2018-09-04T00:00:00-05:00', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZoneName: 'short',
      timeZone: 'America/New_York', // but with no timeZoneImpl
      omitCommas: true // for cross-browser
    })
    expect(str).toBe('September 4 2018 12:00 AM GMT-5')
  })

})

describe('formatRange', function() {

  it('works with no timezone offset', function() {
    let str = FullCalendar.formatRange('2018-09-04', '2018-10-04', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    expect(str).toBe('September 4 - October 4, 2018')
  })

  it('works with timezone offset', function() {
    let str = FullCalendar.formatRange('2018-09-04T00:00:00-05:00', '2018-10-04T00:00:00-05:00', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZoneName: 'short',
      timeZone: 'America/New_York', // but with no timeZoneImpl
      omitCommas: true // for cross-browser
    })
    expect(str).toBe('September 4 - October 4 2018 12:00 AM GMT-5')
  })

})
