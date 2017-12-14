
describe('Agenda view rendering', function() {
  pushOptions({
    defaultView: 'agendaWeek'
  })

  describe('when LTR', function() {
    pushOptions({
      isRTL: false
    })

    it('renders the axis on the left', function() {
      initCalendar()
      var header = $('.fc-view > table > thead')
      var firstSlat = $('.fc-slats tr:first')
      expect(header.find('.fc-axis')).toBeLeftOf(header.find('.fc-day-header:first'))
      expect($('.fc-day-grid .fc-axis')).toBeLeftOf($('.fc-day-grid .fc-day:first'))
      expect(firstSlat.find('.fc-axis')).toBeLeftOf(firstSlat.find('td:not(.fc-axis)'))
    })
  })

  describe('when RTL', function() {
    pushOptions({
      isRTL: true
    })

    it('renders the axis on the right', function() {
      initCalendar()
      var header = $('.fc-view > table > thead')
      var firstSlat = $('.fc-slats tr:first')
      expect(header.find('.fc-axis')).toBeRightOf(header.find('.fc-day-header:first'))
      expect($('.fc-day-grid .fc-axis')).toBeRightOf($('.fc-day-grid .fc-day:first'))
      expect(firstSlat.find('.fc-axis')).toBeRightOf(firstSlat.find('td:not(.fc-axis)'))
    })
  })
})
