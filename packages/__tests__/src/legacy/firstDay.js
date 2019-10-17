import enGbLocale from '@fullcalendar/core/locales/en-gb'

describe('First Day', function() {

  describe('when using default settings', function() {
    it('should make Sunday the first day of the week', function() {
      initCalendar()
      var dayFirst = $('.fc-day-header')[0]
      expect(dayFirst).toHaveClass('fc-sun')
    })
  })

  describe('when setting firstDay to 0', function() {
    pushOptions({
      firstDay: 0
    })
    it('should make Sunday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-sun')
      expect(daysOfWeek[1]).toHaveClass('fc-mon')
      expect(daysOfWeek[2]).toHaveClass('fc-tue')
      expect(daysOfWeek[3]).toHaveClass('fc-wed')
      expect(daysOfWeek[4]).toHaveClass('fc-thu')
      expect(daysOfWeek[5]).toHaveClass('fc-fri')
      expect(daysOfWeek[6]).toHaveClass('fc-sat')
    })
  })

  describe('when setting firstDay to 1', function() {
    pushOptions({
      firstDay: 1
    })
    it('should make Monday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-mon')
      expect(daysOfWeek[1]).toHaveClass('fc-tue')
      expect(daysOfWeek[2]).toHaveClass('fc-wed')
      expect(daysOfWeek[3]).toHaveClass('fc-thu')
      expect(daysOfWeek[4]).toHaveClass('fc-fri')
      expect(daysOfWeek[5]).toHaveClass('fc-sat')
      expect(daysOfWeek[6]).toHaveClass('fc-sun')
    })
  })

  describe('when setting weekNumberCalculation to ISO', function() {
    pushOptions({
      weekNumberCalculation: 'ISO'
    })
    it('should make Monday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-mon')
      expect(daysOfWeek[1]).toHaveClass('fc-tue')
      expect(daysOfWeek[2]).toHaveClass('fc-wed')
      expect(daysOfWeek[3]).toHaveClass('fc-thu')
      expect(daysOfWeek[4]).toHaveClass('fc-fri')
      expect(daysOfWeek[5]).toHaveClass('fc-sat')
      expect(daysOfWeek[6]).toHaveClass('fc-sun')
    })
  })

  describe('when setting firstDay to 2', function() {
    pushOptions({
      firstDay: 2
    })
    it('should make Tuesday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-tue')
      expect(daysOfWeek[1]).toHaveClass('fc-wed')
      expect(daysOfWeek[2]).toHaveClass('fc-thu')
      expect(daysOfWeek[3]).toHaveClass('fc-fri')
      expect(daysOfWeek[4]).toHaveClass('fc-sat')
      expect(daysOfWeek[5]).toHaveClass('fc-sun')
      expect(daysOfWeek[6]).toHaveClass('fc-mon')
    })
  })

  describe('when setting firstDay to 2 and weekNumberCalculation to ISO', function() {
    pushOptions({
      firstDay: 2,
      weekNumberCalculation: 'ISO'
    })
    it('should make Tuesday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-tue')
      expect(daysOfWeek[1]).toHaveClass('fc-wed')
      expect(daysOfWeek[2]).toHaveClass('fc-thu')
      expect(daysOfWeek[3]).toHaveClass('fc-fri')
      expect(daysOfWeek[4]).toHaveClass('fc-sat')
      expect(daysOfWeek[5]).toHaveClass('fc-sun')
      expect(daysOfWeek[6]).toHaveClass('fc-mon')
    })
  })

  describe('when setting firstDay to 3', function() {
    pushOptions({
      firstDay: 3
    })
    it('should make Wednesday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-wed')
      expect(daysOfWeek[1]).toHaveClass('fc-thu')
      expect(daysOfWeek[2]).toHaveClass('fc-fri')
      expect(daysOfWeek[3]).toHaveClass('fc-sat')
      expect(daysOfWeek[4]).toHaveClass('fc-sun')
      expect(daysOfWeek[5]).toHaveClass('fc-mon')
      expect(daysOfWeek[6]).toHaveClass('fc-tue')
    })
  })

  describe('when setting firstDay to 4', function() {
    pushOptions({
      firstDay: 4
    })
    it('should make Thursday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-thu')
      expect(daysOfWeek[1]).toHaveClass('fc-fri')
      expect(daysOfWeek[2]).toHaveClass('fc-sat')
      expect(daysOfWeek[3]).toHaveClass('fc-sun')
      expect(daysOfWeek[4]).toHaveClass('fc-mon')
      expect(daysOfWeek[5]).toHaveClass('fc-tue')
      expect(daysOfWeek[6]).toHaveClass('fc-wed')
    })
  })

  describe('when setting firstDay to 5', function() {
    pushOptions({
      firstDay: 5
    })
    it('should make Friday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-fri')
      expect(daysOfWeek[1]).toHaveClass('fc-sat')
      expect(daysOfWeek[2]).toHaveClass('fc-sun')
      expect(daysOfWeek[3]).toHaveClass('fc-mon')
      expect(daysOfWeek[4]).toHaveClass('fc-tue')
      expect(daysOfWeek[5]).toHaveClass('fc-wed')
      expect(daysOfWeek[6]).toHaveClass('fc-thu')
    })
  })

  describe('when setting firstDay to 6', function() {
    pushOptions({
      firstDay: 6
    })
    it('should make Saturday the first day of the week', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-sat')
      expect(daysOfWeek[1]).toHaveClass('fc-sun')
      expect(daysOfWeek[2]).toHaveClass('fc-mon')
      expect(daysOfWeek[3]).toHaveClass('fc-tue')
      expect(daysOfWeek[4]).toHaveClass('fc-wed')
      expect(daysOfWeek[5]).toHaveClass('fc-thu')
      expect(daysOfWeek[6]).toHaveClass('fc-fri')
    })
  })

  describe('when new firstDay options are set', function() {
    it('should change the first day of week to Monday', function() {
      initCalendar({
        firstDay: 1
      })
      expect($('.fc-day-header')[0]).toHaveClass('fc-mon')
    })
    it('should change the first day of week to Thursday', function() {
      initCalendar({
        firstDay: 4
      })
      expect($('.fc-day-header')[0]).toHaveClass('fc-thu')
    })
  })

  describe('when first day is set to Tuesday and dir is rtl', function() {
    pushOptions({
      firstDay: 2,
      dir: 'rtl'
    })
    it('should put days mon, sun, sat ...', function() {
      initCalendar()
      var daysOfWeek = $('.fc-day-header')
      expect(daysOfWeek[0]).toHaveClass('fc-mon')
      expect(daysOfWeek[1]).toHaveClass('fc-sun')
      expect(daysOfWeek[2]).toHaveClass('fc-sat')
      expect(daysOfWeek[3]).toHaveClass('fc-fri')
      expect(daysOfWeek[4]).toHaveClass('fc-thu')
      expect(daysOfWeek[5]).toHaveClass('fc-wed')
      expect(daysOfWeek[6]).toHaveClass('fc-tue')
    })
  })

  it('should have a different default value based on the locale', function() {
    initCalendar({
      locale: enGbLocale
    })
    // firstDay will be 1 (Monday) in Great Britain
    var daysOfWeek = $('.fc-day-header')
    expect(daysOfWeek[0]).toHaveClass('fc-mon')
    expect(daysOfWeek[1]).toHaveClass('fc-tue')
    expect(daysOfWeek[2]).toHaveClass('fc-wed')
    expect(daysOfWeek[3]).toHaveClass('fc-thu')
    expect(daysOfWeek[4]).toHaveClass('fc-fri')
    expect(daysOfWeek[5]).toHaveClass('fc-sat')
    expect(daysOfWeek[6]).toHaveClass('fc-sun')
  })

})
