
describe('dayNumbers', function() {
  pushOptions({
    defaultDate: '2018-01-01'
  })

  it('respects locale in month view', function() {
    initCalendar({
      defaultView: 'month',
      locale: 'ar'
    })
    expect($('td[data-date="2018-01-01"]')).toContainText('١') // an Arabic 1
  })

})
