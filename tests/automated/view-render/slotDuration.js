import * as TimeGridRenderUtils from './TimeGridRenderUtils'


describe('slotDuration', function() {
  pushOptions({
    defaultDate: '2017-07-17',
    defaultView: 'timeGridDay',
    scrollTime: 0,
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false }
  })

  describe('when only major slots', function() {
    pushOptions({
      slotDuration: '01:00',
      slotLabelInterval: '01:00'
    })

    describe('when in alignment with minTime', function() {
      pushOptions({
        minTime: '00:00',
        maxTime: '03:00'
      })
      it('render slots correctly', function() {
        initCalendar()
        expect(TimeGridRenderUtils.getTimeAxisInfo()).toEqual([
          { text: '00:00', isMajor: true },
          { text: '01:00', isMajor: true },
          { text: '02:00', isMajor: true }
        ])
      })
    })

    describe('when out of alignment with minTime', function() {
      pushOptions({
        minTime: '00:20',
        maxTime: '03:20'
      })
      it('render slots correctly', function() {
        initCalendar()
        expect(TimeGridRenderUtils.getTimeAxisInfo()).toEqual([
          { text: '00:20', isMajor: true },
          { text: '01:20', isMajor: true },
          { text: '02:20', isMajor: true }
        ])
      })
    })
  })

  describe('when major and minor slots', function() {
    pushOptions({
      slotDuration: '00:30',
      slotLabelInterval: '01:00'
    })

    describe('when in alignment with minTime', function() {
      pushOptions({
        minTime: '00:00',
        maxTime: '03:00'
      })
      it('render slots correctly', function() {
        initCalendar()
        expect(TimeGridRenderUtils.getTimeAxisInfo()).toEqual([
          { text: '00:00', isMajor: true },
          { text: '', isMajor: false },
          { text: '01:00', isMajor: true },
          { text: '', isMajor: false },
          { text: '02:00', isMajor: true },
          { text: '', isMajor: false }
        ])
      })
    })

    describe('when out of alignment with minTime', function() {
      pushOptions({
        minTime: '00:20',
        maxTime: '03:20'
      })
      it('render slots correctly', function() {
        initCalendar()
        expect(TimeGridRenderUtils.getTimeAxisInfo()).toEqual([
          { text: '00:20', isMajor: true },
          { text: '', isMajor: false },
          { text: '01:20', isMajor: true },
          { text: '', isMajor: false },
          { text: '02:20', isMajor: true },
          { text: '', isMajor: false }
        ])
      })
    })
  })

})
